from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
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
)
from _helpers import (
    get_db, hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user, serialize_doc, security,
    send_notification, broadcast_to_admins,
)

logger = logging.getLogger(__name__)

api_router = APIRouter()


# ============= ROOT =============

@api_router.get("/")
async def root():
    return {"message": "Winners Consulting API", "status": "ok"}


# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    db = get_db()
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    user = User(
        email=user_data.email,
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        phone=user_data.phone
    )

    user_dict = serialize_doc(user.model_dump())
    user_dict["password"] = hash_password(user_data.password)

    await db.users.insert_one(user_dict)

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
            favorites=user.favorites
        )
    )


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
            favorites=user.get("favorites", [])
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
        favorites=current_user.get("favorites", [])
    )


# ============= PASSWORD RESET =============

@api_router.post("/auth/password-reset-request")
async def request_password_reset(request: PasswordResetRequest):
    db = get_db()
    user = await db.users.find_one({"email": request.email})
    if not user:
        return {"message": "Si cet email existe, un lien de réinitialisation sera envoyé"}

    reset_token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.password_resets.insert_one({
        "token": reset_token,
        "userId": user["id"],
        "email": request.email,
        "expiresAt": expires.isoformat(),
        "used": False
    })

    logger.info(f"Password reset token for {request.email}: {reset_token}")

    return {
        "message": "Si cet email existe, un lien de réinitialisation sera envoyé",
        "dev_token": reset_token
    }


@api_router.get("/auth/password-reset-verify/{token}")
async def verify_reset_token(token: str):
    db = get_db()
    reset = await db.password_resets.find_one({"token": token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")

    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expiré")

    return {"valid": True, "email": reset["email"]}


@api_router.post("/auth/password-reset")
async def reset_password(request: PasswordResetConfirm):
    db = get_db()
    reset = await db.password_resets.find_one({"token": request.token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")

    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expiré")

    hashed = hash_password(request.newPassword)
    await db.users.update_one({"id": reset["userId"]}, {"$set": {"password": hashed}})

    await db.password_resets.update_one({"token": request.token}, {"$set": {"used": True}})

    return {"message": "Mot de passe mis à jour avec succès"}


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
        raise HTTPException(status_code=404, detail="Université non trouvée")

    await db.universities.update_one({"id": uni_id}, {"$inc": {"views": 1}})
    return uni


@api_router.get("/universities/{uni_id}/rating")
async def get_university_rating(uni_id: str):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    views = uni.get("views", 0)
    view_bonus = min(views / 10000, 1.0)
    computed_rating = round(min(4.0 + view_bonus, 5.0), 1)
    await db.universities.update_one({"id": uni_id}, {"$set": {"rating": computed_rating}})
    return {"universityId": uni_id, "rating": computed_rating, "views": views}


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
        offerId=app_data.offerId,
        offerTitle=app_data.offerTitle,
        firstName=app_data.firstName,
        lastName=app_data.lastName,
        nationality=app_data.nationality,
        sex=app_data.sex,
        passportNumber=app_data.passportNumber,
        dateOfBirth=app_data.dateOfBirth,
        phoneNumber=app_data.phoneNumber,
        address=app_data.address,
        additionalPrograms=app_data.additionalPrograms,
        documents=app_data.documents,
        termsAccepted=app_data.termsAccepted,
        paymentMethod=app_data.paymentMethod,
        paymentProof=app_data.paymentProof,
        paymentAmount=app_data.paymentAmount,
        paymentStatus="submitted",
        status="pending"
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

    if application["userId"] != current_user["id"] and current_user.get("role") != "admin":
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
async def admin_toggle_user_status(user_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    new_status = not user.get("isActive", True)
    await db.users.update_one({"id": user_id}, {"$set": {"isActive": new_status}})
    return {"message": "Statut modifié", "isActive": new_status}


@api_router.put("/admin/users/{user_id}/make-admin")
async def admin_make_admin(user_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.users.update_one({"id": user_id}, {"$set": {"role": "admin"}})
    return {"message": "Utilisateur promu administrateur"}


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
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
async def admin_create_offer(offer_data: OfferCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    offer = Offer(**offer_data.model_dump())
    await db.offers.insert_one(serialize_doc(offer.model_dump()))
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
async def admin_update_application_status(app_id: str, status: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    if status not in ["pending", "reviewing", "accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Statut invalide")

    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    await db.applications.update_one({"id": app_id}, {"$set": {"status": status}})

    status_labels = {
        "pending": "en attente",
        "reviewing": "en cours d'examen",
        "accepted": "acceptée",
        "rejected": "refusée"
    }
    await send_notification(
        user_id=application["userId"],
        notification_type="application_update",
        title="Mise à jour de candidature",
        message=f"Votre candidature pour '{application.get('offerTitle', 'Programme')}' est maintenant {status_labels.get(status, status)}",
        data={"applicationId": app_id, "status": status}
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
        email="admin@winners-consulting.com",
        firstName="Admin",
        lastName="Winner",
        role="admin"
    )

    admin_dict = serialize_doc(admin_user.model_dump())
    admin_dict["password"] = hash_password("Admin2025!")

    await db.users.insert_one(admin_dict)
    return {"message": "Admin créé", "email": "admin@winners-consulting.com", "password": "Admin2025!"}


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
async def get_payment_settings(admin: dict = Depends(get_admin_user)):
    db = get_db()
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default = PaymentSettings()
        return default.model_dump()
    return settings


@api_router.post("/admin/payment-settings")
async def update_payment_settings(settings: PaymentSettings, admin: dict = Depends(get_admin_user)):
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
async def admin_get_banners(admin: dict = Depends(get_admin_user)):
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_banners"}, {"_id": 0})
    if not doc:
        return {"slides": []}
    return {"slides": doc.get("slides", [])}


@api_router.post("/admin/site-settings/banners")
async def admin_save_banners(data: BannerSlidesUpdate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.site_settings.update_one(
        {"id": "site_banners"},
        {"$set": {"id": "site_banners", "slides": [s.model_dump() for s in data.slides]}},
        upsert=True
    )
    return {"message": "Bannières mises à jour"}
