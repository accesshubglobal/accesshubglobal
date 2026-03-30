from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
import asyncio
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
)
from _helpers import (
    get_db, hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user, get_principal_admin, get_agent_user, serialize_doc, security,
    send_notification, broadcast_to_admins,
    generate_verification_code, send_verification_email, send_password_reset_email,
    broadcast_newsletter_offer, broadcast_newsletter_blog,
)

logger = logging.getLogger(__name__)

api_router = APIRouter()


# ============= ROOT =============

@api_router.get("/")
async def root():
    return {"message": "AccessHub Global API", "status": "ok"}


# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    db = get_db()
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est deja utilise")

    user = User(
        email=user_data.email,
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        phone=user_data.phone
    )

    user_dict = serialize_doc(user.model_dump())
    user_dict["password"] = hash_password(user_data.password)
    user_dict["emailVerified"] = False

    await db.users.insert_one(user_dict)

    # Send verification email
    code = generate_verification_code()
    await db.email_verifications.insert_one({
        "userId": user.id,
        "email": user_data.email,
        "code": code,
        "expiresAt": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
        "used": False,
    })
    await send_verification_email(user_data.email, code)

    access_token = create_access_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            firstName=user.firstName,
            lastName=user.lastName,
            phone=user.phone,
            role=user.role,
            isActive=user.isActive,
            favorites=user.favorites,
            emailVerified=False,
        )
    )


@api_router.post("/auth/verify-email")
async def verify_email(data: dict):
    db = get_db()
    email = data.get("email", "")
    code = data.get("code", "")
    if not email or not code:
        raise HTTPException(status_code=400, detail="Email et code requis")

    verification = await db.email_verifications.find_one({
        "email": email, "code": code, "used": False
    })
    if not verification:
        raise HTTPException(status_code=400, detail="Code invalide")

    expires = verification.get("expiresAt", "")
    if expires:
        exp_dt = datetime.fromisoformat(expires.replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > exp_dt:
            raise HTTPException(status_code=400, detail="Code expire, veuillez en demander un nouveau")

    await db.email_verifications.update_one({"_id": verification["_id"]}, {"$set": {"used": True}})
    await db.users.update_one({"email": email}, {"$set": {"emailVerified": True}})

    return {"message": "Email verifie avec succes"}


@api_router.post("/auth/resend-verification")
async def resend_verification(data: dict):
    db = get_db()
    email = data.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="Email requis")

    user = await db.users.find_one({"email": email})
    if not user:
        return {"message": "Si cet email existe, un nouveau code sera envoye"}

    if user.get("emailVerified", False):
        return {"message": "Email deja verifie"}

    # Invalidate old codes
    await db.email_verifications.update_many({"email": email, "used": False}, {"$set": {"used": True}})

    code = generate_verification_code()
    await db.email_verifications.insert_one({
        "userId": user["id"],
        "email": email,
        "code": code,
        "expiresAt": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
        "used": False,
    })
    await send_verification_email(email, code)

    return {"message": "Nouveau code envoye"}



@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    if not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    if not user.get("isActive", True):
        raise HTTPException(status_code=401, detail="Compte désactivé")

    access_token = create_access_token({"sub": user["id"]})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            firstName=user["firstName"],
            lastName=user["lastName"],
            phone=user.get("phone"),
            role=user.get("role", "user"),
            isActive=user.get("isActive", True),
            favorites=user.get("favorites", []),
            isApproved=user.get("isApproved"),
            company=user.get("company"),
            emailVerified=user.get("emailVerified", True),
        )
    )


@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        firstName=current_user["firstName"],
        lastName=current_user["lastName"],
        phone=current_user.get("phone"),
        role=current_user.get("role", "user"),
        isActive=current_user.get("isActive", True),
        favorites=current_user.get("favorites", []),
        isApproved=current_user.get("isApproved"),
        company=current_user.get("company"),
        emailVerified=current_user.get("emailVerified", True),
    )


# ============= PASSWORD RESET =============

@api_router.post("/auth/password-reset-request")
async def request_password_reset(request: PasswordResetRequest):
    db = get_db()
    user = await db.users.find_one({"email": request.email})
    if not user:
        return {"message": "Si cet email existe, un code de reinitialisation sera envoye"}

    # Invalidate old codes
    await db.password_resets.update_many({"email": request.email, "used": False}, {"$set": {"used": True}})

    code = generate_verification_code()
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.password_resets.insert_one({
        "token": code,
        "userId": user["id"],
        "email": request.email,
        "expiresAt": expires.isoformat(),
        "used": False
    })

    await send_password_reset_email(request.email, code)

    return {"message": "Si cet email existe, un code de reinitialisation sera envoye"}


@api_router.get("/auth/password-reset-verify/{token}")
async def verify_reset_token(token: str):
    db = get_db()
    reset = await db.password_resets.find_one({"token": token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Code invalide ou expire")

    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Code expire")

    return {"valid": True, "email": reset["email"]}


@api_router.post("/auth/password-reset")
async def reset_password(request: PasswordResetConfirm):
    db = get_db()
    reset = await db.password_resets.find_one({"token": request.token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Code invalide ou expire")

    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Code expire")

    hashed = hash_password(request.newPassword)
    await db.users.update_one({"id": reset["userId"]}, {"$set": {"password": hashed}})

    await db.password_resets.update_one({"token": request.token}, {"$set": {"used": True}})

    return {"message": "Mot de passe mis a jour avec succes"}


# ============= USER ROUTES =============

@api_router.post("/user/favorites/{offer_id}")
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


@api_router.delete("/user/favorites/{offer_id}")
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


@api_router.get("/user/favorites")
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

@api_router.get("/offers")
async def get_offers(
    category: Optional[str] = None,
    filter_type: Optional[str] = None,
    search: Optional[str] = None
):
    db = get_db()
    query = {"isActive": True}

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


@api_router.get("/offers/{offer_id}")
async def get_offer(offer_id: str):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")

    await db.offers.update_one({"id": offer_id}, {"$inc": {"views": 1}})

    return offer


@api_router.get("/offers/{offer_id}/deadline-status")
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


@api_router.get("/offers/{offer_id}/rating")
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

@api_router.get("/universities")
async def get_universities(country: Optional[str] = None):
    db = get_db()
    query = {"isActive": True}
    if country:
        query["countryCode"] = country

    universities = await db.universities.find(query, {"_id": 0}).to_list(100)
    return universities


@api_router.get("/universities/{uni_id}")
async def get_university(uni_id: str):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Universite non trouvee")

    await db.universities.update_one({"id": uni_id}, {"$inc": {"views": 1}})
    uni["views"] = uni.get("views", 0) + 1
    return uni


@api_router.post("/universities/{uni_id}/like")
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


@api_router.get("/universities/{uni_id}/like-status")
async def get_like_status(uni_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    existing = await db.university_likes.find_one({"universityId": uni_id, "userId": current_user["id"]})
    return {"liked": existing is not None}


@api_router.get("/universities/{uni_id}/rating")
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

@api_router.get("/housing")
async def get_housing():
    db = get_db()
    housing = await db.housing.find({"isActive": True}, {"_id": 0}).to_list(100)
    return housing


# ============= MESSAGES ROUTES =============

@api_router.post("/messages")
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


@api_router.get("/messages")
async def get_my_messages(current_user: dict = Depends(get_current_user)):
    db = get_db()
    messages = await db.messages.find(
        {"senderId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return messages


@api_router.post("/messages/{message_id}/reply")
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

@api_router.get("/upload/signature")
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


@api_router.post("/upload")
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
            upload_result = cloudinary.uploader.upload(
                BytesIO(contents),
                folder="winners_consulting",
                resource_type="auto",
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

@api_router.post("/applications")
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


@api_router.get("/applications")
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    applications = await db.applications.find(
        {"userId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return applications


@api_router.post("/applications/full")
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


@api_router.get("/applications/{app_id}")
async def get_application_details(app_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    if application["userId"] != current_user["id"] and current_user.get("role") not in ["admin", "admin_principal", "admin_secondaire"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    return application


# ============= NOTIFICATIONS =============

@api_router.get("/notifications")
async def get_notifications(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    notifications = await db.notifications.find(
        {"userId": user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return notifications


@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    await db.notifications.update_one(
        {"id": notification_id, "userId": user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marquée comme lue"}


@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    await db.notifications.update_many(
        {"userId": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "Toutes les notifications marquées comme lues"}


@api_router.get("/notifications/unread-count")
async def get_unread_count(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    count = await db.notifications.count_documents({"userId": user["id"], "read": False})
    return {"count": count}


# ============= CHAT ROUTES =============

@api_router.post("/chat/start")
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


@api_router.get("/chat/me")
async def get_my_chat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()
    chat = await db.chats.find_one({"userId": user["id"], "status": "active"}, {"_id": 0})
    return chat


@api_router.post("/chat/{chat_id}/message")
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


@api_router.get("/chat/{chat_id}/messages")
async def get_chat_messages(chat_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    db = get_db()

    chat = await db.chats.find_one({"id": chat_id}, {"_id": 0})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")

    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")

    return chat.get("messages", [])


@api_router.put("/chat/{chat_id}/close")
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


# ============= ADMIN - USERS =============

@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    db = get_db()
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users


@api_router.put("/admin/users/{user_id}/toggle-status")
async def admin_toggle_user_status(user_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    new_status = not user.get("isActive", True)
    await db.users.update_one({"id": user_id}, {"$set": {"isActive": new_status}})
    return {"message": "Statut modifié", "isActive": new_status}


@api_router.put("/admin/users/{user_id}/make-admin")
async def admin_make_admin(user_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    await db.users.update_one({"id": user_id}, {"$set": {"role": "admin_principal"}})
    return {"message": "Utilisateur promu administrateur principal"}


@api_router.put("/admin/users/{user_id}/set-role")
async def admin_set_role(user_id: str, role: str, admin: dict = Depends(get_principal_admin)):
    if role not in ("user", "admin_principal", "admin_secondary"):
        raise HTTPException(status_code=400, detail="Rôle invalide")
    db = get_db()
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas modifier votre propre rôle")
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    role_labels = {"user": "utilisateur", "admin_principal": "admin principal", "admin_secondary": "admin secondaire"}
    return {"message": f"Rôle modifié en {role_labels.get(role, role)}"}


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    if user.get("role") in ("admin", "admin_principal") and admin.get("role") != "admin_principal" and admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Seul un admin principal peut supprimer un autre admin principal")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé"}


# ============= ADMIN - OFFERS =============

@api_router.get("/admin/offers")
async def admin_get_offers(admin: dict = Depends(get_admin_user)):
    db = get_db()
    offers = await db.offers.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return offers


@api_router.post("/admin/offers")
async def admin_create_offer(offer_data: OfferCreate, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    db = get_db()
    offer = Offer(**offer_data.model_dump())
    offer_dict = serialize_doc(offer.model_dump())
    await db.offers.insert_one(offer_dict)
    background_tasks.add_task(broadcast_newsletter_offer, offer.model_dump())
    return {"message": "Offre créée avec succès", "id": offer.id}


@api_router.put("/admin/offers/{offer_id}")
async def admin_update_offer(offer_id: str, offer_data: OfferCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    update_data = offer_data.model_dump()
    await db.offers.update_one({"id": offer_id}, {"$set": update_data})
    return {"message": "Offre mise à jour"}


@api_router.delete("/admin/offers/{offer_id}")
async def admin_delete_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return {"message": "Offre supprimée"}


# ============= ADMIN - UNIVERSITIES =============

@api_router.get("/admin/universities")
async def admin_get_universities(admin: dict = Depends(get_admin_user)):
    db = get_db()
    universities = await db.universities.find({}, {"_id": 0}).to_list(1000)
    return universities


@api_router.post("/admin/universities")
async def admin_create_university(uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    university = University(**uni_data.model_dump())
    await db.universities.insert_one(serialize_doc(university.model_dump()))
    return {"message": "Université créée avec succès", "id": university.id}


@api_router.put("/admin/universities/{uni_id}")
async def admin_update_university(uni_id: str, uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.universities.update_one({"id": uni_id}, {"$set": uni_data.model_dump()})
    return {"message": "Université mise à jour"}


@api_router.delete("/admin/universities/{uni_id}")
async def admin_delete_university(uni_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.universities.delete_one({"id": uni_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    return {"message": "Université supprimée"}


# ============= ADMIN - HOUSING =============

@api_router.get("/admin/housing")
async def admin_get_housing(admin: dict = Depends(get_admin_user)):
    db = get_db()
    housing = await db.housing.find({}, {"_id": 0}).to_list(1000)
    return housing


@api_router.post("/admin/housing")
async def admin_create_housing(housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    housing = Housing(**housing_data.model_dump())
    await db.housing.insert_one(serialize_doc(housing.model_dump()))
    return {"message": "Logement créé avec succès", "id": housing.id}


@api_router.put("/admin/housing/{housing_id}")
async def admin_update_housing(housing_id: str, housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.housing.update_one({"id": housing_id}, {"$set": housing_data.model_dump()})
    return {"message": "Logement mis à jour"}


@api_router.delete("/admin/housing/{housing_id}")
async def admin_delete_housing(housing_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.housing.delete_one({"id": housing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Logement non trouvé")
    return {"message": "Logement supprimé"}


# ============= ADMIN - MESSAGES =============

@api_router.get("/admin/messages")
async def admin_get_messages(admin: dict = Depends(get_admin_user)):
    db = get_db()
    messages = await db.messages.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return messages


@api_router.put("/admin/messages/{message_id}/read")
async def admin_mark_message_read(message_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.messages.update_one({"id": message_id}, {"$set": {"isRead": True}})
    return {"message": "Marqué comme lu"}


@api_router.post("/admin/messages/{message_id}/reply")
async def admin_reply_message(message_id: str, reply: MessageReply, admin: dict = Depends(get_admin_user)):
    db = get_db()
    message = await db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    reply_data = {
        "content": reply.content,
        "isAdmin": True,
        "adminName": f"{admin['firstName']} {admin['lastName']}",
        "attachments": reply.attachments or [],
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.update_one(
        {"id": message_id},
        {"$push": {"replies": reply_data}, "$set": {"isRead": True}}
    )

    await send_notification(
        user_id=message["senderId"],
        notification_type="message_reply",
        title="Nouvelle réponse",
        message=f"L'équipe a répondu à votre message: {message.get('subject', 'Sans sujet')}",
        data={"messageId": message_id}
    )

    return {"message": "Réponse envoyée"}


# ============= ADMIN - APPLICATIONS =============

@api_router.get("/admin/applications")
async def admin_get_applications(admin: dict = Depends(get_admin_user)):
    db = get_db()
    applications = await db.applications.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return applications


@api_router.put("/admin/applications/{app_id}/status")
async def admin_update_application_status(app_id: str, status: str, reason: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    db = get_db()
    if status not in ["pending", "reviewing", "accepted", "rejected", "modify"]:
        raise HTTPException(status_code=400, detail="Statut invalide")

    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    update_data = {"status": status}
    if status == "modify" and reason:
        update_data["modifyReason"] = reason
        update_data["modifyRequestedAt"] = datetime.now(timezone.utc).isoformat()

    await db.applications.update_one({"id": app_id}, {"$set": update_data})

    status_labels = {
        "pending": "en attente",
        "reviewing": "en cours d'examen",
        "accepted": "acceptée",
        "rejected": "refusée",
        "modify": "à modifier"
    }

    notification_message = f"Votre candidature pour '{application.get('offerTitle', 'Programme')}' est maintenant {status_labels.get(status, status)}"
    if status == "modify" and reason:
        notification_message += f". Raison: {reason}"

    await send_notification(
        user_id=application["userId"],
        notification_type="application_update",
        title="Mise à jour de candidature",
        message=notification_message,
        data={"applicationId": app_id, "status": status, "reason": reason}
    )

    return {"message": f"Statut mis à jour: {status}"}


@api_router.put("/admin/applications/{app_id}/payment-status")
async def admin_update_payment_status(app_id: str, payment_status: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    if payment_status not in ["pending", "submitted", "verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Statut de paiement invalide")

    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    await db.applications.update_one({"id": app_id}, {"$set": {"paymentStatus": payment_status}})

    status_labels = {
        "pending": "en attente",
        "submitted": "soumis",
        "verified": "vérifié",
        "rejected": "rejeté"
    }
    await send_notification(
        user_id=application["userId"],
        notification_type="payment_update",
        title="Mise à jour du paiement",
        message=f"Le statut de votre paiement pour '{application.get('offerTitle', 'Programme')}' est maintenant {status_labels.get(payment_status, payment_status)}",
        data={"applicationId": app_id, "paymentStatus": payment_status}
    )

    return {"message": f"Statut de paiement mis à jour: {payment_status}"}


@api_router.post("/admin/applications/{app_id}/message")
async def admin_send_application_message(app_id: str, reply: MessageReply, admin: dict = Depends(get_admin_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    msg_data = {
        "id": str(uuid.uuid4()),
        "applicationId": app_id,
        "content": reply.content,
        "attachments": reply.attachments or [],
        "isAdmin": True,
        "adminName": f"{admin['firstName']} {admin['lastName']}",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    await db.applications.update_one(
        {"id": app_id},
        {"$push": {"adminMessages": msg_data}}
    )

    await send_notification(
        user_id=application["userId"],
        notification_type="application_message",
        title="Message concernant votre candidature",
        message=f"Nouveau message de l'équipe concernant votre candidature pour '{application.get('offerTitle', 'Programme')}': {reply.content[:100]}",
        data={"applicationId": app_id}
    )

    return {"message": "Message envoyé au candidat", "data": msg_data}


@api_router.get("/admin/applications/{app_id}/messages")
async def admin_get_application_messages(app_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id}, {"_id": 0, "adminMessages": 1})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    return application.get("adminMessages", [])


@api_router.put("/applications/{app_id}/resubmit")
async def resubmit_application(app_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    if application["userId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    if application.get("status") != "modify":
        raise HTTPException(status_code=400, detail="Cette candidature ne nécessite pas de modification")

    await db.applications.update_one(
        {"id": app_id},
        {"$set": {"status": "pending", "modifyReason": None, "modifyRequestedAt": None}}
    )

    await broadcast_to_admins({
        "type": "application_resubmit",
        "title": "Candidature re-soumise",
        "message": f"{current_user['firstName']} {current_user['lastName']} a re-soumis sa candidature",
        "data": {"applicationId": app_id}
    })

    return {"message": "Candidature re-soumise avec succès"}


@api_router.put("/applications/{app_id}/update-documents")
async def update_application_documents(app_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    if application["userId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return {"current_documents": application.get("documents", [])}


@api_router.put("/applications/{app_id}/documents")
async def update_documents(app_id: str, doc_data: DocumentUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    if application["userId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    await db.applications.update_one(
        {"id": app_id},
        {"$set": {"documents": doc_data.documents}}
    )
    return {"message": "Documents mis à jour"}


# ============= BLOG - PUBLIC =============

@api_router.get("/blog")
async def get_blog_posts(category: str = None, limit: int = 20, skip: int = 0):
    db = get_db()
    query = {"published": True}
    if category and category != "all":
        query["category"] = category
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.blog_posts.count_documents(query)
    return {"posts": posts, "total": total}


@api_router.get("/blog/{post_id}")
async def get_blog_post(post_id: str):
    db = get_db()
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    await db.blog_posts.update_one({"id": post_id}, {"$inc": {"views": 1}})
    post["views"] = post.get("views", 0) + 1
    return post


# ============= BLOG - ADMIN =============

@api_router.get("/admin/blog")
async def admin_get_blog_posts(admin: dict = Depends(get_admin_user)):
    db = get_db()
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return posts


@api_router.post("/admin/blog")
async def admin_create_blog_post(post: BlogPostCreate, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    db = get_db()
    post_data = {
        "id": str(uuid.uuid4()),
        **post.dict(),
        "authorId": admin["id"],
        "authorName": f"{admin['firstName']} {admin['lastName']}",
        "views": 0,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.blog_posts.insert_one(post_data)
    del post_data["_id"]
    if post_data.get("published"):
        background_tasks.add_task(broadcast_newsletter_blog, post_data)
    return post_data


@api_router.put("/admin/blog/{post_id}")
async def admin_update_blog_post(post_id: str, update: BlogPostUpdate, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    db = get_db()
    prev = await db.blog_posts.find_one({"id": post_id}, {"_id": 0, "published": 1})
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    # Send newsletter if post just got published
    if update_data.get("published") and prev and not prev.get("published"):
        full_post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
        if full_post:
            background_tasks.add_task(broadcast_newsletter_blog, full_post)
    return {"message": "Article mis à jour"}


@api_router.delete("/admin/blog/{post_id}")
async def admin_delete_blog_post(post_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return {"message": "Article supprimé"}


# ============= COMMUNITY - PUBLIC =============

@api_router.get("/community")
async def get_community_posts(category: str = None, limit: int = 20, skip: int = 0):
    db = get_db()
    query = {"deleted": {"$ne": True}}
    if category and category != "all":
        query["category"] = category
    posts = await db.community_posts.find(query, {"_id": 0}).sort([("pinned", -1), ("createdAt", -1)]).skip(skip).limit(limit).to_list(limit)
    total = await db.community_posts.count_documents(query)
    return {"posts": posts, "total": total}


@api_router.get("/community/{post_id}")
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

@api_router.post("/community")
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


@api_router.post("/community/{post_id}/reply")
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


@api_router.post("/community/{post_id}/like")
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


@api_router.post("/community/replies/{reply_id}/like")
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


# ============= COMMUNITY - ADMIN =============

@api_router.get("/admin/community")
async def admin_get_community_posts(admin: dict = Depends(get_admin_user)):
    db = get_db()
    posts = await db.community_posts.find({}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return posts


@api_router.delete("/admin/community/{post_id}")
async def admin_delete_community_post(post_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.community_posts.update_one({"id": post_id}, {"$set": {"deleted": True}})
    return {"message": "Discussion supprimée"}


@api_router.put("/admin/community/{post_id}/pin")
async def admin_toggle_pin_community_post(post_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    post = await db.community_posts.find_one({"id": post_id}, {"_id": 0, "pinned": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Discussion non trouvée")
    new_pin = not post.get("pinned", False)
    await db.community_posts.update_one({"id": post_id}, {"$set": {"pinned": new_pin}})
    return {"pinned": new_pin}


@api_router.delete("/admin/community/replies/{reply_id}")
async def admin_delete_community_reply(reply_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    reply = await db.community_replies.find_one({"id": reply_id})
    if reply:
        await db.community_replies.update_one({"id": reply_id}, {"$set": {"deleted": True}})
        await db.community_posts.update_one({"id": reply["postId"]}, {"$inc": {"replyCount": -1}})
    return {"message": "Réponse supprimée"}


# ============= ADMIN - STATS =============

@api_router.get("/admin/stats")
async def admin_get_stats(admin: dict = Depends(get_admin_user)):
    db = get_db()
    users_count = await db.users.count_documents({"role": "user"})
    offers_count = await db.offers.count_documents({"isActive": True})
    universities_count = await db.universities.count_documents({"isActive": True})
    housing_count = await db.housing.count_documents({"isActive": True})
    messages_count = await db.messages.count_documents({})
    unread_messages = await db.messages.count_documents({"isRead": False})
    applications_count = await db.applications.count_documents({})
    pending_applications = await db.applications.count_documents({"status": "pending"})

    return {
        "users": users_count,
        "offers": offers_count,
        "universities": universities_count,
        "housing": housing_count,
        "messages": messages_count,
        "unreadMessages": unread_messages,
        "applications": applications_count,
        "pendingApplications": pending_applications
    }


# ============= ADMIN - SETUP =============

@api_router.post("/admin/setup")
async def setup_admin():
    db = get_db()
    existing = await db.users.find_one({"role": "admin"})
    if existing:
        raise HTTPException(status_code=400, detail="Admin déjà configuré")

    admin_user = User(
        email="admin@accesshubglobal.com",
        firstName="Admin",
        lastName="AccessHub",
        role="admin"
    )

    admin_dict = serialize_doc(admin_user.model_dump())
    admin_dict["password"] = hash_password("Admin2025!")

    await db.users.insert_one(admin_dict)
    return {"message": "Admin créé", "email": "admin@accesshubglobal.com", "password": "Admin2025!"}


# ============= ADMIN - CHATS =============

@api_router.get("/admin/chats")
async def admin_get_chats(admin: dict = Depends(get_admin_user)):
    db = get_db()
    chats = await db.chats.find({"status": "active"}, {"_id": 0}).sort("lastMessageAt", -1).to_list(50)
    return chats


@api_router.get("/admin/chats/all")
async def admin_get_all_chats(admin: dict = Depends(get_admin_user)):
    db = get_db()
    chats = await db.chats.find({}, {"_id": 0}).sort("lastMessageAt", -1).to_list(100)
    return chats


# ============= PAYMENT SETTINGS =============

@api_router.get("/admin/payment-settings")
async def get_payment_settings(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default = PaymentSettings()
        return default.model_dump()
    return settings


@api_router.post("/admin/payment-settings")
async def update_payment_settings(settings: PaymentSettings, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    settings_dict = settings.model_dump()
    await db.payment_settings.update_one(
        {"id": "payment_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return {"message": "Paramètres de paiement mis à jour"}


@api_router.get("/payment-settings")
async def get_public_payment_settings():
    db = get_db()
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default = PaymentSettings()
        return default.model_dump()
    return settings


# ============= NEWSLETTER =============

@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(data: NewsletterSubscribe):
    db = get_db()
    existing = await db.newsletter.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà inscrit à la newsletter")
    await db.newsletter.insert_one({
        "email": data.email,
        "subscribedAt": datetime.now(timezone.utc).isoformat(),
    })
    return {"message": "Inscription à la newsletter réussie"}


@api_router.get("/admin/newsletter")
async def admin_get_newsletter(admin: dict = Depends(get_admin_user)):
    db = get_db()
    subscribers = await db.newsletter.find({}, {"_id": 0}).sort("subscribedAt", -1).to_list(5000)
    return subscribers


@api_router.delete("/admin/newsletter/{email}")
async def admin_delete_newsletter(email: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.newsletter.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Abonné non trouvé")
    return {"message": "Abonné supprimé"}


# ============= BANNER SLIDES =============

@api_router.get("/site-settings/banners")
async def get_banners():
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_banners"}, {"_id": 0})
    if not doc:
        return {"slides": []}
    return {"slides": doc.get("slides", [])}


@api_router.get("/admin/site-settings/banners")
async def admin_get_banners(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_banners"}, {"_id": 0})
    if not doc:
        return {"slides": []}
    return {"slides": doc.get("slides", [])}


@api_router.post("/admin/site-settings/banners")
async def admin_save_banners(data: BannerSlidesUpdate, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    await db.site_settings.update_one(
        {"id": "site_banners"},
        {"$set": {"id": "site_banners", "slides": [s.model_dump() for s in data.slides]}},
        upsert=True
    )
    return {"message": "Bannières mises à jour"}


# ============= TESTIMONIALS =============

@api_router.get("/testimonials")
async def get_testimonials():
    db = get_db()
    testimonials = await db.testimonials.find(
        {"status": "approved"}, {"_id": 0}
    ).sort("createdAt", -1).to_list(50)
    return testimonials


@api_router.post("/testimonials")
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


@api_router.get("/testimonials/mine")
async def get_my_testimonial(current_user: dict = Depends(get_current_user)):
    db = get_db()
    testimonial = await db.testimonials.find_one({"userId": current_user["id"]}, {"_id": 0})
    return testimonial


@api_router.get("/admin/testimonials")
async def admin_get_testimonials(admin: dict = Depends(get_admin_user)):
    db = get_db()
    testimonials = await db.testimonials.find({}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return testimonials


@api_router.put("/admin/testimonials/{testimonial_id}/approve")
async def admin_approve_testimonial(testimonial_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.testimonials.update_one({"id": testimonial_id}, {"$set": {"status": "approved"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Temoignage non trouve")
    return {"message": "Temoignage approuve"}


@api_router.put("/admin/testimonials/{testimonial_id}/reject")
async def admin_reject_testimonial(testimonial_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.testimonials.update_one({"id": testimonial_id}, {"$set": {"status": "rejected"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Temoignage non trouve")
    return {"message": "Temoignage rejete"}


@api_router.delete("/admin/testimonials/{testimonial_id}")
async def admin_delete_testimonial(testimonial_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Temoignage non trouve")
    return {"message": "Temoignage supprime"}


# ============= CONTACT FORM (PUBLIC) =============

@api_router.post("/contact")
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


@api_router.get("/admin/contacts")
async def admin_get_contacts(admin: dict = Depends(get_admin_user)):
    db = get_db()
    contacts = await db.contact_messages.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return contacts


@api_router.put("/admin/contacts/{contact_id}/read")
async def admin_mark_contact_read(contact_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.contact_messages.update_one({"id": contact_id}, {"$set": {"isRead": True}})
    return {"message": "Marque comme lu"}


@api_router.delete("/admin/contacts/{contact_id}")
async def admin_delete_contact(contact_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.contact_messages.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouve")
    return {"message": "Message supprime"}


# ============= FAQ MANAGEMENT =============

@api_router.get("/faqs")
async def get_faqs():
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_faqs"}, {"_id": 0})
    if not doc:
        return {"faqs": []}
    return {"faqs": doc.get("faqs", [])}


@api_router.get("/admin/faqs")
async def admin_get_faqs(admin: dict = Depends(get_admin_user)):
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_faqs"}, {"_id": 0})
    if not doc:
        return {"faqs": []}
    return {"faqs": doc.get("faqs", [])}


@api_router.post("/admin/faqs")
async def admin_save_faqs(data: FAQListUpdate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.site_settings.update_one(
        {"id": "site_faqs"},
        {"$set": {"id": "site_faqs", "faqs": [f.model_dump() for f in data.faqs]}},
        upsert=True
    )
    return {"message": "FAQ mises a jour"}


# ============= AGENT AUTH =============

@api_router.post("/auth/register-agent", response_model=TokenResponse)
async def register_agent(agent_data: AgentRegister):
    db = get_db()
    existing = await db.users.find_one({"email": agent_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est deja utilise")

    code_doc = await db.agent_codes.find_one({"code": agent_data.activationCode, "isUsed": False})
    if not code_doc:
        raise HTTPException(status_code=400, detail="Code d'activation invalide ou deja utilise")

    if code_doc.get("expiresAt"):
        exp = code_doc["expiresAt"]
        if isinstance(exp, str):
            exp = datetime.fromisoformat(exp.replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > exp:
            raise HTTPException(status_code=400, detail="Code d'activation expire")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    user_dict = {
        "id": user_id,
        "email": agent_data.email,
        "firstName": agent_data.firstName,
        "lastName": agent_data.lastName,
        "phone": agent_data.phone,
        "company": agent_data.company or "",
        "role": "agent",
        "isActive": True,
        "isApproved": False,
        "emailVerified": False,
        "agentCode": agent_data.activationCode,
        "favorites": [],
        "password": hash_password(agent_data.password),
        "createdAt": now,
    }
    await db.users.insert_one(user_dict)

    await db.agent_codes.update_one(
        {"code": agent_data.activationCode},
        {"$set": {"isUsed": True, "usedBy": user_id, "usedAt": now}}
    )

    # Send verification email
    v_code = generate_verification_code()
    await db.email_verifications.insert_one({
        "userId": user_id,
        "email": agent_data.email,
        "code": v_code,
        "expiresAt": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
        "used": False,
    })
    await send_verification_email(agent_data.email, v_code)

    access_token = create_access_token({"sub": user_id})
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id, email=agent_data.email,
            firstName=agent_data.firstName, lastName=agent_data.lastName,
            phone=agent_data.phone, role="agent", isActive=True, favorites=[],
            isApproved=False, company=agent_data.company or "", emailVerified=False,
        )
    )


# ============= AGENT DASHBOARD =============

@api_router.get("/agent/dashboard-stats")
async def agent_dashboard_stats(agent: dict = Depends(get_agent_user)):
    db = get_db()
    students = await db.agent_students.count_documents({"agentId": agent["id"]})
    applications = await db.applications.count_documents({"agentId": agent["id"]})
    pending = await db.applications.count_documents({"agentId": agent["id"], "status": "pending"})
    approved = await db.applications.count_documents({"agentId": agent["id"], "status": "approved"})
    rejected = await db.applications.count_documents({"agentId": agent["id"], "status": "rejected"})
    messages = await db.messages.count_documents({"senderId": agent["id"]})
    return {
        "students": students,
        "totalApplications": applications,
        "pendingApplications": pending,
        "approvedApplications": approved,
        "rejectedApplications": rejected,
        "messages": messages,
    }


# ============= AGENT STUDENTS =============

@api_router.get("/agent/students")
async def agent_get_students(agent: dict = Depends(get_agent_user)):
    db = get_db()
    students = await db.agent_students.find({"agentId": agent["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return students


@api_router.post("/agent/students")
async def agent_create_student(data: AgentStudentCreate, agent: dict = Depends(get_agent_user)):
    db = get_db()
    student = {
        "id": str(uuid.uuid4()),
        "agentId": agent["id"],
        "firstName": data.firstName,
        "lastName": data.lastName,
        "email": data.email,
        "phone": data.phone or "",
        "dateOfBirth": data.dateOfBirth or "",
        "nationality": data.nationality or "",
        "sex": data.sex or "",
        "passportNumber": data.passportNumber or "",
        "address": data.address or "",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.agent_students.insert_one(student)
    del student["_id"]
    return student


@api_router.put("/agent/students/{student_id}")
async def agent_update_student(student_id: str, data: AgentStudentUpdate, agent: dict = Depends(get_agent_user)):
    db = get_db()
    student = await db.agent_students.find_one({"id": student_id, "agentId": agent["id"]})
    if not student:
        raise HTTPException(status_code=404, detail="Etudiant non trouve")
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if update:
        await db.agent_students.update_one({"id": student_id}, {"$set": update})
    updated = await db.agent_students.find_one({"id": student_id}, {"_id": 0})
    return updated


@api_router.delete("/agent/students/{student_id}")
async def agent_delete_student(student_id: str, agent: dict = Depends(get_agent_user)):
    db = get_db()
    result = await db.agent_students.delete_one({"id": student_id, "agentId": agent["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Etudiant non trouve")
    return {"message": "Etudiant supprime"}


# ============= AGENT APPLICATIONS =============

@api_router.post("/agent/applications")
async def agent_create_application(data: AgentApplicationCreate, agent: dict = Depends(get_agent_user)):
    db = get_db()
    student = await db.agent_students.find_one({"id": data.studentId, "agentId": agent["id"]})
    if not student:
        raise HTTPException(status_code=404, detail="Etudiant non trouve")

    existing = await db.applications.find_one({
        "agentId": agent["id"], "agentStudentId": data.studentId, "offerId": data.offerId
    })
    if existing:
        raise HTTPException(status_code=400, detail="Cet etudiant a deja postule a cette offre")

    app_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    application = {
        "id": app_id,
        "userId": agent["id"],
        "agentId": agent["id"],
        "agentStudentId": data.studentId,
        "userName": f"{student['firstName']} {student['lastName']}",
        "userEmail": student.get("email", ""),
        "offerId": data.offerId,
        "offerTitle": data.offerTitle,
        "firstName": student.get("firstName", ""),
        "lastName": student.get("lastName", ""),
        "nationality": student.get("nationality", ""),
        "sex": student.get("sex", ""),
        "passportNumber": student.get("passportNumber", ""),
        "dateOfBirth": student.get("dateOfBirth", ""),
        "phoneNumber": student.get("phone", ""),
        "address": student.get("address", ""),
        "additionalPrograms": data.additionalPrograms,
        "documents": data.documents,
        "termsAccepted": data.termsAccepted,
        "paymentMethod": data.paymentMethod,
        "paymentProof": data.paymentProof,
        "paymentAmount": data.paymentAmount,
        "paymentStatus": "submitted" if data.paymentProof else "pending",
        "status": "pending",
        "createdAt": now,
    }
    await db.applications.insert_one(application)

    await broadcast_to_admins({
        "type": "new_application",
        "title": "Nouvelle candidature (Agent)",
        "message": f"Agent {agent['firstName']} {agent['lastName']} a postule pour {student['firstName']} {student['lastName']} a {data.offerTitle}",
        "data": {"applicationId": app_id}
    })

    del application["_id"]
    return application


@api_router.get("/agent/applications")
async def agent_get_applications(agent: dict = Depends(get_agent_user)):
    db = get_db()
    applications = await db.applications.find({"agentId": agent["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return applications


@api_router.get("/agent/applications/{app_id}")
async def agent_get_application_detail(app_id: str, agent: dict = Depends(get_agent_user)):
    db = get_db()
    app = await db.applications.find_one({"id": app_id, "agentId": agent["id"]}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Candidature non trouvee")
    return app


# ============= AGENT MESSAGES =============

@api_router.get("/agent/messages")
async def agent_get_messages(agent: dict = Depends(get_agent_user)):
    db = get_db()
    msgs = await db.messages.find({"senderId": agent["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return msgs


@api_router.post("/agent/messages")
async def agent_send_message(msg: MessageCreate, agent: dict = Depends(get_agent_user)):
    db = get_db()
    message = {
        "id": str(uuid.uuid4()),
        "senderId": agent["id"],
        "senderName": f"{agent['firstName']} {agent['lastName']}",
        "senderEmail": agent["email"],
        "senderRole": "agent",
        "subject": msg.subject,
        "content": msg.content,
        "offerId": msg.offerId,
        "attachments": msg.attachments or [],
        "isRead": False,
        "replies": [],
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(message)
    del message["_id"]
    return message


# ============= ADMIN - AGENT CODES =============

@api_router.post("/admin/agent-codes")
async def admin_create_agent_code(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    import random, string
    code = "AG-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    now = datetime.now(timezone.utc)
    doc = {
        "id": str(uuid.uuid4()),
        "code": code,
        "createdBy": admin["id"],
        "createdByName": f"{admin['firstName']} {admin['lastName']}",
        "createdAt": now.isoformat(),
        "expiresAt": (now + timedelta(days=30)).isoformat(),
        "isUsed": False,
        "usedBy": None,
        "usedAt": None,
    }
    await db.agent_codes.insert_one(doc)
    del doc["_id"]
    return doc


@api_router.get("/admin/agent-codes")
async def admin_get_agent_codes(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    codes = await db.agent_codes.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return codes


@api_router.delete("/admin/agent-codes/{code_id}")
async def admin_delete_agent_code(code_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    result = await db.agent_codes.delete_one({"id": code_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code non trouve")
    return {"message": "Code supprime"}


# ============= ADMIN - AGENTS MANAGEMENT =============

@api_router.get("/admin/agents")
async def admin_get_agents(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    agents = await db.users.find({"role": "agent"}, {"_id": 0, "password": 0}).sort("createdAt", -1).to_list(500)
    for a in agents:
        a["studentsCount"] = await db.agent_students.count_documents({"agentId": a["id"]})
        a["applicationsCount"] = await db.applications.count_documents({"agentId": a["id"]})
    return agents


@api_router.put("/admin/agents/{agent_id}/approve")
async def admin_approve_agent(agent_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": agent_id, "role": "agent"})
    if not user:
        raise HTTPException(status_code=404, detail="Agent non trouve")
    await db.users.update_one({"id": agent_id}, {"$set": {"isApproved": True}})
    return {"message": "Agent approuve"}


@api_router.put("/admin/agents/{agent_id}/reject")
async def admin_reject_agent(agent_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": agent_id, "role": "agent"})
    if not user:
        raise HTTPException(status_code=404, detail="Agent non trouve")
    await db.users.update_one({"id": agent_id}, {"$set": {"isApproved": False, "isActive": False}})
    return {"message": "Agent rejete"}



# ============= INSTITUTIONAL PAGES =============

DEFAULT_PAGES = {
    "about": {
        "slug": "about",
        "title": "À propos d'AccessHub Global",
        "subtitle": "Votre passerelle vers l'excellence académique internationale",
        "sections": {
            "history": {
                "title": "Notre histoire",
                "content": "AccessHub Global a vu le jour en 2019 à Guangzhou, en Chine, née de la vision de Mr. MOUNTSOUKA Aaron Depousse. Ayant lui-même vécu l'expérience d'étudiant international en Chine, il a constaté les difficultés que rencontrent les étudiants africains et francophones dans leurs démarches d'admission, de visa et d'installation à l'étranger.\n\nCe qui a commencé comme un accompagnement informel entre amis et compatriotes s'est rapidement transformé en une structure professionnelle. En quelques années, AccessHub Global a accompagné des centaines d'étudiants vers des universités de renom en Chine et en France.\n\nAujourd'hui, avec des bureaux à Guangzhou (Chine) et à Brazzaville (Congo), AccessHub Global est devenu un acteur incontournable de la mobilité étudiante internationale en Afrique francophone."
            },
            "mission": {
                "title": "Notre mission",
                "content": "Rendre l'éducation internationale accessible, transparente et sécurisée pour chaque étudiant, quel que soit son pays d'origine. Nous croyons que le talent n'a pas de frontières et que chaque jeune mérite l'opportunité de réaliser son potentiel académique à l'international.",
                "pillars": [
                    {"title": "Accessibilité", "desc": "Simplifier les démarches complexes d'admission et de visa pour tous"},
                    {"title": "Transparence", "desc": "Des processus clairs, des frais détaillés, aucune surprise"},
                    {"title": "Excellence", "desc": "Des partenariats avec les meilleures universités de Chine et France"}
                ]
            },
            "values": [
                {"title": "Engagement", "desc": "Nous nous investissons personnellement dans la réussite de chaque étudiant, du premier contact jusqu'à l'installation dans le pays d'accueil."},
                {"title": "Intégrité", "desc": "Nous agissons avec honnêteté et transparence dans toutes nos interactions. Nos étudiants sont informés de chaque étape et de chaque coût."},
                {"title": "Innovation", "desc": "Nous utilisons la technologie pour simplifier les processus et offrir une expérience fluide à nos étudiants, partenaires et agents."},
                {"title": "Diversité", "desc": "Nous célébrons la richesse culturelle de nos étudiants et favorisons les échanges interculturels comme moteur de croissance personnelle."}
            ],
            "team": [
                {"name": "Mr. MOUNTSOUKA Aaron Depousse", "role": "Fondateur & Directeur Général", "desc": "Visionnaire et entrepreneur, il dirige AccessHub Global depuis sa création avec une passion pour l'éducation internationale."},
                {"name": "Département Admissions", "role": "Équipe Admissions & Suivi", "desc": "Nos conseillers spécialisés accompagnent chaque étudiant dans le choix de programme et la préparation du dossier d'admission."},
                {"name": "Département Logistique", "role": "Équipe Visa & Installation", "desc": "De la demande de visa à la recherche de logement, notre équipe assure une transition fluide vers le pays d'accueil."}
            ],
            "services": [
                {"title": "Orientation académique", "desc": "Analyse de votre profil, recommandation de programmes et universités adaptés à vos objectifs et votre budget."},
                {"title": "Accompagnement admission", "desc": "Préparation complète du dossier de candidature, traduction de documents, et suivi jusqu'à l'obtention de la lettre d'admission."},
                {"title": "Assistance visa", "desc": "Aide à la constitution du dossier visa, préparation à l'entretien consulaire, et suivi de la demande."},
                {"title": "Recherche de logement", "desc": "Mise en relation avec des résidences universitaires et des logements privés vérifiés dans la ville d'accueil."},
                {"title": "Bourses d'études", "desc": "Identification des opportunités de bourses (CSC, bourses provinciales, bourses universitaires) et aide à la candidature."},
                {"title": "Accueil & Installation", "desc": "Accueil à l'aéroport, aide à l'inscription universitaire, ouverture de compte bancaire et carte SIM."}
            ]
        }
    },
    "company": {
        "slug": "company",
        "title": "Informations sur l'entreprise",
        "subtitle": "Toutes les informations officielles sur AccessHub Global",
        "sections": {
            "identity": {
                "name": "AccessHub Global",
                "registration": "DFS3455677 (Chine)",
                "director": "Mr. MOUNTSOUKA Aaron Depousse",
                "email": "accesshubglobal@gmail.com",
                "founded": "2019",
                "sector": "Conseil en éducation internationale & Mobilité étudiante"
            },
            "offices": [
                {"country": "Chine", "flag": "🇨🇳", "address": "Vanke, Panyu District, GuangDong Province, Guangzhou City, Chine", "label": "Bureau principal - Opérations Asie"},
                {"country": "Congo", "flag": "🇨🇬", "address": "34 rue Lénine, Moungali, Brazzaville, République du Congo", "label": "Bureau Afrique - Recrutement & Relations étudiants"}
            ],
            "departments": [
                {"title": "Admissions", "desc": "Gestion des dossiers, suivi des candidatures, relations universités"},
                {"title": "Relations Étudiants", "desc": "Conseil, orientation, accompagnement personnalisé"},
                {"title": "Logistique & Visa", "desc": "Démarches visa, logement, accueil et installation"},
                {"title": "Marketing & Communication", "desc": "Promotion, événements, réseaux sociaux, partenariats"}
            ],
            "clients": [
                "Étudiants africains francophones souhaitant étudier en Chine ou en France",
                "Professionnels en reconversion cherchant des programmes de MBA ou certifications internationales",
                "Parents et familles accompagnant leurs enfants dans un projet d'études à l'étranger",
                "Agents et partenaires locaux dans plusieurs pays africains"
            ],
            "partners": [
                "Universités partenaires en Chine (Beijing, Shanghai, Guangzhou, Wuhan...)",
                "Établissements d'enseignement supérieur en France",
                "Résidences universitaires et agences de logement vérifiées",
                "Réseau d'agents recruteurs dans plus de 10 pays africains"
            ],
            "stats": [
                {"number": "500+", "label": "Étudiants accompagnés"},
                {"number": "50+", "label": "Universités partenaires"},
                {"number": "10+", "label": "Pays d'origine couverts"},
                {"number": "6+", "label": "Années d'expérience"}
            ]
        }
    },
    "legal": {
        "slug": "legal",
        "title": "Mentions Légales",
        "subtitle": "Dernière mise à jour : Mars 2026",
        "sections": [
            {"heading": "1. Éditeur du site", "content": "Raison sociale : AccessHub Global\nNuméro d'immatriculation : DFS3455677 (Chine)\nDirecteur de la publication : Mr. MOUNTSOUKA Aaron Depousse\nSiège social (Chine) : Vanke, Panyu District, GuangDong Province, Guangzhou City, Chine\nSiège social (Congo) : 34 rue Lénine, Moungali, Brazzaville, République du Congo\nEmail : accesshubglobal@gmail.com"},
            {"heading": "2. Hébergement", "content": "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis."},
            {"heading": "3. Propriété intellectuelle", "content": "L'ensemble du contenu de ce site (textes, images, logos, graphismes, icônes, logiciels, bases de données) est la propriété exclusive d'AccessHub Global ou de ses partenaires et est protégé par les lois relatives à la propriété intellectuelle.\n\nToute reproduction, représentation, modification, publication, distribution ou retransmission, totale ou partielle, du contenu de ce site, par quelque procédé que ce soit, sans l'autorisation préalable écrite d'AccessHub Global, est strictement interdite."},
            {"heading": "4. Responsabilité", "content": "AccessHub Global s'efforce de fournir des informations aussi précises que possible sur ce site. Toutefois, AccessHub Global ne saurait être tenu responsable des omissions, inexactitudes et carences dans la mise à jour, qu'elles soient de son fait ou du fait de tiers partenaires."},
            {"heading": "5. Liens hypertextes", "content": "Le site peut contenir des liens hypertextes vers d'autres sites. AccessHub Global n'exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu."},
            {"heading": "6. Cookies", "content": "Ce site utilise des cookies techniques nécessaires à son bon fonctionnement (authentification, préférences de langue). Aucun cookie de traçage publicitaire n'est utilisé."},
            {"heading": "7. Droit applicable", "content": "Les présentes mentions légales sont régies par le droit applicable au lieu du siège social principal de l'entreprise."},
            {"heading": "8. Contact", "content": "Pour toute question relative aux mentions légales, vous pouvez nous contacter à : accesshubglobal@gmail.com"}
        ]
    },
    "privacy": {
        "slug": "privacy",
        "title": "Politique de Confidentialité",
        "subtitle": "Dernière mise à jour : Mars 2026",
        "sections": [
            {"heading": "1. Introduction", "content": "AccessHub Global s'engage à protéger la vie privée de ses utilisateurs. La présente politique de confidentialité décrit les types d'informations personnelles que nous collectons, la manière dont nous les utilisons et les mesures que nous prenons pour les protéger."},
            {"heading": "2. Données collectées", "content": "Données d'identification : nom, prénom, date de naissance, nationalité, sexe, numéro de passeport\nCoordonnées : adresse email, numéro de téléphone, adresse postale\nDonnées académiques : diplômes, relevés de notes, certificats de langue\nDocuments : copie de passeport, photos d'identité, preuves de paiement\nDonnées de navigation : adresse IP, type de navigateur, pages visitées"},
            {"heading": "3. Finalités du traitement", "content": "Gestion de votre compte utilisateur et authentification\nTraitement de vos candidatures auprès des universités partenaires\nCommunication relative à vos dossiers\nEnvoi de newsletters (avec votre consentement)\nAmélioration de nos services\nRespect de nos obligations légales"},
            {"heading": "4. Partage des données", "content": "Vos données peuvent être partagées avec : universités partenaires (dans le cadre de votre candidature), prestataires techniques (Vercel, Cloudinary, Resend), agents partenaires (uniquement avec votre accord).\n\nNous ne vendons jamais vos données personnelles à des tiers."},
            {"heading": "5. Durée de conservation", "content": "Vos données sont conservées pendant toute la durée de votre relation avec AccessHub Global, puis pendant 3 ans après votre dernière interaction. Les données relatives aux candidatures sont conservées pendant 5 ans."},
            {"heading": "6. Sécurité des données", "content": "Chiffrement des mots de passe (bcrypt)\nCommunication sécurisée via HTTPS/TLS\nAuthentification par token JWT avec expiration\nVérification d'email obligatoire\nContrôle d'accès basé sur les rôles (RBAC)"},
            {"heading": "7. Vos droits", "content": "Droit d'accès : obtenir la confirmation que vos données sont traitées\nDroit de rectification : faire corriger vos données inexactes\nDroit de suppression : demander l'effacement de vos données\nDroit d'opposition : vous opposer au traitement\nDroit à la portabilité : recevoir vos données dans un format lisible\nDroit de retrait du consentement\n\nContact : accesshubglobal@gmail.com"},
            {"heading": "8. Modifications", "content": "Nous nous réservons le droit de modifier cette politique à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour."}
        ]
    },
    "terms": {
        "slug": "terms",
        "title": "Conditions d'Utilisation",
        "subtitle": "Dernière mise à jour : Mars 2026",
        "sections": [
            {"heading": "1. Objet", "content": "Les présentes conditions générales d'utilisation (CGU) définissent les modalités d'accès et d'utilisation du site web AccessHub Global et des services proposés. L'accès au Site implique l'acceptation pleine et entière des présentes CGU."},
            {"heading": "2. Description des Services", "content": "AccessHub Global propose une plateforme permettant aux étudiants de : consulter les programmes d'études et universités partenaires, soumettre des candidatures en ligne, suivre l'avancement de leurs candidatures, communiquer avec l'équipe, rechercher des logements, accéder aux informations sur les bourses."},
            {"heading": "3. Inscription et compte", "content": "L'utilisateur s'engage à fournir des informations exactes, maintenir la confidentialité de ses identifiants, notifier toute utilisation non autorisée et vérifier son adresse email. AccessHub Global se réserve le droit de suspendre tout compte en cas de violation des CGU."},
            {"heading": "4. Processus de candidature", "content": "AccessHub Global agit en tant qu'intermédiaire. La décision finale d'admission revient à l'université. Les documents soumis doivent être authentiques. Les frais de service sont non remboursables une fois le dossier transmis. Le paiement ne garantit pas l'acceptation de la candidature."},
            {"heading": "5. Tarification et paiement", "content": "Les frais de service couvrent : l'accompagnement personnalisé, la vérification et préparation du dossier, la soumission de la candidature, le suivi jusqu'à la réponse. Les frais universitaires sont distincts et payés directement à l'université."},
            {"heading": "6. Obligations de l'utilisateur", "content": "Utiliser le Site conformément à sa finalité\nNe pas porter atteinte au fonctionnement du Site\nNe pas usurper l'identité d'un tiers\nNe pas diffuser de contenu illicite\nRespecter les droits de propriété intellectuelle"},
            {"heading": "7. Limitation de responsabilité", "content": "AccessHub Global ne peut être tenu responsable des décisions d'admission ou de refus des universités, des refus de visa, des interruptions temporaires du Site, ou des dommages indirects."},
            {"heading": "8. Modifications des CGU", "content": "AccessHub Global se réserve le droit de modifier les CGU à tout moment. La poursuite de l'utilisation vaut acceptation des nouvelles conditions."},
            {"heading": "9. Contact", "content": "Pour toute question : accesshubglobal@gmail.com"}
        ]
    }
}


@api_router.get("/pages/{slug}")
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


@api_router.put("/admin/pages/{slug}")
async def update_page(slug: str, data: dict, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    if slug not in DEFAULT_PAGES:
        raise HTTPException(status_code=400, detail="Slug invalide")
    data["slug"] = slug
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    data["updatedBy"] = admin.get("id")
    existing = await db.pages.find_one({"slug": slug})
    if existing:
        await db.pages.update_one({"slug": slug}, {"$set": data})
    else:
        await db.pages.insert_one(data)
    result = await db.pages.find_one({"slug": slug}, {"_id": 0})
    return result


@api_router.get("/admin/pages")
async def admin_list_pages(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    pages = await db.pages.find({}, {"_id": 0}).to_list(20)
    slugs_in_db = {p["slug"] for p in pages}
    for slug, default in DEFAULT_PAGES.items():
        if slug not in slugs_in_db:
            default_copy = {**default, "updatedAt": datetime.now(timezone.utc).isoformat()}
            await db.pages.insert_one(default_copy)
            pages.append({k: v for k, v in default_copy.items() if k != "_id"})
    return pages
