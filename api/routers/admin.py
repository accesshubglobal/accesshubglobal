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

# ============= ADMIN - USERS =============

@router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    db = get_db()
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users


@router.put("/admin/users/{user_id}/toggle-status")
async def admin_toggle_user_status(user_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    new_status = not user.get("isActive", True)
    await db.users.update_one({"id": user_id}, {"$set": {"isActive": new_status}})
    return {"message": "Statut modifié", "isActive": new_status}


@router.put("/admin/users/{user_id}/make-admin")
async def admin_make_admin(user_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    await db.users.update_one({"id": user_id}, {"$set": {"role": "admin_principal"}})
    return {"message": "Utilisateur promu administrateur principal"}


@router.put("/admin/users/{user_id}/set-role")
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


@router.delete("/admin/users/{user_id}")
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

@router.get("/admin/offers")
async def admin_get_offers(admin: dict = Depends(get_admin_user)):
    db = get_db()
    offers = await db.offers.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return offers


@router.post("/admin/offers")
async def admin_create_offer(offer_data: OfferCreate, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    db = get_db()
    offer = Offer(**offer_data.model_dump())
    offer_dict = serialize_doc(offer.model_dump())
    await db.offers.insert_one(offer_dict)
    background_tasks.add_task(broadcast_newsletter_offer, offer.model_dump())
    return {"message": "Offre créée avec succès", "id": offer.id}


@router.put("/admin/offers/{offer_id}")
async def admin_update_offer(offer_id: str, offer_data: OfferCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    update_data = offer_data.model_dump()
    await db.offers.update_one({"id": offer_id}, {"$set": update_data})
    return {"message": "Offre mise à jour"}


@router.delete("/admin/offers/{offer_id}")
async def admin_delete_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return {"message": "Offre supprimée"}


# ============= ADMIN - UNIVERSITIES =============

@router.get("/admin/universities")
async def admin_get_universities(admin: dict = Depends(get_admin_user)):
    db = get_db()
    universities = await db.universities.find({}, {"_id": 0}).to_list(1000)
    return universities


@router.post("/admin/universities")
async def admin_create_university(uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    university = University(**uni_data.model_dump())
    await db.universities.insert_one(serialize_doc(university.model_dump()))
    return {"message": "Université créée avec succès", "id": university.id}


@router.put("/admin/universities/{uni_id}")
async def admin_update_university(uni_id: str, uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.universities.update_one({"id": uni_id}, {"$set": uni_data.model_dump()})
    return {"message": "Université mise à jour"}


@router.delete("/admin/universities/{uni_id}")
async def admin_delete_university(uni_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.universities.delete_one({"id": uni_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    return {"message": "Université supprimée"}


# ============= ADMIN - HOUSING =============

@router.get("/admin/housing")
async def admin_get_housing(admin: dict = Depends(get_admin_user)):
    db = get_db()
    housing = await db.housing.find({}, {"_id": 0}).to_list(1000)
    return housing


@router.post("/admin/housing")
async def admin_create_housing(housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    housing = Housing(**housing_data.model_dump())
    await db.housing.insert_one(serialize_doc(housing.model_dump()))
    return {"message": "Logement créé avec succès", "id": housing.id}


@router.put("/admin/housing/{housing_id}")
async def admin_update_housing(housing_id: str, housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.housing.update_one({"id": housing_id}, {"$set": housing_data.model_dump()})
    return {"message": "Logement mis à jour"}


@router.delete("/admin/housing/{housing_id}")
async def admin_delete_housing(housing_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.housing.delete_one({"id": housing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Logement non trouvé")
    return {"message": "Logement supprimé"}


# ============= ADMIN - MESSAGES =============

@router.get("/admin/messages")
async def admin_get_messages(admin: dict = Depends(get_admin_user)):
    db = get_db()
    messages = await db.messages.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return messages


@router.put("/admin/messages/{message_id}/read")
async def admin_mark_message_read(message_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.messages.update_one({"id": message_id}, {"$set": {"isRead": True}})
    return {"message": "Marqué comme lu"}


@router.post("/admin/messages/{message_id}/reply")
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

@router.get("/admin/applications")
async def admin_get_applications(admin: dict = Depends(get_admin_user)):
    db = get_db()
    applications = await db.applications.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return applications


@router.put("/admin/applications/{app_id}/status")
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


@router.put("/admin/applications/{app_id}/payment-status")
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


@router.post("/admin/applications/{app_id}/message")
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


@router.get("/admin/applications/{app_id}/messages")
async def admin_get_application_messages(app_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id}, {"_id": 0, "adminMessages": 1})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    return application.get("adminMessages", [])


@router.put("/applications/{app_id}/resubmit")
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


@router.put("/applications/{app_id}/update-documents")
async def update_application_documents(app_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    if application["userId"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return {"current_documents": application.get("documents", [])}


@router.put("/applications/{app_id}/documents")
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



# ============= BLOG - ADMIN =============

# ============= BLOG - ADMIN =============

@router.get("/admin/blog")
async def admin_get_blog_posts(admin: dict = Depends(get_admin_user)):
    db = get_db()
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return posts


@router.post("/admin/blog")
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


@router.put("/admin/blog/{post_id}")
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


@router.delete("/admin/blog/{post_id}")
async def admin_delete_blog_post(post_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return {"message": "Article supprimé"}



# ============= COMMUNITY - ADMIN =============

# ============= COMMUNITY - ADMIN =============

@router.get("/admin/community")
async def admin_get_community_posts(admin: dict = Depends(get_admin_user)):
    db = get_db()
    posts = await db.community_posts.find({}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return posts


@router.delete("/admin/community/{post_id}")
async def admin_delete_community_post(post_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.community_posts.update_one({"id": post_id}, {"$set": {"deleted": True}})
    return {"message": "Discussion supprimée"}


@router.put("/admin/community/{post_id}/pin")
async def admin_toggle_pin_community_post(post_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    post = await db.community_posts.find_one({"id": post_id}, {"_id": 0, "pinned": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Discussion non trouvée")
    new_pin = not post.get("pinned", False)
    await db.community_posts.update_one({"id": post_id}, {"$set": {"pinned": new_pin}})
    return {"pinned": new_pin}


@router.delete("/admin/community/replies/{reply_id}")
async def admin_delete_community_reply(reply_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    reply = await db.community_replies.find_one({"id": reply_id})
    if reply:
        await db.community_replies.update_one({"id": reply_id}, {"$set": {"deleted": True}})
        await db.community_posts.update_one({"id": reply["postId"]}, {"$inc": {"replyCount": -1}})
    return {"message": "Réponse supprimée"}


# ============= ADMIN - STATS =============

@router.get("/admin/stats")
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

@router.post("/admin/setup")
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

@router.get("/admin/chats")
async def admin_get_chats(admin: dict = Depends(get_admin_user)):
    db = get_db()
    chats = await db.chats.find({"status": "active"}, {"_id": 0}).sort("lastMessageAt", -1).to_list(50)
    return chats


@router.get("/admin/chats/all")
async def admin_get_all_chats(admin: dict = Depends(get_admin_user)):
    db = get_db()
    chats = await db.chats.find({}, {"_id": 0}).sort("lastMessageAt", -1).to_list(100)
    return chats


# ============= PAYMENT SETTINGS =============

@router.get("/admin/payment-settings")
async def get_payment_settings(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default = PaymentSettings()
        return default.model_dump()
    return settings


@router.post("/admin/payment-settings")
async def update_payment_settings(settings: PaymentSettings, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    settings_dict = settings.model_dump()
    await db.payment_settings.update_one(
        {"id": "payment_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return {"message": "Paramètres de paiement mis à jour"}


@router.get("/payment-settings")
async def get_public_payment_settings():
    db = get_db()
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default = PaymentSettings()
        return default.model_dump()
    return settings


# ============= NEWSLETTER =============

@router.post("/newsletter/subscribe")
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


@router.get("/admin/newsletter")
async def admin_get_newsletter(admin: dict = Depends(get_admin_user)):
    db = get_db()
    subscribers = await db.newsletter.find({}, {"_id": 0}).sort("subscribedAt", -1).to_list(5000)
    return subscribers


@router.delete("/admin/newsletter/{email}")
async def admin_delete_newsletter(email: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.newsletter.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Abonné non trouvé")
    return {"message": "Abonné supprimé"}



# ============= ADMIN - BANNERS =============

@router.get("/admin/site-settings/banners")
async def admin_get_banners(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_banners"}, {"_id": 0})
    if not doc:
        return {"slides": []}
    return {"slides": doc.get("slides", [])}


@router.post("/admin/site-settings/banners")
async def admin_save_banners(data: BannerSlidesUpdate, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    await db.site_settings.update_one(
        {"id": "site_banners"},
        {"$set": {"id": "site_banners", "slides": [s.model_dump() for s in data.slides]}},
        upsert=True
    )
    return {"message": "Bannières mises à jour"}



# ============= ADMIN - TESTIMONIALS =============

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



# ============= ADMIN - CONTACTS =============

@router.get("/admin/contacts")
async def admin_get_contacts(admin: dict = Depends(get_admin_user)):
    db = get_db()
    contacts = await db.contact_messages.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return contacts


@router.put("/admin/contacts/{contact_id}/read")
async def admin_mark_contact_read(contact_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.contact_messages.update_one({"id": contact_id}, {"$set": {"isRead": True}})
    return {"message": "Marque comme lu"}


@router.delete("/admin/contacts/{contact_id}")
async def admin_delete_contact(contact_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.contact_messages.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message non trouve")
    return {"message": "Message supprime"}



# ============= ADMIN - FAQ =============

@router.get("/admin/faqs")
async def admin_get_faqs(admin: dict = Depends(get_admin_user)):
    db = get_db()
    doc = await db.site_settings.find_one({"id": "site_faqs"}, {"_id": 0})
    if not doc:
        return {"faqs": []}
    return {"faqs": doc.get("faqs", [])}


@router.post("/admin/faqs")
async def admin_save_faqs(data: FAQListUpdate, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.site_settings.update_one(
        {"id": "site_faqs"},
        {"$set": {"id": "site_faqs", "faqs": [f.model_dump() for f in data.faqs]}},
        upsert=True
    )
    return {"message": "FAQ mises a jour"}



# ============= ADMIN - AGENT CODES =============

@router.post("/admin/agent-codes")
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


@router.get("/admin/agent-codes")
async def admin_get_agent_codes(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    codes = await db.agent_codes.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return codes


@router.delete("/admin/agent-codes/{code_id}")
async def admin_delete_agent_code(code_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    result = await db.agent_codes.delete_one({"id": code_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code non trouve")
    return {"message": "Code supprime"}



# ============= ADMIN - AGENTS MANAGEMENT =============

# ============= ADMIN - AGENTS MANAGEMENT =============

@router.get("/admin/agents")
async def admin_get_agents(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    agents = await db.users.find({"role": "agent"}, {"_id": 0, "password": 0}).sort("createdAt", -1).to_list(500)
    for a in agents:
        a["studentsCount"] = await db.agent_students.count_documents({"agentId": a["id"]})
        a["applicationsCount"] = await db.applications.count_documents({"agentId": a["id"]})
    return agents


@router.put("/admin/agents/{agent_id}/approve")
async def admin_approve_agent(agent_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": agent_id, "role": "agent"})
    if not user:
        raise HTTPException(status_code=404, detail="Agent non trouve")
    await db.users.update_one({"id": agent_id}, {"$set": {"isApproved": True}})
    return {"message": "Agent approuve"}


@router.put("/admin/agents/{agent_id}/reject")
async def admin_reject_agent(agent_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": agent_id, "role": "agent"})
    if not user:
        raise HTTPException(status_code=404, detail="Agent non trouve")
    await db.users.update_one({"id": agent_id}, {"$set": {"isApproved": False, "isActive": False}})
    return {"message": "Agent rejete"}



# ============= INSTITUTIONAL PAGES =============

# ============= ADMIN - PAGES =============

@router.put("/admin/pages/{slug}")
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


@router.get("/admin/pages")
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


