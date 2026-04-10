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

# ============= AGENT DASHBOARD =============

@router.get("/agent/dashboard-stats")
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

@router.get("/agent/students")
async def agent_get_students(agent: dict = Depends(get_agent_user)):
    db = get_db()
    students = await db.agent_students.find({"agentId": agent["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return students


@router.post("/agent/students")
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


@router.put("/agent/students/{student_id}")
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


@router.delete("/agent/students/{student_id}")
async def agent_delete_student(student_id: str, agent: dict = Depends(get_agent_user)):
    db = get_db()
    result = await db.agent_students.delete_one({"id": student_id, "agentId": agent["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Etudiant non trouve")
    return {"message": "Etudiant supprime"}


# ============= AGENT APPLICATIONS =============

@router.post("/agent/applications")
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
        # Personal info from student profile
        "firstName": student.get("firstName", ""),
        "lastName": student.get("lastName", ""),
        "nationality": student.get("nationality", ""),
        "sex": student.get("sex", ""),
        "passportNumber": student.get("passportNumber", ""),
        "dateOfBirth": student.get("dateOfBirth", ""),
        "phoneNumber": student.get("phone", ""),
        "address": student.get("address", ""),
        "countryOfBirth": student.get("countryOfBirth", ""),
        "placeOfBirth": student.get("placeOfBirth", ""),
        "nativeLanguage": student.get("nativeLanguage", ""),
        "religion": student.get("religion", ""),
        "maritalStatus": student.get("maritalStatus", ""),
        "occupation": student.get("occupation", ""),
        "hobby": student.get("hobby", ""),
        "highestEducation": student.get("highestEducation", ""),
        "majorInChina": student.get("majorInChina", ""),
        "currentEmployer": student.get("currentEmployer", ""),
        "personalEmail": student.get("personalEmail", student.get("email", "")),
        "addressDetailed": student.get("addressDetailed", ""),
        "addressPhone": student.get("addressPhone", ""),
        "zipCode": student.get("zipCode", ""),
        "currentAddress": student.get("currentAddress", ""),
        "currentAddressDetailed": student.get("currentAddressDetailed", ""),
        "currentAddressPhone": student.get("currentAddressPhone", ""),
        "currentAddressZipCode": student.get("currentAddressZipCode", ""),
        "bloodGroup": student.get("bloodGroup", ""),
        "height": student.get("height", ""),
        "weight": student.get("weight", ""),
        "inChinaNow": student.get("inChinaNow", False),
        "chinaSchool": student.get("chinaSchool", ""),
        "chinaLearningPeriodStart": student.get("chinaLearningPeriodStart", ""),
        "chinaLearningPeriodEnd": student.get("chinaLearningPeriodEnd", ""),
        "chinaVisaType": student.get("chinaVisaType", ""),
        "chinaVisaNo": student.get("chinaVisaNo", ""),
        "chinaVisaExpiry": student.get("chinaVisaExpiry", ""),
        "passportIssuedDate": student.get("passportIssuedDate", ""),
        "passportExpiryDate": student.get("passportExpiryDate", ""),
        "oldPassportNo": student.get("oldPassportNo", ""),
        "oldPassportIssuedDate": student.get("oldPassportIssuedDate", ""),
        "oldPassportExpiryDate": student.get("oldPassportExpiryDate", ""),
        "educationalBackground": student.get("educationalBackground", []),
        "workExperience": student.get("workExperience", []),
        "fatherInfo": student.get("fatherInfo", {}),
        "motherInfo": student.get("motherInfo", {}),
        "spouseInfo": student.get("spouseInfo", {}),
        "financialSponsor": student.get("financialSponsor", {}),
        "emergencyContact": student.get("emergencyContact", {}),
        # Application-specific
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


@router.get("/agent/applications")
async def agent_get_applications(agent: dict = Depends(get_agent_user)):
    db = get_db()
    applications = await db.applications.find({"agentId": agent["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return applications


@router.get("/agent/applications/{app_id}")
async def agent_get_application_detail(app_id: str, agent: dict = Depends(get_agent_user)):
    db = get_db()
    app = await db.applications.find_one({"id": app_id, "agentId": agent["id"]}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Candidature non trouvee")
    return app


# ============= AGENT MESSAGES =============

@router.get("/agent/messages")
async def agent_get_messages(agent: dict = Depends(get_agent_user)):
    db = get_db()
    msgs = await db.messages.find({"senderId": agent["id"]}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return msgs


@router.post("/agent/messages")
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


# ── Contract ─────────────────────────────────────────────────────────────────
@router.get("/agent/contract")
async def get_agent_contract(agent: dict = Depends(get_agent_user)):
    return {
        "contractUrl": agent.get("contractUrl", ""),
        "contractName": agent.get("contractName", "Contrat Agent"),
        "contractUploadedAt": agent.get("contractUploadedAt", ""),
    }


# ── Verify login code ─────────────────────────────────────────────────────────
@router.post("/agent/verify-login-code")
async def verify_agent_login_code(data: dict, agent: dict = Depends(get_agent_user)):
    stored_code = agent.get("agentCode", "")
    if not stored_code or data.get("code", "").strip().upper() != stored_code.strip().upper():
        raise HTTPException(status_code=400, detail="Code d'activation incorrect. Vérifiez votre code.")
    return {"success": True}


# ── Agent profile (get / update) ──────────────────────────────────────────────
@router.get("/agent/profile")
async def get_agent_profile(agent: dict = Depends(get_agent_user)):
    return {
        "firstName": agent.get("firstName", ""),
        "lastName": agent.get("lastName", ""),
        "email": agent.get("email", ""),
        "phone": agent.get("phone", ""),
        "idDocUrl": agent.get("idDocUrl", ""),
        "idDocName": agent.get("idDocName", ""),
        "addressDocUrl": agent.get("addressDocUrl", ""),
        "addressDocName": agent.get("addressDocName", ""),
        "documentsVerified": agent.get("documentsVerified", False),
        "documentsSubmitted": bool(agent.get("idDocUrl") and agent.get("addressDocUrl")),
    }


@router.put("/agent/profile")
async def update_agent_profile(data: dict, agent: dict = Depends(get_agent_user)):
    db = get_db()
    allowed = {k: v for k, v in data.items() if k in (
        "phone", "idDocUrl", "idDocName", "addressDocUrl", "addressDocName"
    )}
    # Reset verification if docs re-uploaded
    if "idDocUrl" in allowed or "addressDocUrl" in allowed:
        allowed["documentsVerified"] = False
    await db.users.update_one({"id": agent["id"]}, {"$set": allowed})
    return {"success": True}


# ── Admin: verify agent documents ─────────────────────────────────────────────
@router.put("/admin/agents/{agent_id}/verify-documents")
async def admin_verify_agent_documents(agent_id: str, data: dict, admin: dict = Depends(get_admin_user)):
    db = get_db()
    agent = await db.users.find_one({"id": agent_id, "role": "agent"})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent non trouvé")
    verified = data.get("verified", True)
    await db.users.update_one({"id": agent_id}, {"$set": {"documentsVerified": verified}})
    return {"success": True, "documentsVerified": verified}

