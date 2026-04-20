from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
import logging

from _models import (
    UserCreate, UserLogin, User, UserResponse, TokenResponse,
    OfferCreate, Offer, UniversityCreate, University,
    HousingCreate, Housing, MessageCreate, Message, MessageReply,
    Application, ApplicationCreate, FullApplicationCreate,
    PaymentSettings, ChatMessage, NewsletterSubscribe,
    PasswordResetRequest, PasswordResetConfirm,
    BannerSlidesUpdate,
    TestimonialCreate, Testimonial,
    ContactFormCreate,
    FAQItem, FAQListUpdate,
    DocumentUpdate,
    BlogPostCreate, BlogPostUpdate,
    CommunityPostCreate, CommunityReplyCreate,
    AgentRegister, AgentStudentCreate, AgentStudentUpdate, AgentApplicationCreate,
    PartnerRegister,
)
from _helpers import (
    get_db, hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user, get_principal_admin, get_agent_user, get_partner_user, serialize_doc, security,
    send_notification, broadcast_to_admins,
    generate_verification_code, send_verification_email, send_password_reset_email,
    broadcast_newsletter_offer, broadcast_newsletter_blog,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ============= USER ROUTES =============

@router.post("/user/favorites/{offer_id}")
async def add_to_favorites(offer_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    favorites = current_user.get("favorites", [])
    if offer_id not in favorites:
        favorites.append(offer_id)
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"favorites": favorites}}
        )
    return {"message": "Ajouté aux favoris", "favorites": favorites}


@router.delete("/user/favorites/{offer_id}")
async def remove_from_favorites(offer_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    favorites = current_user.get("favorites", [])
    if offer_id in favorites:
        favorites.remove(offer_id)
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"favorites": favorites}}
        )
    return {"message": "Retiré des favoris", "favorites": favorites}


@router.get("/user/favorites")
async def get_favorites(current_user: dict = Depends(get_current_user)):
    db = get_db()
    favorites = current_user.get("favorites", [])
    if not favorites:
        return []

    offers = await db.offers.find({"id": {"$in": favorites}}, {"_id": 0}).to_list(100)

    valid_ids = [o["id"] for o in offers]
    invalid_ids = [f for f in favorites if f not in valid_ids]

    if invalid_ids:
        new_favorites = [f for f in favorites if f in valid_ids]
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"favorites": new_favorites}}
        )

    return offers


# ============= OFFERS ROUTES =============

@router.get("/offers")
async def get_offers(
    category: Optional[str] = None,
    filter_type: Optional[str] = None,
    search: Optional[str] = None
):
    db = get_db()
    query = {"isActive": True, "$or": [{"partnerId": {"$exists": False}}, {"partnerId": None}, {"isApproved": True}]}

    if category:
        query["category"] = category

    if filter_type:
        if filter_type == "new":
            query["isNew"] = True
        elif filter_type == "fullScholarship":
            query["hasScholarship"] = True
            query["isPartialScholarship"] = False
            query["scholarshipTuition"] = 0
        elif filter_type == "partialScholarship":
            query["isPartialScholarship"] = True
        elif filter_type == "selfFinanced":
            query["isSelfFinanced"] = True
        elif filter_type == "online":
            query["isOnline"] = True

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"university": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
            {"categoryLabel": {"$regex": search, "$options": "i"}}
        ]

    offers = await db.offers.find(query, {"_id": 0}).sort("createdAt", -1).to_list(100)

    offer_ids = [o["id"] for o in offers]
    if offer_ids:
        pipeline = [
            {"$match": {"favorites": {"$in": offer_ids}}},
            {"$unwind": "$favorites"},
            {"$match": {"favorites": {"$in": offer_ids}}},
            {"$group": {"_id": "$favorites", "count": {"$sum": 1}}}
        ]
        fav_counts = {}
        async for doc in db.users.aggregate(pipeline):
            fav_counts[doc["_id"]] = doc["count"]

        for offer in offers:
            fav_count = fav_counts.get(offer["id"], 0)
            views = offer.get("views", 0)
            fav_bonus = min(fav_count * 0.1, 0.5)
            view_bonus = min(views / 50000, 0.5)
            offer["rating"] = round(min(4.0 + fav_bonus + view_bonus, 5.0), 1)
            offer["favoritesCount"] = fav_count

    return offers


@router.get("/offers/{offer_id}")
async def get_offer(offer_id: str):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")

    await db.offers.update_one({"id": offer_id}, {"$inc": {"views": 1}})

    return offer


@router.get("/offers/{offer_id}/deadline-status")
async def check_deadline_status(offer_id: str):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")

    deadline_str = offer.get("deadline", "")

    month_map = {
        "janvier": 1, "février": 2, "mars": 3, "avril": 4,
        "mai": 5, "juin": 6, "juillet": 7, "août": 8,
        "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12
    }

    is_open = True
    try:
        lower = deadline_str.lower().strip()
        if "continue" in lower or "flexible" in lower or "ouvert" in lower or not lower:
            is_open = True
        else:
            parts = lower.replace("1er", "1").split()
            if len(parts) >= 3:
                day = int(parts[0])
                month = month_map.get(parts[1], 1)
                year = int(parts[2])
                deadline_date = datetime(year, month, day, tzinfo=timezone.utc)
                is_open = datetime.now(timezone.utc) <= deadline_date
    except Exception:
        is_open = True

    return {
        "deadline": deadline_str,
        "isOpen": is_open,
        "offerId": offer_id
    }


@router.get("/offers/{offer_id}/rating")
async def get_offer_rating(offer_id: str):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    favorites_count = await db.users.count_documents({"favorites": offer_id})
    views = offer.get("views", 0)
    fav_bonus = min(favorites_count * 0.1, 0.5)
    view_bonus = min(views / 50000, 0.5)
    computed_rating = round(min(4.0 + fav_bonus + view_bonus, 5.0), 1)
    await db.offers.update_one({"id": offer_id}, {"$set": {"rating": computed_rating}})
    return {"offerId": offer_id, "rating": computed_rating, "favorites": favorites_count, "views": views}


# ============= UNIVERSITIES ROUTES =============

@router.get("/universities")
async def get_universities(country: Optional[str] = None):
    db = get_db()
    query = {"isActive": True, "$or": [{"partnerId": {"$exists": False}}, {"partnerId": None}, {"isApproved": True}]}
    if country:
        query["countryCode"] = country

    universities = await db.universities.find(query, {"_id": 0}).to_list(100)
    return universities


@router.get("/universities/{uni_id}")
async def get_university(uni_id: str):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Universite non trouvee")

    await db.universities.update_one({"id": uni_id}, {"$inc": {"views": 1}})
    uni["views"] = uni.get("views", 0) + 1
    return uni


@router.post("/universities/{uni_id}/like")
async def like_university(uni_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id})
    if not uni:
        raise HTTPException(status_code=404, detail="Universite non trouvee")

    existing = await db.university_likes.find_one({"universityId": uni_id, "userId": current_user["id"]})
    if existing:
        await db.university_likes.delete_one({"_id": existing["_id"]})
        await db.universities.update_one({"id": uni_id}, {"$inc": {"likes": -1}})
        return {"liked": False, "likes": max(uni.get("likes", 1) - 1, 0)}
    else:
        await db.university_likes.insert_one({
            "universityId": uni_id, "userId": current_user["id"],
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
        await db.universities.update_one({"id": uni_id}, {"$inc": {"likes": 1}})
        return {"liked": True, "likes": uni.get("likes", 0) + 1}


@router.get("/universities/{uni_id}/like-status")
async def get_like_status(uni_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    existing = await db.university_likes.find_one({"universityId": uni_id, "userId": current_user["id"]})
    return {"liked": existing is not None}


@router.get("/universities/{uni_id}/rating")
async def get_university_rating(uni_id: str):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Universite non trouvee")
    views = uni.get("views", 0)
    likes = uni.get("likes", 0)
    score = min((views / 5000) + (likes / 50), 5.0)
    computed_rating = round(max(score, 0.0), 1)
    await db.universities.update_one({"id": uni_id}, {"$set": {"rating": computed_rating}})
    return {"universityId": uni_id, "rating": computed_rating, "views": views, "likes": likes}


# ============= HOUSING ROUTES =============

@router.get("/housing")
async def get_housing():
    db = get_db()
    housing = await db.housing.find({"isActive": True}, {"_id": 0}).to_list(100)
    return housing


@router.get("/housing-all")
async def get_all_housing():
    """
    Returns a combined, normalized list of admin-managed housing AND partner housing.
    Normalized format for the frontend:
    { id, title, propertyType, city, country, location, isAvailable, images, amenities, price, priceRange, pricePeriod, source }
    """
    db = get_db()

    # Admin housing (from housing collection)
    admin_items = await db.housing.find({"isActive": True}, {"_id": 0}).to_list(200)
    normalized_admin = []
    for h in admin_items:
        normalized_admin.append({
            "id": h.get("id"),
            "title": h.get("type", ""),
            "propertyType": h.get("type", ""),
            "city": h.get("city", ""),
            "country": h.get("country", ""),
            "location": h.get("location", ""),
            "description": h.get("description", ""),
            "isAvailable": h.get("isAvailable", True),
            "images": [h["image"]] if h.get("image") else [],
            "amenities": h.get("features") or h.get("amenities") or [],
            "price": None,
            "priceRange": h.get("priceRange", ""),
            "pricePeriod": "mois",
            "source": "admin",
            "createdAt": h.get("createdAt", ""),
        })

    # Partner housing (from logement_properties collection)
    partner_items = await db.logement_properties.find({"isApproved": True, "isAvailable": True}, {"_id": 0}).to_list(200)
    normalized_partner = []
    for p in partner_items:
        normalized_partner.append({
            "id": p.get("id"),
            "title": p.get("title", ""),
            "propertyType": p.get("propertyType", ""),
            "city": p.get("city", ""),
            "country": p.get("country", ""),
            "location": p.get("address", ""),
            "description": p.get("description", ""),
            "isAvailable": p.get("isAvailable", True),
            "images": p.get("images") or [],
            "amenities": p.get("amenities") or [],
            "price": p.get("pricePerMonth") or p.get("price"),
            "priceRange": f"{p.get('pricePerMonth', '')} / mois" if p.get('pricePerMonth') else "",
            "pricePeriod": p.get("pricePeriod", "mois"),
            "rooms": p.get("rooms"),
            "surface": p.get("surface"),
            "companyName": p.get("companyName", "") or p.get("partnerName", ""),
            "source": "partner",
            "partnerId": p.get("partnerId"),
            "createdAt": p.get("createdAt", ""),
        })

    combined = normalized_admin + normalized_partner
    # Sort by creation date descending (most recent first)
    combined.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return combined


# ============= MESSAGES ROUTES =============

@router.post("/messages")
async def create_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    message = Message(
        senderId=current_user["id"],
        senderName=f"{current_user['firstName']} {current_user['lastName']}",
        senderEmail=current_user["email"],
        subject=message_data.subject,
        content=message_data.content,
        offerId=message_data.offerId,
        attachments=message_data.attachments or []
    )

    await db.messages.insert_one(serialize_doc(message.model_dump()))
    return {"message": "Message envoyé avec succès", "id": message.id}


@router.get("/messages")
async def get_my_messages(current_user: dict = Depends(get_current_user)):
    db = get_db()
    messages = await db.messages.find(
        {"senderId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return messages


@router.post("/messages/{message_id}/reply")
async def user_reply_message(message_id: str, reply: MessageReply, current_user: dict = Depends(get_current_user)):
    db = get_db()
    message = await db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    if message["senderId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    reply_data = {
        "content": reply.content,
        "attachments": reply.attachments or [],
        "isAdmin": False,
        "senderName": f"{current_user['firstName']} {current_user['lastName']}",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    await db.messages.update_one(
        {"id": message_id},
        {"$push": {"replies": reply_data}, "$set": {"isRead": False}}
    )

    await broadcast_to_admins({
        "type": "message_reply",
        "title": "Nouvelle réponse",
        "message": f"{current_user['firstName']} a répondu à un message",
        "data": {"messageId": message_id}
    })

    return {"message": "Réponse envoyée"}


# ============= FILE UPLOAD =============

@router.get("/upload/signature")
async def get_upload_signature(current_user: dict = Depends(get_current_user)):
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
    api_key = os.environ.get('CLOUDINARY_API_KEY')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET')

    if not all([cloud_name, api_key, api_secret]):
        raise HTTPException(status_code=500, detail="Cloudinary non configuré")

    import cloudinary.utils
    import time
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": "winners_consulting",
    }
    signature = cloudinary.utils.api_sign_request(params, api_secret)
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": cloud_name,
        "api_key": api_key,
        "folder": "winners_consulting"
    }


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
    api_key = os.environ.get('CLOUDINARY_API_KEY')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET')

    if cloud_name and api_key and api_secret:
        import cloudinary
        import cloudinary.uploader
        from io import BytesIO
        cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret)
        try:
            contents = await file.read()
            # PDFs and documents must use resource_type="raw" to be served correctly
            file_ext = os.path.splitext(file.filename)[1].lower()
            is_pdf_or_doc = file_ext in ('.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv')
            res_type = "raw" if is_pdf_or_doc else "auto"

            upload_result = cloudinary.uploader.upload(
                BytesIO(contents),
                folder="winners_consulting",
                resource_type=res_type,
                use_filename=True,
                unique_filename=True
            )
            return {
                "url": upload_result['secure_url'],
                "filename": file.filename,
                "public_id": upload_result['public_id'],
                "format": upload_result.get('format', ''),
                "size": upload_result.get('bytes', 0)
            }
        except Exception as e:
            logger.error(f"Upload error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Erreur Cloudinary: {str(e)}")
    else:
        import shutil
        upload_dir = "/app/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_url = f"/api/files/{unique_filename}"
        return {"url": file_url, "filename": file.filename}


# ============= APPLICATIONS ROUTES =============

@router.post("/applications")
async def create_application(app_data: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    existing = await db.applications.find_one({
        "userId": current_user["id"],
        "offerId": app_data.offerId
    })
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")

    application = Application(
        userId=current_user["id"],
        userName=f"{current_user['firstName']} {current_user['lastName']}",
        userEmail=current_user["email"],
        offerId=app_data.offerId,
        offerTitle=app_data.offerTitle
    )

    await db.applications.insert_one(serialize_doc(application.model_dump()))
    return {"message": "Candidature soumise avec succès", "id": application.id}


@router.get("/applications")
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    applications = await db.applications.find(
        {"userId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return applications


@router.post("/applications/full")
async def create_full_application(app_data: FullApplicationCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    existing = await db.applications.find_one({
        "userId": current_user["id"],
        "offerId": app_data.offerId
    })
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")

    application = Application(
        userId=current_user["id"],
        userName=f"{current_user['firstName']} {current_user['lastName']}",
        userEmail=current_user["email"],
        paymentStatus="submitted",
        status="pending",
        **app_data.model_dump()
    )

    await db.applications.insert_one(serialize_doc(application.model_dump()))

    await broadcast_to_admins({
        "type": "new_application",
        "title": "Nouvelle candidature",
        "message": f"{app_data.firstName} {app_data.lastName} a postulé à {app_data.offerTitle}",
        "data": {"applicationId": application.id}
    })

    return {"message": "Candidature soumise avec succès", "id": application.id}


@router.get("/applications/{app_id}")
async def get_application_details(app_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    if application["userId"] != current_user["id"] and current_user.get("role") not in ["admin", "admin_principal", "admin_secondaire"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    return application


# ============= NOTIFICATIONS =============

@router.get("/notifications")
async def get_notifications(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    notifications = await db.notifications.find(
        {"userId": user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return notifications


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    await db.notifications.update_one(
        {"id": notification_id, "userId": user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marquée comme lue"}


@router.put("/notifications/read-all")
async def mark_all_notifications_read(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    await db.notifications.update_many(
        {"userId": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "Toutes les notifications marquées comme lues"}


@router.get("/notifications/unread-count")
async def get_unread_count(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    count = await db.notifications.count_documents({"userId": user["id"], "read": False})
    return {"count": count}


# ============= CHAT ROUTES =============

@router.post("/chat/start")
async def start_chat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()

    existing = await db.chats.find_one({"userId": user["id"], "status": "active"}, {"_id": 0})
    if existing:
        return existing

    chat = {
        "id": str(uuid.uuid4()),
        "userId": user["id"],
        "userName": f"{user['firstName']} {user['lastName']}",
        "userEmail": user["email"],
        "status": "active",
        "messages": [],
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "lastMessageAt": datetime.now(timezone.utc).isoformat()
    }
    await db.chats.insert_one(chat)

    await broadcast_to_admins({
        "type": "new_chat",
        "title": "Nouveau chat",
        "message": f"{user['firstName']} a démarré une conversation",
        "data": {"chatId": chat["id"]}
    })

    return {k: v for k, v in chat.items() if k != "_id"}


@router.get("/chat/me")
async def get_my_chat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    chat = await db.chats.find_one({"userId": user["id"], "status": "active"}, {"_id": 0})
    return chat


@router.post("/chat/{chat_id}/message")
async def send_chat_message(chat_id: str, message: ChatMessage, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()

    chat = await db.chats.find_one({"id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")

    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")

    msg = {
        "id": str(uuid.uuid4()),
        "senderId": user["id"],
        "senderName": f"{user['firstName']} {user['lastName']}",
        "isAdmin": user["role"] == "admin",
        "content": message.content,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    await db.chats.update_one(
        {"id": chat_id},
        {"$push": {"messages": msg}, "$set": {"lastMessageAt": msg["timestamp"]}}
    )

    if user["role"] == "admin":
        await send_notification(
            user_id=chat["userId"],
            notification_type="chat_reply",
            title="Nouveau message",
            message="Un conseiller a répondu à votre message",
            data={"chatId": chat_id}
        )

    return msg


@router.get("/chat/{chat_id}/messages")
async def get_chat_messages(chat_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()

    chat = await db.chats.find_one({"id": chat_id}, {"_id": 0})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")

    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")

    return chat.get("messages", [])


@router.put("/chat/{chat_id}/close")
async def close_chat(chat_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()

    chat = await db.chats.find_one({"id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")

    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")

    await db.chats.update_one({"id": chat_id}, {"$set": {"status": "closed"}})
    return {"message": "Chat fermé"}



# ============= BLOG - PUBLIC =============

# ============= BLOG - PUBLIC =============

@router.get("/blog")
async def get_blog_posts(category: str = None, limit: int = 20, skip: int = 0):
    db = get_db()
    query = {"published": True}
    if category and category != "all":
        query["category"] = category
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.blog_posts.count_documents(query)
    return {"posts": posts, "total": total}


@router.get("/blog/{post_id}")
async def get_blog_post(post_id: str):
    db = get_db()
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    await db.blog_posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    post["views"] = post.get("views", 0) + 1
    return post



# ============= COMMUNITY =============

# ============= COMMUNITY - PUBLIC =============

@router.get("/community")
async def get_community_posts(category: str = None, limit: int = 20, skip: int = 0):
    db = get_db()
    query = {"deleted": {"$ne": True}}
    if category and category != "all":
        query["category"] = category
    posts = await db.community_posts.find(query, {"_id": 0}).sort([("pinned", -1), ("createdAt", -1)]).skip(skip).limit(limit).to_list(limit)
    total = await db.community_posts.count_documents(query)
    return {"posts": posts, "total": total}


@router.get("/community/{post_id}")
async def get_community_post(post_id: str):
    db = get_db()
    post = await db.community_posts.find_one({"id": post_id, "deleted": {"$ne": True}}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Discussion non trouvée")
    replies = await db.community_replies.find({"postId": post_id, "deleted": {"$ne": True}}, {"_id": 0}).sort("createdAt", 1).to_list(200)
    await db.community_posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    post["views"] = post.get("views", 0) + 1
    post["replies"] = replies
    return post


# ============= COMMUNITY - USER =============

@router.post("/community")
async def create_community_post(post: CommunityPostCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    post_data = {
        "id": str(uuid.uuid4()),
        **post.dict(),
        "userId": current_user["id"],
        "userName": f"{current_user['firstName']} {current_user['lastName']}",
        "likes": [],
        "likeCount": 0,
        "replyCount": 0,
        "views": 0,
        "pinned": False,
        "deleted": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.community_posts.insert_one(post_data)
    del post_data["_id"]
    return post_data


@router.post("/community/{post_id}/reply")
async def create_community_reply(post_id: str, reply: CommunityReplyCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    post = await db.community_posts.find_one({"id": post_id, "deleted": {"$ne": True}})
    if not post:
        raise HTTPException(status_code=404, detail="Discussion non trouvée")
    reply_data = {
        "id": str(uuid.uuid4()),
        "postId": post_id,
        "content": reply.content,
        "userId": current_user["id"],
        "userName": f"{current_user['firstName']} {current_user['lastName']}",
        "likes": [],
        "likeCount": 0,
        "deleted": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.community_replies.insert_one(reply_data)
    await db.community_posts.update_one({"id": post_id}, {"$inc": {"replyCount": 1}})
    del reply_data["_id"]
    return reply_data


@router.post("/community/{post_id}/like")
async def toggle_like_community_post(post_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    post = await db.community_posts.find_one({"id": post_id}, {"_id": 0, "likes": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Discussion non trouvée")
    likes = post.get("likes", [])
    if current_user["id"] in likes:
        likes.remove(current_user["id"])
    else:
        likes.append(current_user["id"])
    await db.community_posts.update_one({"id": post_id}, {"$set": {"likes": likes, "likeCount": len(likes)}})
    return {"liked": current_user["id"] in likes, "likeCount": len(likes)}


@router.post("/community/replies/{reply_id}/like")
async def toggle_like_community_reply(reply_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    reply = await db.community_replies.find_one({"id": reply_id}, {"_id": 0, "likes": 1})
    if not reply:
        raise HTTPException(status_code=404, detail="Réponse non trouvée")
    likes = reply.get("likes", [])
    if current_user["id"] in likes:
        likes.remove(current_user["id"])
    else:
        likes.append(current_user["id"])
    await db.community_replies.update_one({"id": reply_id}, {"$set": {"likes": likes, "likeCount": len(likes)}})
    return {"liked": current_user["id"] in likes, "likeCount": len(likes)}



# ============= BANNER SLIDES (PUBLIC) =============

@router.get("/site-settings/banners")
async def get_banners():
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_banners"}, {"_id": 0})
    if not doc:
        return {"slides": []}
    return {"slides": doc.get("slides", [])}


@router.get("/admin/site-settings/banners")

# ============= TESTIMONIALS =============

@router.get("/testimonials")
async def get_testimonials():
    db = get_db()
    testimonials = await db.testimonials.find(
        {"status": "approved"}, {"_id": 0}
    ).sort("createdAt", -1).to_list(50)
    return testimonials


@router.post("/testimonials")
async def create_testimonial(data: TestimonialCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    existing = await db.testimonials.find_one({"userId": current_user["id"], "status": {"$in": ["pending", "approved"]}})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez deja soumis un temoignage")

    testimonial = Testimonial(
        userId=current_user["id"],
        userName=f"{current_user['firstName']} {current_user['lastName']}",
        userCountry=current_user.get("country", ""),
        text=data.text,
        program=data.program,
        rating=data.rating,
        status="pending"
    )
    await db.testimonials.insert_one(serialize_doc(testimonial.model_dump()))
    return {"message": "Temoignage soumis, en attente de validation", "id": testimonial.id}


@router.get("/testimonials/mine")
async def get_my_testimonial(current_user: dict = Depends(get_current_user)):
    db = get_db()
    testimonial = await db.testimonials.find_one({"userId": current_user["id"]}, {"_id": 0})
    return testimonial


@router.get("/admin/testimonials")
async def admin_get_testimonials(admin: dict = Depends(get_admin_user)):
    db = get_db()
    testimonials = await db.testimonials.find({}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return testimonials


@router.put("/admin/testimonials/{testimonial_id}/approve")
async def admin_approve_testimonial(testimonial_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.testimonials.update_one({"id": testimonial_id}, {"$set": {"status": "approved"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Temoignage non trouve")
    return {"message": "Temoignage approuve"}


@router.put("/admin/testimonials/{testimonial_id}/reject")
async def admin_reject_testimonial(testimonial_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.testimonials.update_one({"id": testimonial_id}, {"$set": {"status": "rejected"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Temoignage non trouve")
    return {"message": "Temoignage rejete"}


@router.delete("/admin/testimonials/{testimonial_id}")
async def admin_delete_testimonial(testimonial_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Temoignage non trouve")
    return {"message": "Temoignage supprime"}



# ============= CONTACT FORM =============

@router.post("/contact")
async def submit_contact_form(data: ContactFormCreate):
    db = get_db()
    contact = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "phone": data.phone or "",
        "service": data.service or "",
        "message": data.message,
        "isRead": False,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(contact)
    await broadcast_to_admins({
        "type": "new_contact",
        "title": "Nouveau message de contact",
        "message": f"{data.name} a envoye un message via le formulaire de contact"
    })
    return {"message": "Message envoye avec succes"}



# ============= FAQ =============

@router.get("/faqs")
async def get_faqs():
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_faqs"}, {"_id": 0})
    if not doc:
        return {"faqs": []}
    return {"faqs": doc.get("faqs", [])}



# ============= INSTITUTIONAL PAGES (PUBLIC) =============

@router.get("/pages/{slug}")
async def get_page(slug: str):
    db = get_db()
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if not page:
        if slug in DEFAULT_PAGES:
            default = {**DEFAULT_PAGES[slug], "updatedAt": datetime.now(timezone.utc).isoformat()}
            await db.pages.insert_one(default)
            return {k: v for k, v in default.items() if k != "_id"}
        raise HTTPException(status_code=404, detail="Page non trouvee")
    return page




# ============= CERTIFICATES & ADMISSIONS (PUBLIC) =============

@router.get("/certificates")
async def get_certificates():
    db = get_db()
    items = await db.certificates.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return items


@router.get("/admissions")
async def get_admissions():
    db = get_db()
    items = await db.admissions.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return items
