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

# ============= ADMIN - PARTNER CODES =============

@router.post("/admin/partner-codes")
async def admin_create_partner_code(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    import random, string
    code = "PA-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
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
    await db.partner_codes.insert_one(doc)
    del doc["_id"]
    return doc


@router.get("/admin/partner-codes")
async def admin_get_partner_codes(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    codes = await db.partner_codes.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return codes


@router.delete("/admin/partner-codes/{code_id}")
async def admin_delete_partner_code(code_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    result = await db.partner_codes.delete_one({"id": code_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code non trouvé")
    return {"message": "Code supprimé"}


# ============= ADMIN - PARTNERS MANAGEMENT =============

@router.get("/admin/partners")
async def admin_get_partners(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    partners = await db.users.find({"role": "partenaire"}, {"_id": 0, "password": 0}).sort("createdAt", -1).to_list(500)
    for p in partners:
        p["universitiesCount"] = await db.universities.count_documents({"partnerId": p["id"]})
        p["offersCount"] = await db.offers.count_documents({"partnerId": p["id"]})
    return partners


@router.put("/admin/partners/{partner_id}/approve")
async def admin_approve_partner(partner_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": partner_id, "role": "partenaire"})
    if not user:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    await db.users.update_one({"id": partner_id}, {"$set": {"isApproved": True}})
    return {"message": "Partenaire approuvé"}


@router.put("/admin/partners/{partner_id}/reject")
async def admin_reject_partner(partner_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": partner_id, "role": "partenaire"})
    if not user:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    await db.users.update_one({"id": partner_id}, {"$set": {"isApproved": False, "isActive": False}})
    return {"message": "Partenaire rejeté"}


# ============= ADMIN - PARTNER CONTENT MODERATION =============

@router.get("/admin/partner-universities")
async def admin_get_partner_universities(admin: dict = Depends(get_admin_user)):
    db = get_db()
    unis = await db.universities.find(
        {"partnerId": {"$exists": True, "$ne": None}}, {"_id": 0}
    ).sort("createdAt", -1).to_list(500)
    for uni in unis:
        partner = await db.users.find_one({"id": uni.get("partnerId")}, {"_id": 0, "password": 0})
        uni["partnerName"] = f"{partner['firstName']} {partner['lastName']}" if partner else "Inconnu"
        uni["partnerCompany"] = partner.get("company", "") if partner else ""
    return unis


@router.put("/admin/partner-universities/{uni_id}/approve")
async def admin_approve_partner_university(uni_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id, "partnerId": {"$exists": True}})
    if not uni:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    await db.universities.update_one({"id": uni_id}, {"$set": {"isApproved": True}})
    return {"message": "Université approuvée"}


@router.put("/admin/partner-universities/{uni_id}/reject")
async def admin_reject_partner_university(uni_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id, "partnerId": {"$exists": True}})
    if not uni:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    await db.universities.update_one({"id": uni_id}, {"$set": {"isApproved": False}})
    return {"message": "Université rejetée"}


@router.get("/admin/partner-offers")
async def admin_get_partner_offers(admin: dict = Depends(get_admin_user)):
    db = get_db()
    offers = await db.offers.find(
        {"partnerId": {"$exists": True, "$ne": None}}, {"_id": 0}
    ).sort("createdAt", -1).to_list(500)
    for offer in offers:
        partner = await db.users.find_one({"id": offer.get("partnerId")}, {"_id": 0, "password": 0})
        offer["partnerName"] = f"{partner['firstName']} {partner['lastName']}" if partner else "Inconnu"
        offer["partnerCompany"] = partner.get("company", "") if partner else ""
    return offers


@router.put("/admin/partner-offers/{offer_id}/approve")
async def admin_approve_partner_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id, "partnerId": {"$exists": True}})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    await db.offers.update_one({"id": offer_id}, {"$set": {"isApproved": True}})
    return {"message": "Offre approuvée"}


@router.put("/admin/partner-offers/{offer_id}/reject")
async def admin_reject_partner_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id, "partnerId": {"$exists": True}})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    await db.offers.update_one({"id": offer_id}, {"$set": {"isApproved": False}})
    return {"message": "Offre rejetée"}


# ============= PARTNER DASHBOARD ENDPOINTS =============

@router.get("/partner/stats")
async def partner_stats(partner: dict = Depends(get_partner_user)):
    db = get_db()
    uni = await db.universities.find_one({"partnerId": partner["id"]}, {"_id": 0})
    offers_count = await db.offers.count_documents({"partnerId": partner["id"]})
    approved_offers = await db.offers.count_documents({"partnerId": partner["id"], "isApproved": True})
    return {
        "hasUniversity": uni is not None,
        "universityApproved": uni.get("isApproved", False) if uni else False,
        "universityName": uni.get("name", "") if uni else "",
        "offersCount": offers_count,
        "approvedOffersCount": approved_offers,
    }


@router.get("/partner/university")
async def partner_get_university(partner: dict = Depends(get_partner_user)):
    db = get_db()
    uni = await db.universities.find_one({"partnerId": partner["id"]}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Aucune université soumise")
    return uni


@router.post("/partner/university")
async def partner_create_university(data: UniversityCreate, partner: dict = Depends(get_partner_user)):
    db = get_db()
    existing = await db.universities.find_one({"partnerId": partner["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà soumis une université")

    uni = University(**data.model_dump())
    uni_doc = uni.model_dump()
    uni_doc["createdAt"] = uni_doc["createdAt"].isoformat()
    uni_doc["partnerId"] = partner["id"]
    uni_doc["isApproved"] = False
    await db.universities.insert_one(uni_doc)
    del uni_doc["_id"]
    await broadcast_to_admins({
        "type": "partner_content",
        "title": "Nouvelle université partenaire",
        "message": f"{partner['firstName']} {partner['lastName']} a soumis une université: {data.name}",
        "data": {}
    })
    return uni_doc


@router.put("/partner/university/{uni_id}")
async def partner_update_university(uni_id: str, data: UniversityCreate, partner: dict = Depends(get_partner_user)):
    db = get_db()
    uni = await db.universities.find_one({"id": uni_id, "partnerId": partner["id"]})
    if not uni:
        raise HTTPException(status_code=404, detail="Université non trouvée ou non autorisée")

    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["isApproved"] = False  # Re-pending approval after edit
    await db.universities.update_one({"id": uni_id}, {"$set": update})
    updated = await db.universities.find_one({"id": uni_id}, {"_id": 0})
    return updated


@router.get("/partner/offers")
async def partner_get_offers(partner: dict = Depends(get_partner_user)):
    db = get_db()
    offers = await db.offers.find({"partnerId": partner["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return offers


@router.post("/partner/offers")
async def partner_create_offer(data: OfferCreate, partner: dict = Depends(get_partner_user)):
    db = get_db()
    existing_uni = await db.universities.find_one({"partnerId": partner["id"]})
    if not existing_uni:
        raise HTTPException(status_code=400, detail="Vous devez d'abord soumettre une université avant de créer des offres.")
    offer = Offer(**data.model_dump())
    offer_doc = offer.model_dump()
    offer_doc["createdAt"] = offer_doc["createdAt"].isoformat()
    offer_doc["partnerId"] = partner["id"]
    offer_doc["isApproved"] = False
    await db.offers.insert_one(offer_doc)
    del offer_doc["_id"]
    await broadcast_to_admins({
        "type": "partner_content",
        "title": "Nouvelle offre partenaire",
        "message": f"{partner['firstName']} {partner['lastName']} a soumis une offre: {data.title}",
        "data": {}
    })
    return offer_doc


@router.put("/partner/offers/{offer_id}")
async def partner_update_offer(offer_id: str, data: OfferCreate, partner: dict = Depends(get_partner_user)):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id, "partnerId": partner["id"]})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée ou non autorisée")

    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["isApproved"] = False  # Re-pending approval after edit
    await db.offers.update_one({"id": offer_id}, {"$set": update})
    updated = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    return updated


@router.delete("/partner/offers/{offer_id}")
async def partner_delete_offer(offer_id: str, partner: dict = Depends(get_partner_user)):
    db = get_db()
    offer = await db.offers.find_one({"id": offer_id, "partnerId": partner["id"]})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée ou non autorisée")
    await db.offers.delete_one({"id": offer_id})
    return {"message": "Offre supprimée"}



# ── Partner verify login code ─────────────────────────────────────────────────
@router.post("/partner/verify-login-code")
async def verify_partner_login_code(data: dict, partner: dict = Depends(get_partner_user)):
    stored_code = partner.get("partnerCode", "")
    if not stored_code or data.get("code", "").strip().upper() != stored_code.strip().upper():
        raise HTTPException(status_code=400, detail="Code d'activation incorrect. Vérifiez votre code.")
    return {"success": True}


# ── Partner contract ───────────────────────────────────────────────────────────
@router.get("/partner/contract")
async def get_partner_contract(partner: dict = Depends(get_partner_user)):
    return {
        "contractUrl": partner.get("contractUrl", ""),
        "contractName": partner.get("contractName", "Contrat Partenaire"),
        "contractUploadedAt": partner.get("contractUploadedAt", ""),
    }


# ── Admin: update partner login code ──────────────────────────────────────────
@router.put("/admin/partners/{partner_id}/login-code")
async def admin_update_partner_login_code(partner_id: str, data: dict, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    new_code = data.get("partnerCode", "").strip().upper()
    if not new_code:
        raise HTTPException(status_code=400, detail="Le code ne peut pas être vide")
    partner = await db.users.find_one({"id": partner_id, "role": "partenaire"})
    if not partner:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    await db.users.update_one({"id": partner_id}, {"$set": {"partnerCode": new_code}})
    return {"success": True, "partnerCode": new_code}


# ── Admin: upload partner contract ────────────────────────────────────────────
@router.put("/admin/partners/{partner_id}/contract")
async def admin_upload_partner_contract(partner_id: str, data: dict, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    partner = await db.users.find_one({"id": partner_id, "role": "partenaire"})
    if not partner:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    await db.users.update_one(
        {"id": partner_id},
        {"$set": {
            "contractUrl": data.get("contractUrl", ""),
            "contractName": data.get("contractName", "Contrat Partenaire"),
            "contractUploadedAt": datetime.now(timezone.utc).isoformat(),
        }}
    )
    return {"success": True}


# ============= PARTNER MESSAGING =============

@router.post("/admin/partner-messages")
async def admin_send_message(data: dict, admin: dict = Depends(get_admin_user)):
    db = get_db()
    partner_id = data.get("partnerId")
    partner = await db.users.find_one({"id": partner_id, "role": "partenaire"})
    if not partner:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    msg = {
        "id": str(uuid.uuid4()),
        "partnerId": partner_id,
        "fromRole": "admin",
        "fromId": admin["id"],
        "fromName": f"{admin['firstName']} {admin['lastName']}",
        "message": data.get("message", ""),
        "offerId": data.get("offerId"),
        "offerTitle": data.get("offerTitle"),
        "fileUrl": data.get("fileUrl"),
        "fileName": data.get("fileName"),
        "fileType": data.get("fileType"),
        "isRead": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_messages.insert_one(msg)
    del msg["_id"]
    return msg


@router.get("/admin/partner-messages/{partner_id}")
async def admin_get_messages(partner_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    msgs = await db.partner_messages.find(
        {"partnerId": partner_id}, {"_id": 0}
    ).sort("createdAt", 1).to_list(500)
    await db.partner_messages.update_many(
        {"partnerId": partner_id, "fromRole": "partenaire", "isRead": False},
        {"$set": {"isRead": True}}
    )
    return msgs


@router.get("/partner/messages")
async def partner_get_messages(partner: dict = Depends(get_partner_user)):
    db = get_db()
    msgs = await db.partner_messages.find(
        {"partnerId": partner["id"]}, {"_id": 0}
    ).sort("createdAt", 1).to_list(500)
    await db.partner_messages.update_many(
        {"partnerId": partner["id"], "fromRole": "admin", "isRead": False},
        {"$set": {"isRead": True}}
    )
    return msgs


@router.post("/partner/messages")
async def partner_send_message(data: dict, partner: dict = Depends(get_partner_user)):
    db = get_db()
    msg = {
        "id": str(uuid.uuid4()),
        "partnerId": partner["id"],
        "fromRole": "partenaire",
        "fromId": partner["id"],
        "fromName": f"{partner['firstName']} {partner['lastName']}",
        "message": data.get("message", ""),
        "offerId": data.get("offerId"),
        "offerTitle": data.get("offerTitle"),
        "fileUrl": data.get("fileUrl"),
        "fileName": data.get("fileName"),
        "fileType": data.get("fileType"),
        "isRead": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_messages.insert_one(msg)
    del msg["_id"]
    return msg


@router.get("/partner/messages/unread-count")
async def partner_unread_count(partner: dict = Depends(get_partner_user)):
    db = get_db()
    count = await db.partner_messages.count_documents(
        {"partnerId": partner["id"], "fromRole": "admin", "isRead": False}
    )
    return {"count": count}

