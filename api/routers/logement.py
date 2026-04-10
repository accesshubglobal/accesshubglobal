from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from _models import LogementPropertyCreate
from _helpers import (
    get_db, get_current_user, get_admin_user, get_principal_admin,
    get_logement_user, broadcast_to_admins,
)

router = APIRouter()


# ============= REGISTRATION =============

@router.post("/logement/register")
async def register_logement_partner(data: dict):
    from _helpers import hash_password, send_verification_email
    db = get_db()

    # Check email unique
    if await db.users.find_one({"email": data.get("email")}):
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    now = datetime.now(timezone.utc)
    verification_token = str(uuid.uuid4())
    user = {
        "id": str(uuid.uuid4()),
        "firstName": data.get("firstName", ""),
        "lastName": data.get("lastName", ""),
        "email": data.get("email", ""),
        "password": hash_password(data.get("password", "")),
        "phone": data.get("phone", ""),
        "companyName": data.get("companyName", ""),
        "companyDoc": data.get("companyDoc", ""),
        "role": "partenaire_logement",
        "isApproved": False,
        "emailVerified": False,
        "emailVerificationToken": verification_token,
        "createdAt": now.isoformat(),
    }
    await db.users.insert_one(user)
    try:
        await send_verification_email(user["email"], user["firstName"], verification_token)
    except Exception:
        pass
    await broadcast_to_admins({
        "type": "new_logement_partner",
        "message": f"Nouveau partenaire logement : {user['firstName']} {user['lastName']}",
    })
    return {"message": "Compte créé avec succès. Vérifiez votre email."}


# ============= PARTNER STATS =============

@router.get("/logement/stats")
async def get_logement_stats(partner: dict = Depends(get_logement_user)):
    db = get_db()
    total = await db.logement_properties.count_documents({"partnerId": partner["id"]})
    approved = await db.logement_properties.count_documents({"partnerId": partner["id"], "isApproved": True})
    pending = total - approved
    available = await db.logement_properties.count_documents({"partnerId": partner["id"], "isApproved": True, "isAvailable": True})
    return {
        "total": total,
        "approved": approved,
        "pending": pending,
        "available": available,
        "companyName": partner.get("companyName", ""),
    }


# ============= PROPERTIES CRUD =============

@router.get("/logement/properties")
async def get_my_properties(partner: dict = Depends(get_logement_user)):
    db = get_db()
    props = await db.logement_properties.find(
        {"partnerId": partner["id"]}, {"_id": 0}
    ).sort("createdAt", -1).to_list(200)
    return props


@router.post("/logement/properties")
async def create_property(data: LogementPropertyCreate, partner: dict = Depends(get_logement_user)):
    db = get_db()
    doc = {
        "id": str(uuid.uuid4()),
        "partnerId": partner["id"],
        "partnerName": f"{partner.get('firstName','')} {partner.get('lastName','')}",
        "companyName": partner.get("companyName", ""),
        **data.model_dump(),
        "isApproved": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.logement_properties.insert_one(doc)
    await broadcast_to_admins({
        "type": "new_property",
        "message": f"Nouvelle propriété en attente : {doc['title']} par {doc['companyName']}",
    })
    return {k: v for k, v in doc.items() if k != "_id"}


@router.put("/logement/properties/{property_id}")
async def update_property(property_id: str, data: LogementPropertyCreate, partner: dict = Depends(get_logement_user)):
    db = get_db()
    result = await db.logement_properties.update_one(
        {"id": property_id, "partnerId": partner["id"]},
        {"$set": {**data.model_dump(), "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Propriété non trouvée")
    return {"success": True}


@router.delete("/logement/properties/{property_id}")
async def delete_property(property_id: str, partner: dict = Depends(get_logement_user)):
    db = get_db()
    await db.logement_properties.delete_one({"id": property_id, "partnerId": partner["id"]})
    return {"success": True}


# ============= PUBLIC =============

@router.get("/housing-partner")
async def get_public_properties(city: str = None, propertyType: str = None):
    db = get_db()
    query = {"isApproved": True, "isAvailable": True}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if propertyType:
        query["propertyType"] = propertyType
    props = await db.logement_properties.find(query, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return props


# ============= ADMIN MANAGEMENT =============

@router.get("/admin/logement-partners")
async def admin_list_logement_partners(admin: dict = Depends(get_admin_user)):
    db = get_db()
    partners = await db.users.find(
        {"role": "partenaire_logement"}, {"_id": 0, "password": 0}
    ).sort("createdAt", -1).to_list(500)
    return partners


@router.put("/admin/logement-partners/{partner_id}/approve")
async def admin_approve_logement(partner_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.users.update_one(
        {"id": partner_id, "role": "partenaire_logement"},
        {"$set": {"isApproved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    return {"success": True}


@router.put("/admin/logement-partners/{partner_id}/reject")
async def admin_reject_logement(partner_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.users.update_one(
        {"id": partner_id, "role": "partenaire_logement"},
        {"$set": {"isApproved": False}}
    )
    return {"success": True}


@router.get("/admin/logement-properties")
async def admin_list_properties(admin: dict = Depends(get_admin_user)):
    db = get_db()
    props = await db.logement_properties.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return props


@router.put("/admin/logement-properties/{property_id}/approve")
async def admin_approve_property(property_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.logement_properties.update_one(
        {"id": property_id},
        {"$set": {"isApproved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Propriété non trouvée")
    return {"success": True}


@router.delete("/admin/logement-properties/{property_id}")
async def admin_delete_property(property_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    await db.logement_properties.delete_one({"id": property_id})
    return {"success": True}


# ── Logement: verify login code ────────────────────────────────────────────────
@router.post("/logement/verify-login-code")
async def verify_logement_login_code(data: dict, partner: dict = Depends(get_logement_user)):
    stored_code = partner.get("logementCode", "")
    if not stored_code or data.get("code", "").strip().upper() != stored_code.strip().upper():
        raise HTTPException(status_code=400, detail="Code d'activation incorrect. Vérifiez votre code.")
    return {"success": True}


# ── Logement: contract ─────────────────────────────────────────────────────────
@router.get("/logement/contract")
async def get_logement_contract(partner: dict = Depends(get_logement_user)):
    return {
        "contractUrl": partner.get("contractUrl", ""),
        "contractName": partner.get("contractName", "Contrat Logement"),
        "contractUploadedAt": partner.get("contractUploadedAt", ""),
    }


# ── Logement: profile (get + update) ──────────────────────────────────────────
@router.get("/logement/profile")
async def get_logement_profile(partner: dict = Depends(get_logement_user)):
    return {
        "firstName": partner.get("firstName", ""),
        "lastName": partner.get("lastName", ""),
        "email": partner.get("email", ""),
        "phone": partner.get("phone", ""),
        "companyName": partner.get("companyName", ""),
        "companyAddress": partner.get("companyAddress", ""),
        "companyCity": partner.get("companyCity", ""),
        "companyCountry": partner.get("companyCountry", ""),
        "companyWebsite": partner.get("companyWebsite", ""),
        "companyDescription": partner.get("companyDescription", ""),
        "officialDocUrl": partner.get("officialDocUrl", ""),
        "officialDocName": partner.get("officialDocName", ""),
        "idDocUrl": partner.get("idDocUrl", ""),
        "idDocName": partner.get("idDocName", ""),
        "profileComplete": bool(partner.get("companyName") and partner.get("officialDocUrl") and partner.get("idDocUrl")),
    }


@router.put("/logement/profile")
async def update_logement_profile(data: dict, partner: dict = Depends(get_logement_user)):
    db = get_db()
    allowed = {k: v for k, v in data.items() if k in (
        "phone", "companyName", "companyAddress", "companyCity", "companyCountry",
        "companyWebsite", "companyDescription",
        "officialDocUrl", "officialDocName", "idDocUrl", "idDocName"
    )}
    await db.users.update_one({"id": partner["id"]}, {"$set": allowed})
    return {"success": True}


# ── Logement: duplicate property ───────────────────────────────────────────────
@router.post("/logement/properties/{property_id}/duplicate")
async def duplicate_logement_property(property_id: str, partner: dict = Depends(get_logement_user)):
    db = get_db()
    original = await db.logement_properties.find_one({"id": property_id, "partnerId": partner["id"]}, {"_id": 0})
    if not original:
        raise HTTPException(status_code=404, detail="Propriété non trouvée")
    now = datetime.now(timezone.utc).isoformat()
    new_prop = {
        **original,
        "id": str(uuid.uuid4()),
        "title": f"{original['title']} (copie)",
        "isApproved": False,
        "createdAt": now,
    }
    await db.logement_properties.insert_one(new_prop)
    return {k: v for k, v in new_prop.items() if k != "_id"}


# ── Logement: housing inquiries ────────────────────────────────────────────────
@router.get("/logement/inquiries")
async def get_logement_inquiries(partner: dict = Depends(get_logement_user)):
    db = get_db()
    inquiries = await db.logement_inquiries.find(
        {"partnerId": partner["id"]}, {"_id": 0}
    ).sort("createdAt", -1).to_list(200)
    return inquiries


# ── Admin: update logement login code ──────────────────────────────────────────
@router.put("/admin/logement-partners/{partner_id}/login-code")
async def admin_update_logement_login_code(partner_id: str, data: dict, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    new_code = data.get("logementCode", "").strip().upper()
    if not new_code:
        raise HTTPException(status_code=400, detail="Le code ne peut pas être vide")
    partner = await db.users.find_one({"id": partner_id, "role": "partenaire_logement"})
    if not partner:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    await db.users.update_one({"id": partner_id}, {"$set": {"logementCode": new_code}})
    return {"success": True, "logementCode": new_code}


# ── Admin: upload logement contract ────────────────────────────────────────────
@router.put("/admin/logement-partners/{partner_id}/contract")
async def admin_upload_logement_contract(partner_id: str, data: dict, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    partner = await db.users.find_one({"id": partner_id, "role": "partenaire_logement"})
    if not partner:
        raise HTTPException(status_code=404, detail="Partenaire non trouvé")
    await db.users.update_one(
        {"id": partner_id},
        {"$set": {
            "contractUrl": data.get("contractUrl", ""),
            "contractName": data.get("contractName", "Contrat Logement"),
            "contractUploadedAt": datetime.now(timezone.utc).isoformat(),
        }}
    )
    return {"success": True}


# ── Public: submit housing inquiry ─────────────────────────────────────────────
@router.post("/housing-inquiry")
async def submit_housing_inquiry(data: dict):
    db = get_db()
    prop = await db.logement_properties.find_one({"id": data.get("propertyId"), "isApproved": True}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    inquiry = {
        "id": str(uuid.uuid4()),
        "propertyId": data.get("propertyId"),
        "propertyTitle": prop.get("title", ""),
        "partnerId": prop.get("partnerId"),
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "message": data.get("message", ""),
        "isRead": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.logement_inquiries.insert_one(inquiry)
    return {"success": True}

