from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import base64
import json
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Security
SECRET_KEY = os.environ.get('JWT_SECRET', 'winners-consulting-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ============= MODELS =============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    firstName: str
    lastName: str
    phone: Optional[str] = None
    role: str = "user"  # user, admin
    isActive: bool = True
    favorites: List[str] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    role: str
    isActive: bool
    favorites: List[str] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Offer model
class OfferCreate(BaseModel):
    title: str
    titleEn: Optional[str] = None
    university: str
    city: str = ""
    country: str = "Chine"
    countryCode: str = "CN"
    category: str = "engineering"
    categoryLabel: str = "Ingénierie"
    degree: str = "Master"
    duration: str = "2 ans"
    teachingLanguage: str = "Anglais"
    intake: str = "Automne 2025"
    deadline: str = "Ouvert"
    image: Optional[str] = None
    originalTuition: float = 0
    scholarshipTuition: float = 0
    currency: str = "CNY"
    scholarshipType: str = ""
    hasScholarship: bool = False
    isPartialScholarship: bool = False
    isSelfFinanced: bool = True
    isOnline: bool = False
    isNew: bool = True
    badges: List[str] = []
    description: str = ""
    requirements: dict = {}
    scholarshipDetails: dict = {}
    fees: dict = {}
    documents: List[str] = []
    serviceFee: float = 0

class Offer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    titleEn: Optional[str] = None
    university: str
    city: str = ""
    country: str = "Chine"
    countryCode: str = "CN"
    category: str = "engineering"
    categoryLabel: str = "Ingénierie"
    degree: str = "Master"
    duration: str = "2 ans"
    teachingLanguage: str = "Anglais"
    intake: str = "Automne 2025"
    deadline: str = "Ouvert"
    image: Optional[str] = None
    originalTuition: float = 0
    scholarshipTuition: float = 0
    currency: str = "CNY"
    scholarshipType: str = "Bourse Complète"
    hasScholarship: bool = False
    isPartialScholarship: bool = False
    isSelfFinanced: bool = False
    isOnline: bool = False
    isNew: bool = True
    badges: List[str] = []
    description: str = ""
    requirements: dict = {}
    scholarshipDetails: dict = {}
    fees: dict = {}
    documents: List[str] = []
    serviceFee: float = 0
    views: int = 0
    rating: float = 4.5
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# University model
class UniversityCreate(BaseModel):
    name: str
    city: str
    country: str
    countryCode: str
    image: Optional[str] = None
    ranking: Optional[str] = None
    badges: List[str] = []

class University(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    city: str
    country: str
    countryCode: str
    image: Optional[str] = None
    ranking: Optional[str] = None
    badges: List[str] = []
    views: int = 0
    rating: float = 4.5
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Housing model
class HousingCreate(BaseModel):
    type: str
    location: str
    city: str
    country: str
    priceRange: str
    image: Optional[str] = None
    features: List[str] = []

class Housing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    location: str
    city: str
    country: str
    priceRange: str
    image: Optional[str] = None
    features: List[str] = []
    isAvailable: bool = True
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Message model
class MessageCreate(BaseModel):
    subject: str
    content: str
    offerId: Optional[str] = None
    attachments: Optional[List[str]] = []

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    senderId: str
    senderName: str
    senderEmail: str
    subject: str
    content: str
    offerId: Optional[str] = None
    attachments: List[str] = []
    isRead: bool = False
    replies: List[dict] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageReply(BaseModel):
    content: str
    attachments: Optional[List[str]] = []

# Application model
class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    userName: str
    userEmail: str
    offerId: str
    offerTitle: str
    # Personal info
    firstName: str = ""
    lastName: str = ""
    nationality: str = ""
    sex: str = ""
    passportNumber: str = ""
    dateOfBirth: str = ""
    phoneNumber: str = ""
    address: str = ""
    # Additional programs
    additionalPrograms: List[str] = []
    # Documents
    documents: List[dict] = []  # [{name: str, url: str}]
    # Terms
    termsAccepted: bool = False
    # Payment
    paymentMethod: str = ""  # wechat_alipay, paypal, bank_transfer, cash
    paymentProof: str = ""  # URL to uploaded proof
    paymentStatus: str = "pending"  # pending, submitted, verified, rejected
    paymentAmount: float = 0
    # Status
    status: str = "pending"  # pending, reviewing, accepted, rejected
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ApplicationCreate(BaseModel):
    offerId: str
    offerTitle: str
    firstName: str
    lastName: str
    nationality: str
    sex: str
    passportNumber: str
    dateOfBirth: str
    phoneNumber: str
    address: str
    additionalPrograms: List[str] = []
    documents: List[dict] = []
    termsAccepted: bool
    paymentMethod: str
    paymentProof: str
    paymentAmount: float

# Payment Settings model
class PaymentSettings(BaseModel):
    id: str = "payment_settings"
    wechatQrCode: str = "https://customer-assets.emergentagent.com/job_chinese-education/artifacts/rnrsxqg6_445.PNG"
    alipayQrCode: str = "https://customer-assets.emergentagent.com/job_chinese-education/artifacts/liko6316_2355.jpg"
    paypalEmail: str = "payments@winners-consulting.com"
    bankName: str = "Bank of China"
    bankAccountName: str = "Winner's Consulting Ltd"
    bankAccountNumber: str = "6222 0000 1234 5678 9012"
    bankSwiftCode: str = "BKCHCNBJ"
    bankIban: str = ""
    applicationFee: float = 50
    currency: str = "EUR"
    termsConditions: List[dict] = [
        {"title": "Engagement du candidat", "content": "En soumettant cette candidature, je certifie que toutes les informations fournies sont exactes et complètes. Je comprends que toute fausse déclaration peut entraîner le rejet de ma candidature ou l'annulation de mon inscription."},
        {"title": "Frais de dossier", "content": "Les frais de dossier ne sont pas remboursables, quelle que soit l'issue de la candidature."},
        {"title": "Traitement des données", "content": "J'accepte que mes données personnelles soient traitées par Winner's Consulting dans le cadre de ma candidature et partagées avec l'université concernée."},
        {"title": "Délais de traitement", "content": "Je comprends que le traitement de ma candidature peut prendre plusieurs semaines et que Winner's Consulting me tiendra informé de l'avancement par email."},
        {"title": "Responsabilité", "content": "Winner's Consulting agit en tant qu'intermédiaire et ne garantit pas l'acceptation de ma candidature par l'université."}
    ]

# Site settings
class SiteSettings(BaseModel):
    bannerImages: List[dict] = []
    heroTitle: Optional[str] = None
    heroSubtitle: Optional[str] = None

# ============= HELPER FUNCTIONS =============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return current_user

def serialize_doc(doc: dict) -> dict:
    """Serialize document for MongoDB"""
    if doc.get('createdAt') and isinstance(doc['createdAt'], datetime):
        doc['createdAt'] = doc['createdAt'].isoformat()
    return doc

def deserialize_doc(doc: dict) -> dict:
    """Deserialize document from MongoDB"""
    if doc.get('createdAt') and isinstance(doc['createdAt'], str):
        doc['createdAt'] = datetime.fromisoformat(doc['createdAt'])
    return doc

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Create user
    user = User(
        email=user_data.email,
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        phone=user_data.phone
    )
    
    # Store with hashed password
    user_dict = serialize_doc(user.model_dump())
    user_dict["password"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    # Create token
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

# ============= USER ROUTES =============

@api_router.post("/user/favorites/{offer_id}")
async def add_to_favorites(offer_id: str, current_user: dict = Depends(get_current_user)):
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
    favorites = current_user.get("favorites", [])
    if not favorites:
        return []
    
    # Get offers from database
    offers = await db.offers.find({"id": {"$in": favorites}}, {"_id": 0}).to_list(100)
    
    # Clean up invalid favorites (IDs that don't exist in DB)
    valid_ids = [o["id"] for o in offers]
    invalid_ids = [f for f in favorites if f not in valid_ids]
    
    if invalid_ids:
        # Remove invalid IDs from user's favorites
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
    
    # Compute real-time ratings based on favorites
    offer_ids = [o["id"] for o in offers]
    if offer_ids:
        # Count favorites for each offer across all users
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
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    
    # Increment views
    await db.offers.update_one({"id": offer_id}, {"$inc": {"views": 1}})
    
    return offer

# ============= MESSAGES ROUTES =============

class MessageReplyUser(BaseModel):
    content: str
    attachments: Optional[List[str]] = []

@api_router.post("/messages")
async def create_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
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
    messages = await db.messages.find(
        {"senderId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return messages

# User reply to their own message thread
@api_router.post("/messages/{message_id}/reply")
async def user_reply_message(message_id: str, reply: MessageReplyUser, current_user: dict = Depends(get_current_user)):
    message = await db.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    # Check if user owns this message
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
    
    # Notify admins of new reply
    await manager.broadcast_to_admins({
        "type": "message_reply",
        "title": "Nouvelle réponse",
        "message": f"{current_user['firstName']} a répondu à un message",
        "data": {"messageId": message_id}
    })
    
    return {"message": "Réponse envoyée"}

# ============= FILE UPLOAD =============

@api_router.get("/upload/signature")
async def get_upload_signature(current_user: dict = Depends(get_current_user)):
    """Generate a signed upload signature for direct browser-to-Cloudinary upload"""
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
        # Use Cloudinary
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
            raise HTTPException(status_code=500, detail=f"Erreur Cloudinary: {str(e)}")
    else:
        # Fallback: local storage
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

# Serve uploaded files
from fastapi.responses import FileResponse

@api_router.get("/files/{filename}")
async def get_file(filename: str):
    file_path = f"/app/uploads/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    return FileResponse(file_path)

# ============= APPLICATIONS ROUTES =============

@api_router.post("/applications")
async def create_application(app_data: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    # Check if already applied
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
    applications = await db.applications.find(
        {"userId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return applications

# ============= UNIVERSITIES ROUTES =============

@api_router.get("/universities")
async def get_universities(country: Optional[str] = None):
    query = {"isActive": True}
    if country:
        query["countryCode"] = country
    
    universities = await db.universities.find(query, {"_id": 0}).to_list(100)
    return universities

@api_router.get("/universities/{uni_id}")
async def get_university(uni_id: str):
    uni = await db.universities.find_one({"id": uni_id}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    
    await db.universities.update_one({"id": uni_id}, {"$inc": {"views": 1}})
    return uni

# ============= HOUSING ROUTES =============

@api_router.get("/housing")
async def get_housing():
    housing = await db.housing.find({"isActive": True}, {"_id": 0}).to_list(100)
    return housing

# ============= ADMIN ROUTES =============

# Admin - Users
@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/toggle-status")
async def admin_toggle_user_status(user_id: str, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    new_status = not user.get("isActive", True)
    await db.users.update_one({"id": user_id}, {"$set": {"isActive": new_status}})
    return {"message": "Statut modifié", "isActive": new_status}

@api_router.put("/admin/users/{user_id}/make-admin")
async def admin_make_admin(user_id: str, admin: dict = Depends(get_admin_user)):
    await db.users.update_one({"id": user_id}, {"$set": {"role": "admin"}})
    return {"message": "Utilisateur promu administrateur"}

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé"}

# Admin - Offers
@api_router.get("/admin/offers")
async def admin_get_offers(admin: dict = Depends(get_admin_user)):
    offers = await db.offers.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return offers

@api_router.post("/admin/offers")
async def admin_create_offer(offer_data: OfferCreate, admin: dict = Depends(get_admin_user)):
    offer = Offer(**offer_data.model_dump())
    await db.offers.insert_one(serialize_doc(offer.model_dump()))
    return {"message": "Offre créée avec succès", "id": offer.id}

@api_router.put("/admin/offers/{offer_id}")
async def admin_update_offer(offer_id: str, offer_data: OfferCreate, admin: dict = Depends(get_admin_user)):
    update_data = offer_data.model_dump()
    await db.offers.update_one({"id": offer_id}, {"$set": update_data})
    return {"message": "Offre mise à jour"}

@api_router.delete("/admin/offers/{offer_id}")
async def admin_delete_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return {"message": "Offre supprimée"}

# Admin - Universities
@api_router.get("/admin/universities")
async def admin_get_universities(admin: dict = Depends(get_admin_user)):
    universities = await db.universities.find({}, {"_id": 0}).to_list(1000)
    return universities

@api_router.post("/admin/universities")
async def admin_create_university(uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    university = University(**uni_data.model_dump())
    await db.universities.insert_one(serialize_doc(university.model_dump()))
    return {"message": "Université créée avec succès", "id": university.id}

@api_router.put("/admin/universities/{uni_id}")
async def admin_update_university(uni_id: str, uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    await db.universities.update_one({"id": uni_id}, {"$set": uni_data.model_dump()})
    return {"message": "Université mise à jour"}

@api_router.delete("/admin/universities/{uni_id}")
async def admin_delete_university(uni_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.universities.delete_one({"id": uni_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    return {"message": "Université supprimée"}

# Admin - Housing
@api_router.get("/admin/housing")
async def admin_get_housing(admin: dict = Depends(get_admin_user)):
    housing = await db.housing.find({}, {"_id": 0}).to_list(1000)
    return housing

@api_router.post("/admin/housing")
async def admin_create_housing(housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    housing = Housing(**housing_data.model_dump())
    await db.housing.insert_one(serialize_doc(housing.model_dump()))
    return {"message": "Logement créé avec succès", "id": housing.id}

@api_router.put("/admin/housing/{housing_id}")
async def admin_update_housing(housing_id: str, housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    await db.housing.update_one({"id": housing_id}, {"$set": housing_data.model_dump()})
    return {"message": "Logement mis à jour"}

@api_router.delete("/admin/housing/{housing_id}")
async def admin_delete_housing(housing_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.housing.delete_one({"id": housing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Logement non trouvé")
    return {"message": "Logement supprimé"}

# Admin - Messages
@api_router.get("/admin/messages")
async def admin_get_messages(admin: dict = Depends(get_admin_user)):
    messages = await db.messages.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return messages

@api_router.put("/admin/messages/{message_id}/read")
async def admin_mark_message_read(message_id: str, admin: dict = Depends(get_admin_user)):
    await db.messages.update_one({"id": message_id}, {"$set": {"isRead": True}})
    return {"message": "Marqué comme lu"}

@api_router.post("/admin/messages/{message_id}/reply")
async def admin_reply_message(message_id: str, reply: MessageReply, admin: dict = Depends(get_admin_user)):
    # Get the message to find the sender
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
    
    # Send notification to the user
    await send_notification(
        user_id=message["senderId"],
        notification_type="message_reply",
        title="Nouvelle réponse",
        message=f"L'équipe a répondu à votre message: {message.get('subject', 'Sans sujet')}",
        data={"messageId": message_id}
    )
    
    return {"message": "Réponse envoyée"}

# Admin - Applications
@api_router.get("/admin/applications")
async def admin_get_applications(admin: dict = Depends(get_admin_user)):
    applications = await db.applications.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return applications

@api_router.put("/admin/applications/{app_id}/status")
async def admin_update_application_status(app_id: str, status: str, admin: dict = Depends(get_admin_user)):
    if status not in ["pending", "reviewing", "accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    # Get application to find user
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    await db.applications.update_one({"id": app_id}, {"$set": {"status": status}})
    
    # Send notification to the user
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

# Admin - Stats
@api_router.get("/admin/stats")
async def admin_get_stats(admin: dict = Depends(get_admin_user)):
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

# Create first admin user if not exists
@api_router.post("/admin/setup")
async def setup_admin():
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

# ============= WEBSOCKET FOR NOTIFICATIONS =============

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected for user: {user_id}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected for user: {user_id}")
    
    async def send_personal_notification(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                return True
            except Exception as e:
                logger.error(f"Error sending notification to {user_id}: {e}")
                self.disconnect(user_id)
        return False
    
    async def broadcast_to_admins(self, message: dict):
        # Get all admin users
        admin_users = await db.users.find({"role": "admin"}).to_list(100)
        for admin in admin_users:
            admin_id = admin.get("id")
            if admin_id in self.active_connections:
                try:
                    await self.active_connections[admin_id].send_json(message)
                except Exception:
                    self.disconnect(admin_id)

manager = ConnectionManager()

@app.websocket("/ws/notifications/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        # Verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
        
        await manager.connect(websocket, user_id)
        
        # Send initial connection success
        await websocket.send_json({
            "type": "connected",
            "message": "Notifications connectées"
        })
        
        try:
            while True:
                # Keep connection alive, handle ping/pong
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
        except WebSocketDisconnect:
            manager.disconnect(user_id)
    except jwt.ExpiredSignatureError:
        await websocket.close(code=4002)
    except jwt.JWTError:
        await websocket.close(code=4003)

# Helper function to send notifications
async def send_notification(user_id: str, notification_type: str, title: str, message: str, data: dict = None):
    notification = {
        "id": str(uuid.uuid4()),
        "type": notification_type,
        "title": title,
        "message": message,
        "data": data or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    
    # Store notification in database
    await db.notifications.insert_one({
        **notification,
        "userId": user_id
    })
    
    # Send via WebSocket if user is connected
    await manager.send_personal_notification(user_id, notification)
    
    return notification

# Get user notifications
@api_router.get("/notifications")
async def get_notifications(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    notifications = await db.notifications.find(
        {"userId": user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return notifications

# Mark notification as read
@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    await db.notifications.update_one(
        {"id": notification_id, "userId": user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marquée comme lue"}

# Mark all notifications as read
@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    await db.notifications.update_many(
        {"userId": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "Toutes les notifications marquées comme lues"}

# Get unread count
@api_router.get("/notifications/unread-count")
async def get_unread_count(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    count = await db.notifications.count_documents({"userId": user["id"], "read": False})
    return {"count": count}

# ============= LIVE CHAT SYSTEM =============

class ChatManager:
    def __init__(self):
        self.chat_connections: Dict[str, Dict[str, WebSocket]] = {}  # {chat_id: {user_id: ws}}
        self.user_chats: Dict[str, str] = {}  # {user_id: chat_id}
    
    async def connect(self, websocket: WebSocket, user_id: str, chat_id: str):
        await websocket.accept()
        if chat_id not in self.chat_connections:
            self.chat_connections[chat_id] = {}
        self.chat_connections[chat_id][user_id] = websocket
        self.user_chats[user_id] = chat_id
    
    def disconnect(self, user_id: str):
        chat_id = self.user_chats.get(user_id)
        if chat_id and chat_id in self.chat_connections:
            if user_id in self.chat_connections[chat_id]:
                del self.chat_connections[chat_id][user_id]
        if user_id in self.user_chats:
            del self.user_chats[user_id]
    
    async def send_to_chat(self, chat_id: str, message: dict, exclude_user: str = None):
        if chat_id in self.chat_connections:
            for uid, ws in self.chat_connections[chat_id].items():
                if uid != exclude_user:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass

chat_manager = ChatManager()

class ChatMessage(BaseModel):
    content: str

# Create or get existing chat
@api_router.post("/chat/start")
async def start_chat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    
    # Check for existing active chat
    existing = await db.chats.find_one({"userId": user["id"], "status": "active"}, {"_id": 0})
    if existing:
        return existing
    
    # Create new chat
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
    
    # Notify admins
    await manager.broadcast_to_admins({
        "type": "new_chat",
        "title": "Nouveau chat",
        "message": f"{user['firstName']} a démarré une conversation",
        "data": {"chatId": chat["id"]}
    })
    
    return {k: v for k, v in chat.items() if k != "_id"}

# Get user's chat
@api_router.get("/chat/me")
async def get_my_chat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    chat = await db.chats.find_one({"userId": user["id"], "status": "active"}, {"_id": 0})
    return chat

# Send message in chat
@api_router.post("/chat/{chat_id}/message")
async def send_chat_message(chat_id: str, message: ChatMessage, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    
    chat = await db.chats.find_one({"id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")
    
    # Check permission
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
    
    # Send via WebSocket
    await chat_manager.send_to_chat(chat_id, {"type": "message", "message": msg})
    
    # Send notification if admin replied
    if user["role"] == "admin":
        await send_notification(
            user_id=chat["userId"],
            notification_type="chat_reply",
            title="Nouveau message",
            message="Un conseiller a répondu à votre message",
            data={"chatId": chat_id}
        )
    
    return msg

# Get chat messages
@api_router.get("/chat/{chat_id}/messages")
async def get_chat_messages(chat_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    
    chat = await db.chats.find_one({"id": chat_id}, {"_id": 0})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")
    
    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return chat.get("messages", [])

# Close chat
@api_router.put("/chat/{chat_id}/close")
async def close_chat(chat_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    
    chat = await db.chats.find_one({"id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")
    
    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    await db.chats.update_one({"id": chat_id}, {"$set": {"status": "closed"}})
    return {"message": "Chat fermé"}

# Admin: Get all active chats
@api_router.get("/admin/chats")
async def admin_get_chats(admin: dict = Depends(get_admin_user)):
    chats = await db.chats.find({"status": "active"}, {"_id": 0}).sort("lastMessageAt", -1).to_list(50)
    return chats

# Admin: Get all chats (including closed)
@api_router.get("/admin/chats/all")
async def admin_get_all_chats(admin: dict = Depends(get_admin_user)):
    chats = await db.chats.find({}, {"_id": 0}).sort("lastMessageAt", -1).to_list(100)
    return chats

# WebSocket for live chat
@app.websocket("/ws/chat/{chat_id}/{token}")
async def chat_websocket(websocket: WebSocket, chat_id: str, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
        
        await chat_manager.connect(websocket, user_id, chat_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
        except WebSocketDisconnect:
            chat_manager.disconnect(user_id)
    except jwt.JWTError:
        await websocket.close(code=4003)

# ============= PASSWORD RESET =============

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    newPassword: str

# Request password reset
@api_router.post("/auth/password-reset-request")
async def request_password_reset(request: PasswordResetRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists
        return {"message": "Si cet email existe, un lien de réinitialisation sera envoyé"}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "token": reset_token,
        "userId": user["id"],
        "email": request.email,
        "expiresAt": expires.isoformat(),
        "used": False
    })
    
    # In production, send email here
    # For now, store and return token (dev mode)
    logger.info(f"Password reset token for {request.email}: {reset_token}")
    
    return {
        "message": "Si cet email existe, un lien de réinitialisation sera envoyé",
        "dev_token": reset_token  # Remove in production
    }

# Verify reset token
@api_router.get("/auth/password-reset-verify/{token}")
async def verify_reset_token(token: str):
    reset = await db.password_resets.find_one({"token": token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    
    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expiré")
    
    return {"valid": True, "email": reset["email"]}

# Reset password
@api_router.post("/auth/password-reset")
async def reset_password(request: PasswordResetConfirm):
    reset = await db.password_resets.find_one({"token": request.token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    
    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expiré")
    
    # Update password
    hashed = hash_password(request.newPassword)
    await db.users.update_one({"id": reset["userId"]}, {"$set": {"password": hashed}})
    
    # Mark token as used
    await db.password_resets.update_one({"token": request.token}, {"$set": {"used": True}})
    
    return {"message": "Mot de passe mis à jour avec succès"}

# ============= PAYMENT SETTINGS ROUTES =============
# ============= PAYMENT SETTINGS ROUTES =============

@api_router.get("/admin/payment-settings")
async def get_payment_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        default = PaymentSettings()
        return default.model_dump()
    return settings

@api_router.post("/admin/payment-settings")
async def update_payment_settings(settings: PaymentSettings, admin: dict = Depends(get_admin_user)):
    settings_dict = settings.model_dump()
    await db.payment_settings.update_one(
        {"id": "payment_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return {"message": "Paramètres de paiement mis à jour"}

# Public endpoint to get payment settings (for users during application)
@api_router.get("/payment-settings")
async def get_public_payment_settings():
    settings = await db.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default = PaymentSettings()
        return default.model_dump()
    return settings

# ============= ENHANCED APPLICATION ROUTES =============

class FullApplicationCreate(BaseModel):
    offerId: str
    offerTitle: str
    firstName: str
    lastName: str
    nationality: str
    sex: str
    passportNumber: str
    dateOfBirth: str
    phoneNumber: str
    address: str
    additionalPrograms: List[str] = []
    documents: List[dict] = []
    termsAccepted: bool
    paymentMethod: str
    paymentProof: str
    paymentAmount: float

@api_router.post("/applications/full")
async def create_full_application(app_data: FullApplicationCreate, current_user: dict = Depends(get_current_user)):
    # Check if already applied
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
    
    # Notify admins
    await manager.broadcast_to_admins({
        "type": "new_application",
        "title": "Nouvelle candidature",
        "message": f"{app_data.firstName} {app_data.lastName} a postulé à {app_data.offerTitle}",
        "data": {"applicationId": application.id}
    })
    
    return {"message": "Candidature soumise avec succès", "id": application.id}

# Admin update payment status
@api_router.put("/admin/applications/{app_id}/payment-status")
async def admin_update_payment_status(app_id: str, payment_status: str, admin: dict = Depends(get_admin_user)):
    if payment_status not in ["pending", "submitted", "verified", "rejected"]:
        raise HTTPException(status_code=400, detail="Statut de paiement invalide")
    
    application = await db.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    await db.applications.update_one({"id": app_id}, {"$set": {"paymentStatus": payment_status}})
    
    # Send notification to user
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

# Get single application details
@api_router.get("/applications/{app_id}")
async def get_application_details(app_id: str, current_user: dict = Depends(get_current_user)):
    application = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    # Check ownership or admin
    if application["userId"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return application

# Check if offer deadline has passed
@api_router.get("/offers/{offer_id}/deadline-status")
async def check_deadline_status(offer_id: str):
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    
    deadline_str = offer.get("deadline", "")
    
    # Parse French date format
    month_map = {
        "janvier": 1, "février": 2, "mars": 3, "avril": 4,
        "mai": 5, "juin": 6, "juillet": 7, "août": 8,
        "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12
    }
    
    is_open = True
    try:
        lower = deadline_str.lower().strip()
        # Always open for continuous enrollment
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

# ============= RATINGS COMPUTATION =============

@api_router.get("/offers/{offer_id}/rating")
async def get_offer_rating(offer_id: str):
    """Compute offer rating based on favorites count across all users."""
    offer = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    favorites_count = await db.users.count_documents({"favorites": offer_id})
    views = offer.get("views", 0)
    # Rating formula: base 4.0 + bonus from favorites (max +0.5) + bonus from views (max +0.5)
    fav_bonus = min(favorites_count * 0.1, 0.5)
    view_bonus = min(views / 50000, 0.5)
    computed_rating = round(min(4.0 + fav_bonus + view_bonus, 5.0), 1)
    # Update stored rating
    await db.offers.update_one({"id": offer_id}, {"$set": {"rating": computed_rating}})
    return {"offerId": offer_id, "rating": computed_rating, "favorites": favorites_count, "views": views}

@api_router.get("/universities/{uni_id}/rating")
async def get_university_rating(uni_id: str):
    """Compute university rating based on views."""
    uni = await db.universities.find_one({"id": uni_id}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    views = uni.get("views", 0)
    view_bonus = min(views / 10000, 1.0)
    computed_rating = round(min(4.0 + view_bonus, 5.0), 1)
    await db.universities.update_one({"id": uni_id}, {"$set": {"rating": computed_rating}})
    return {"universityId": uni_id, "rating": computed_rating, "views": views}

# ============= NEWSLETTER =============

class NewsletterSubscribe(BaseModel):
    email: EmailStr

@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(data: NewsletterSubscribe):
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
    subscribers = await db.newsletter.find({}, {"_id": 0}).sort("subscribedAt", -1).to_list(5000)
    return subscribers

@api_router.delete("/admin/newsletter/{email}")
async def admin_delete_newsletter(email: str, admin: dict = Depends(get_admin_user)):
    result = await db.newsletter.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Abonné non trouvé")
    return {"message": "Abonné supprimé"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
