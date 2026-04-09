from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
import uuid
import random
import string

from _models import (
    EmployerCompanyUpdate, JobOfferCreate, JobApplicationCreate,
)
from _helpers import (
    get_db, get_current_user, get_admin_user, get_principal_admin,
    get_employer_user, broadcast_to_admins, broadcast_newsletter_job,
)

router = APIRouter()


# ============= ADMIN - EMPLOYER CODES =============

@router.post("/admin/employer-codes")
async def admin_create_employer_code(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    code = "EM-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
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
    await db.employer_codes.insert_one(doc)
    del doc["_id"]
    return doc


@router.get("/admin/employer-codes")
async def admin_get_employer_codes(admin: dict = Depends(get_principal_admin)):
    db = get_db()
    codes = await db.employer_codes.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return codes


@router.delete("/admin/employer-codes/{code_id}")
async def admin_delete_employer_code(code_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    result = await db.employer_codes.delete_one({"id": code_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code non trouvé")
    return {"message": "Code supprimé"}


# ============= ADMIN - EMPLOYERS MANAGEMENT =============

@router.get("/admin/employers")
async def admin_get_employers(admin: dict = Depends(get_admin_user)):
    db = get_db()
    employers = await db.users.find({"role": "employeur"}, {"_id": 0, "password": 0}).sort("createdAt", -1).to_list(500)
    for e in employers:
        e["jobOffersCount"] = await db.job_offers.count_documents({"employerId": e["id"]})
        e["approvedOffersCount"] = await db.job_offers.count_documents({"employerId": e["id"], "isApproved": True})
        company = await db.employer_companies.find_one({"employerId": e["id"]}, {"_id": 0})
        e["hasCompanyInfo"] = company is not None
        e["companyName"] = company.get("companyName", "") if company else ""
    return employers


@router.put("/admin/employers/{employer_id}/approve")
async def admin_approve_employer(employer_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": employer_id, "role": "employeur"})
    if not user:
        raise HTTPException(status_code=404, detail="Employeur non trouvé")
    await db.users.update_one({"id": employer_id}, {"$set": {"isApproved": True, "pendingCompanyUpdate": False}})
    return {"message": "Employeur approuvé"}


@router.put("/admin/employers/{employer_id}/reject")
async def admin_reject_employer(employer_id: str, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    user = await db.users.find_one({"id": employer_id, "role": "employeur"})
    if not user:
        raise HTTPException(status_code=404, detail="Employeur non trouvé")
    await db.users.update_one({"id": employer_id}, {"$set": {"isApproved": False, "isActive": False}})
    return {"message": "Employeur rejeté"}


# ── Admin: update employer login code ────────────────────────────────────────
@router.put("/admin/employers/{employer_id}/login-code")
async def admin_update_employer_login_code(employer_id: str, data: dict, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    new_code = data.get("employerCode", "").strip().upper()
    if not new_code:
        raise HTTPException(status_code=400, detail="Le code ne peut pas être vide")
    employer = await db.users.find_one({"id": employer_id, "role": "employeur"})
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur non trouvé")
    await db.users.update_one({"id": employer_id}, {"$set": {"employerCode": new_code}})
    return {"success": True, "employerCode": new_code}


# ── Admin: upload employer contract ──────────────────────────────────────────
@router.put("/admin/employers/{employer_id}/contract")
async def admin_upload_employer_contract(employer_id: str, data: dict, admin: dict = Depends(get_principal_admin)):
    db = get_db()
    employer = await db.users.find_one({"id": employer_id, "role": "employeur"})
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur non trouvé")
    await db.users.update_one(
        {"id": employer_id},
        {"$set": {
            "contractUrl": data.get("contractUrl", ""),
            "contractName": data.get("contractName", "Contrat Employeur"),
            "contractUploadedAt": datetime.now(timezone.utc).isoformat(),
        }}
    )
    return {"success": True}


# ============= ADMIN - JOB OFFERS MODERATION =============

@router.get("/admin/job-offers")
async def admin_get_job_offers(admin: dict = Depends(get_admin_user)):
    db = get_db()
    offers = await db.job_offers.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    for offer in offers:
        employer = await db.users.find_one({"id": offer.get("employerId")}, {"_id": 0, "password": 0})
        company = await db.employer_companies.find_one({"employerId": offer.get("employerId")}, {"_id": 0})
        offer["employerName"] = f"{employer['firstName']} {employer['lastName']}" if employer else "Inconnu"
        offer["companyName"] = company.get("companyName", "") if company else ""
    return offers


@router.put("/admin/job-offers/{offer_id}/approve")
async def admin_approve_job_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    offer = await db.job_offers.find_one({"id": offer_id})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    await db.job_offers.update_one({"id": offer_id}, {"$set": {"isApproved": True, "approvedAt": datetime.now(timezone.utc).isoformat()}})
    # Send newsletter
    updated = await db.job_offers.find_one({"id": offer_id}, {"_id": 0})
    import asyncio
    asyncio.create_task(broadcast_newsletter_job(updated))
    return {"message": "Offre approuvée"}


@router.put("/admin/job-offers/{offer_id}/reject")
async def admin_reject_job_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    offer = await db.job_offers.find_one({"id": offer_id})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    await db.job_offers.update_one({"id": offer_id}, {"$set": {"isApproved": False}})
    return {"message": "Offre rejetée"}


@router.delete("/admin/job-offers/{offer_id}")
async def admin_delete_job_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    db = get_db()
    result = await db.job_offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return {"message": "Offre supprimée"}


@router.post("/admin/job-offers")
async def admin_create_job_offer(data: JobOfferCreate, admin: dict = Depends(get_admin_user)):
    """Admin publishes a job offer directly (on behalf of a company)."""
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    offer_id = str(uuid.uuid4())
    offer = {
        **data.model_dump(),
        "id": offer_id,
        "employerId": admin["id"],
        "employerName": f"{admin['firstName']} {admin['lastName']}",
        "companyName": data.companyName if hasattr(data, 'companyName') else "AccessHub Global",
        "companyLogoUrl": "",
        "isApproved": True,
        "isAdminOffer": True,
        "views": 0,
        "createdAt": now,
        "updatedAt": now,
        "approvedAt": now,
    }
    await db.job_offers.insert_one(offer)
    del offer["_id"]
    import asyncio
    asyncio.create_task(broadcast_newsletter_job(offer))
    return offer


# ============= ADMIN - JOB APPLICATIONS =============

@router.get("/admin/job-applications")
async def admin_get_job_applications(admin: dict = Depends(get_admin_user)):
    db = get_db()
    apps = await db.job_applications.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return apps


# ============= PUBLIC - JOB OFFERS =============

@router.get("/job-offers")
async def get_public_job_offers(sector: str = None, contractType: str = None, country: str = None):
    db = get_db()
    query = {"isApproved": True}
    if sector:
        query["sector"] = sector
    if contractType:
        query["contractType"] = contractType
    if country:
        query["country"] = country
    offers = await db.job_offers.find(query, {"_id": 0}).sort("createdAt", -1).to_list(100)
    for offer in offers:
        company = await db.employer_companies.find_one({"employerId": offer.get("employerId")}, {"_id": 0})
        offer["companyLogoUrl"] = company.get("logoUrl", "") if company else ""
        offer["companyDescription"] = company.get("description", "") if company else ""
    return offers


@router.get("/job-offers/{offer_id}")
async def get_public_job_offer(offer_id: str):
    db = get_db()
    offer = await db.job_offers.find_one({"id": offer_id, "isApproved": True}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    company = await db.employer_companies.find_one({"employerId": offer.get("employerId")}, {"_id": 0})
    if company:
        offer["companyInfo"] = company
    await db.job_offers.update_one({"id": offer_id}, {"$inc": {"views": 1}})
    return offer


# ============= PUBLIC - JOB APPLICATIONS =============

@router.post("/job-applications")
async def apply_to_job(data: JobApplicationCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    offer = await db.job_offers.find_one({"id": data.jobOfferId, "isApproved": True})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    existing = await db.job_applications.find_one({"jobOfferId": data.jobOfferId, "applicantId": current_user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")
    app_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    application = {
        "id": app_id,
        "jobOfferId": data.jobOfferId,
        "jobTitle": offer.get("title", ""),
        "employerId": offer.get("employerId", ""),
        "applicantId": current_user["id"],
        "applicantName": f"{current_user['firstName']} {current_user['lastName']}",
        "applicantEmail": current_user["email"],
        "applicantPhone": current_user.get("phone", ""),
        "coverLetter": data.coverLetter,
        "cvUrl": data.cvUrl,
        "portfolioUrl": data.portfolioUrl or "",
        "linkedinUrl": data.linkedinUrl or "",
        "availableFrom": data.availableFrom or "",
        "expectedSalary": data.expectedSalary or "",
        "status": "pending",
        "createdAt": now,
    }
    await db.job_applications.insert_one(application)
    del application["_id"]
    await broadcast_to_admins({
        "type": "job_application",
        "title": "Nouvelle candidature emploi",
        "message": f"{current_user['firstName']} {current_user['lastName']} a postulé à {offer.get('title', '')}",
        "data": {"applicationId": app_id}
    })
    return application


# ============= EMPLOYER DASHBOARD =============

@router.get("/employer/stats")
async def employer_stats(employer: dict = Depends(get_employer_user)):
    db = get_db()
    company = await db.employer_companies.find_one({"employerId": employer["id"]}, {"_id": 0})
    total_offers = await db.job_offers.count_documents({"employerId": employer["id"]})
    approved_offers = await db.job_offers.count_documents({"employerId": employer["id"], "isApproved": True})
    pending_offers = await db.job_offers.count_documents({"employerId": employer["id"], "isApproved": False})
    total_applications = await db.job_applications.count_documents({"employerId": employer["id"]})
    pending_applications = await db.job_applications.count_documents({"employerId": employer["id"], "status": "pending"})
    return {
        "hasCompany": company is not None,
        "companyApproved": employer.get("isApproved", False),
        "pendingCompanyUpdate": employer.get("pendingCompanyUpdate", False),
        "companyName": company.get("companyName", "") if company else "",
        "totalOffers": total_offers,
        "approvedOffers": approved_offers,
        "pendingOffers": pending_offers,
        "totalApplications": total_applications,
        "pendingApplications": pending_applications,
    }


@router.get("/employer/company")
async def employer_get_company(employer: dict = Depends(get_employer_user)):
    db = get_db()
    company = await db.employer_companies.find_one({"employerId": employer["id"]}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Aucune information entreprise")
    return company


@router.post("/employer/company")
async def employer_create_company(data: EmployerCompanyUpdate, employer: dict = Depends(get_employer_user)):
    db = get_db()
    existing = await db.employer_companies.find_one({"employerId": employer["id"]})
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        **data.model_dump(),
        "id": str(uuid.uuid4()),
        "employerId": employer["id"],
        "createdAt": now,
        "updatedAt": now,
    }
    if existing:
        doc["id"] = existing.get("id", str(uuid.uuid4()))
        doc["createdAt"] = existing.get("createdAt", now)
        await db.employer_companies.replace_one({"employerId": employer["id"]}, doc)
        # Company update → reset approval so admin can re-verify
        await db.users.update_one(
            {"id": employer["id"]},
            {"$set": {"isApproved": False, "pendingCompanyUpdate": True}}
        )
    else:
        await db.employer_companies.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/employer/job-offers")
async def employer_get_job_offers(employer: dict = Depends(get_employer_user)):
    db = get_db()
    offers = await db.job_offers.find({"employerId": employer["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    for offer in offers:
        offer["applicationsCount"] = await db.job_applications.count_documents({"jobOfferId": offer["id"]})
    return offers


@router.post("/employer/job-offers")
async def employer_create_job_offer(data: JobOfferCreate, employer: dict = Depends(get_employer_user)):
    db = get_db()
    if not employer.get("isApproved"):
        raise HTTPException(status_code=403, detail="Votre compte doit être approuvé par l'admin avant de publier des offres.")
    company = await db.employer_companies.find_one({"employerId": employer["id"]})
    if not company:
        raise HTTPException(status_code=400, detail="Vous devez d'abord renseigner les informations de votre entreprise")
    now = datetime.now(timezone.utc).isoformat()
    offer_id = str(uuid.uuid4())
    offer = {
        **data.model_dump(),
        "id": offer_id,
        "employerId": employer["id"],
        "employerName": f"{employer['firstName']} {employer['lastName']}",
        "companyName": company.get("companyName", ""),
        "companyLogoUrl": company.get("logoUrl", ""),
        "isApproved": False,
        "views": 0,
        "createdAt": now,
        "updatedAt": now,
    }
    await db.job_offers.insert_one(offer)
    del offer["_id"]
    await broadcast_to_admins({
        "type": "job_offer",
        "title": "Nouvelle offre d'emploi",
        "message": f"{company.get('companyName', employer['firstName'])} a soumis une offre: {data.title}",
        "data": {"offerId": offer_id}
    })
    return offer


@router.put("/employer/job-offers/{offer_id}")
async def employer_update_job_offer(offer_id: str, data: JobOfferCreate, employer: dict = Depends(get_employer_user)):
    db = get_db()
    offer = await db.job_offers.find_one({"id": offer_id, "employerId": employer["id"]})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    update = {**data.model_dump(), "isApproved": False, "updatedAt": datetime.now(timezone.utc).isoformat()}
    await db.job_offers.update_one({"id": offer_id}, {"$set": update})
    updated = await db.job_offers.find_one({"id": offer_id}, {"_id": 0})
    return updated


@router.delete("/employer/job-offers/{offer_id}")
async def employer_delete_job_offer(offer_id: str, employer: dict = Depends(get_employer_user)):
    db = get_db()
    result = await db.job_offers.delete_one({"id": offer_id, "employerId": employer["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return {"message": "Offre supprimée"}


@router.get("/employer/applications")
async def employer_get_applications(employer: dict = Depends(get_employer_user)):
    db = get_db()
    apps = await db.job_applications.find({"employerId": employer["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return apps


@router.put("/employer/applications/{app_id}/status")
async def employer_update_application_status(app_id: str, body: dict, employer: dict = Depends(get_employer_user)):
    db = get_db()
    app = await db.job_applications.find_one({"id": app_id, "employerId": employer["id"]})
    if not app:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    status = body.get("status")
    if status not in ("pending", "reviewing", "accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Statut invalide")
    await db.job_applications.update_one({"id": app_id}, {"$set": {"status": status}})
    return {"message": "Statut mis à jour"}


@router.get("/user/job-applications")
async def user_get_job_applications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    apps = await db.job_applications.find({"applicantId": current_user["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return apps


# ── Employer verify login code ────────────────────────────────────────────────
@router.post("/employer/verify-login-code")
async def verify_employer_login_code(data: dict, employer: dict = Depends(get_employer_user)):
    stored_code = employer.get("employerCode", "")
    if not stored_code or data.get("code", "").strip().upper() != stored_code.strip().upper():
        raise HTTPException(status_code=400, detail="Code d'activation incorrect. Vérifiez votre code.")
    return {"success": True}


# ── Employer contract ─────────────────────────────────────────────────────────
@router.get("/employer/contract")
async def get_employer_contract(employer: dict = Depends(get_employer_user)):
    return {
        "contractUrl": employer.get("contractUrl", ""),
        "contractName": employer.get("contractName", "Contrat Employeur"),
        "contractUploadedAt": employer.get("contractUploadedAt", ""),
    }


# ── Duplicate job offer ───────────────────────────────────────────────────────
@router.post("/employer/job-offers/{offer_id}/duplicate")
async def employer_duplicate_job_offer(offer_id: str, employer: dict = Depends(get_employer_user)):
    db = get_db()
    offer = await db.job_offers.find_one({"id": offer_id, "employerId": employer["id"]}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    now = datetime.now(timezone.utc).isoformat()
    new_offer = {
        **offer,
        "id": str(uuid.uuid4()),
        "title": f"Copie de {offer['title']}",
        "isApproved": False,
        "views": 0,
        "createdAt": now,
        "updatedAt": now,
    }
    await db.job_offers.insert_one(new_offer)
    del new_offer["_id"]
    return new_offer


# ============= JOB FAVORITES =============

@router.post("/user/job-favorites/{offer_id}")
async def toggle_job_favorite(offer_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"id": current_user["id"]})
    job_favorites = user.get("jobFavorites", [])
    if offer_id in job_favorites:
        job_favorites.remove(offer_id)
        action = "removed"
    else:
        job_favorites.append(offer_id)
        action = "added"
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"jobFavorites": job_favorites}})
    return {"action": action, "jobFavorites": job_favorites}


@router.get("/user/job-favorites")
async def get_job_favorites(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"id": current_user["id"]})
    job_favorites = user.get("jobFavorites", [])
    if not job_favorites:
        return []
    offers = await db.job_offers.find({"id": {"$in": job_favorites}, "isApproved": True}, {"_id": 0}).to_list(100)
    return offers


# ============= PUBLIC COMPANY PROFILE =============

@router.get("/companies/{employer_id}")
async def get_company_profile(employer_id: str):
    db = get_db()
    company = await db.employer_companies.find_one({"employerId": employer_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Profil entreprise non trouvé")
    offers = await db.job_offers.find({"employerId": employer_id, "isApproved": True}, {"_id": 0}).sort("createdAt", -1).to_list(50)
    employer = await db.users.find_one({"id": employer_id}, {"_id": 0, "password": 0})
    return {
        "company": company,
        "offers": offers,
        "memberSince": employer.get("createdAt", "") if employer else "",
    }


# ============= PUBLIC COMPANIES SHOWCASE =============

@router.get("/featured-companies/{company_id}")
async def get_featured_company(company_id: str):
    db = get_db()
    company = await db.featured_companies.find_one(
        {"id": company_id, "isActive": True}, {"_id": 0}
    )
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    return company


@router.get("/companies-showcase")
async def get_companies_showcase():
    db = get_db()

    # Admin-featured: main (AccessHub Global) first, then others
    featured = await db.featured_companies.find(
        {"isActive": True}, {"_id": 0}
    ).sort("isMain", -1).to_list(50)
    main_company = next((c for c in featured if c.get("isMain")), None)
    other_featured = [c for c in featured if not c.get("isMain")]

    # Approved employer companies with company info
    employer_companies = await db.employer_companies.find({}, {"_id": 0}).to_list(100)
    employers_data = []
    for ec in employer_companies:
        employer = await db.users.find_one(
            {"id": ec["employerId"], "isApproved": True, "role": "employeur"},
            {"_id": 0, "id": 1}
        )
        if not employer:
            continue
        active_offers = await db.job_offers.count_documents(
            {"employerId": ec["employerId"], "isApproved": True}
        )
        employers_data.append({
            "id": ec["employerId"],
            "name": ec.get("companyName", ""),
            "logo": ec.get("logoUrl", ""),
            "coverUrl": ec.get("coverUrl", ""),
            "description": ec.get("description", ""),
            "sector": ec.get("sector", ""),
            "city": ec.get("city", ""),
            "country": ec.get("country", ""),
            "website": ec.get("website", ""),
            "activeOffers": active_offers,
            "type": "employer",
        })

    return {
        "main": main_company,
        "others": other_featured,
        "employers": employers_data,
    }
