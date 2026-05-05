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
    PartnerRegister, EmployerRegister,
)
from _helpers import (
    get_db, hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user, get_principal_admin, get_agent_user, get_partner_user, serialize_doc, security,
    send_notification, broadcast_to_admins,
    generate_verification_code, send_verification_email, send_password_reset_email,
    broadcast_newsletter_offer, broadcast_newsletter_blog,
    check_brute_force, record_failed_login, clear_failed_logins,
    check_rate_limit, validate_password_strength, sanitize_text,
    check_company_name_unique, normalize_email,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ============= ROOT =============

@router.get("/")
async def root():
    return {"message": "AccessHub Global API", "status": "ok"}


# ============= AUTH ROUTES =============

@router.post("/auth/register")
async def register(user_data: UserCreate):
    db = get_db()

    # Rate limiting
    check_rate_limit(f"register:{normalize_email(user_data.email)}", max_requests=3, window_seconds=300)

    # Sanitize & normalize
    email = normalize_email(user_data.email)
    first = sanitize_text(user_data.firstName, 100)
    last = sanitize_text(user_data.lastName, 100)

    # Password strength
    validate_password_strength(user_data.password)

    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est deja utilise")

    user = User(
        email=email,
        firstName=first,
        lastName=last,
        phone=sanitize_text(user_data.phone or "", 20)
    )

    user_dict = serialize_doc(user.model_dump())
    user_dict["password"] = hash_password(user_data.password)
    user_dict["emailVerified"] = False

    await db.users.insert_one(user_dict)

    # Send verification email
    code = generate_verification_code()
    await db.email_verifications.insert_one({
        "userId": user.id,
        "email": email,
        "code": code,
        "expiresAt": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
        "used": False,
    })
    await send_verification_email(email, code)

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


@router.post("/auth/verify-email")
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


@router.post("/auth/resend-verification")
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



@router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_db()
    email = normalize_email(credentials.email)

    # Rate limiting: max 10 login attempts per minute per email
    check_rate_limit(f"login:{email}", max_requests=10, window_seconds=60)

    # Brute force: block after 5 failed attempts
    check_brute_force(email)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(credentials.password, user.get("password", "")):
        record_failed_login(email)
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    if not user.get("isActive", True):
        raise HTTPException(status_code=401, detail="Compte désactivé")

    # Block partner/agent/employer login if email not verified
    if user.get("role") in ("partenaire", "agent", "employeur", "partenaire_logement") and not user.get("emailVerified", False):
        raise HTTPException(
            status_code=403,
            detail="Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception."
        )

    # Successful login — clear failed attempts and stamp lastActiveAt for inactivity tracking
    clear_failed_logins(email)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"lastActiveAt": datetime.now(timezone.utc).isoformat()}}
    )

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


@router.get("/auth/me", response_model=UserResponse)
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

@router.post("/auth/password-reset-request")
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


@router.get("/auth/password-reset-verify/{token}")
async def verify_reset_token(token: str):
    db = get_db()
    reset = await db.password_resets.find_one({"token": token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Code invalide ou expire")

    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Code expire")

    return {"valid": True, "email": reset["email"]}


@router.post("/auth/password-reset")
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


# ============= AGENT AUTH =============

@router.post("/auth/register-agent", response_model=TokenResponse)
async def register_agent(agent_data: AgentRegister):
    db = get_db()

    # Rate limit + sanitize + validate
    email = normalize_email(agent_data.email)
    check_rate_limit(f"register:{email}", max_requests=3, window_seconds=300)
    validate_password_strength(agent_data.password)

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est deja utilise")

    company = sanitize_text(agent_data.company or "", 200)
    if company:
        await check_company_name_unique(company)

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
        "email": email,
        "firstName": sanitize_text(agent_data.firstName, 100),
        "lastName": sanitize_text(agent_data.lastName, 100),
        "phone": sanitize_text(agent_data.phone or "", 20),
        "company": company,
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

# ============= PARTNER AUTH =============

@router.post("/auth/register-partner", response_model=TokenResponse)
async def register_partner(partner_data: PartnerRegister):
    db = get_db()
    email = normalize_email(partner_data.email)
    check_rate_limit(f"register:{email}", max_requests=3, window_seconds=300)
    validate_password_strength(partner_data.password)

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    company = sanitize_text(partner_data.company or "", 200)
    if company:
        await check_company_name_unique(company)

    code_doc = await db.partner_codes.find_one({"code": partner_data.activationCode, "isUsed": False})
    if not code_doc:
        raise HTTPException(status_code=400, detail="Code d'activation invalide ou déjà utilisé")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    user_doc = {
        "id": user_id,
        "email": email,
        "firstName": sanitize_text(partner_data.firstName, 100),
        "lastName": sanitize_text(partner_data.lastName, 100),
        "phone": sanitize_text(partner_data.phone or "", 20),
        "company": company,
        "website": sanitize_text(partner_data.website or "", 200),
        "role": "partenaire",
        "isActive": True,
        "isApproved": False,
        "emailVerified": False,
        "favorites": [],
        "partnerCode": partner_data.activationCode,
        "createdAt": now.isoformat(),
    }
    user_doc["password"] = hash_password(partner_data.password)
    await db.users.insert_one(user_doc)

    await db.partner_codes.update_one(
        {"code": partner_data.activationCode},
        {"$set": {"isUsed": True, "usedBy": user_id, "usedAt": now.isoformat()}}
    )

    v_code = generate_verification_code()
    await db.email_verifications.insert_one({
        "email": email,
        "code": v_code,
        "createdAt": now.isoformat(),
    })
    await send_verification_email(email, v_code)

    token = create_access_token({"sub": user_id})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id, email=email,
            firstName=user_doc["firstName"], lastName=user_doc["lastName"],
            phone=user_doc["phone"], role="partenaire", isActive=True, favorites=[],
            isApproved=False, company=company, emailVerified=False,
        )
    )


# ============= ADMIN - PARTNER CODES =============


# ============= EMPLOYER AUTH =============

@router.post("/auth/register-employer", response_model=TokenResponse)
async def register_employer(employer_data: EmployerRegister):
    db = get_db()
    email = normalize_email(employer_data.email)
    check_rate_limit(f"register:{email}", max_requests=3, window_seconds=300)
    validate_password_strength(employer_data.password)

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    company = sanitize_text(employer_data.company or "", 200)
    if company:
        await check_company_name_unique(company)

    code_doc = await db.employer_codes.find_one({"code": employer_data.activationCode, "isUsed": False})
    if not code_doc:
        raise HTTPException(status_code=400, detail="Code d'activation invalide ou déjà utilisé")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    user_doc = {
        "id": user_id,
        "email": email,
        "firstName": sanitize_text(employer_data.firstName, 100),
        "lastName": sanitize_text(employer_data.lastName, 100),
        "phone": sanitize_text(employer_data.phone or "", 20),
        "company": company,
        "role": "employeur",
        "isActive": True,
        "isApproved": False,
        "emailVerified": False,
        "favorites": [],
        "employerCode": employer_data.activationCode,
        "createdAt": now.isoformat(),
    }
    user_doc["password"] = hash_password(employer_data.password)
    await db.users.insert_one(user_doc)

    await db.employer_codes.update_one(
        {"code": employer_data.activationCode},
        {"$set": {"isUsed": True, "usedBy": user_id, "usedAt": now.isoformat()}}
    )

    v_code = generate_verification_code()
    await db.email_verifications.insert_one({
        "email": email,
        "code": v_code,
        "createdAt": now.isoformat(),
    })
    await send_verification_email(email, v_code)

    token = create_access_token({"sub": user_id})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id, email=email,
            firstName=user_doc["firstName"], lastName=user_doc["lastName"],
            phone=user_doc["phone"], role="employeur", isActive=True, favorites=[],
            isApproved=False, company=company, emailVerified=False,
        )
    )
