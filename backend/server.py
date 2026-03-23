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

# ============= SEED DATA =============

@api_router.post("/admin/seed-data")
async def seed_data(admin: dict = Depends(get_admin_user)):
    """Seed initial data for offers and universities"""
    
    # Sample universities
    universities = [
        {
            "id": str(uuid.uuid4()),
            "name": "Tsinghua University",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "image": "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600",
            "ranking": "Top 20 Mondial",
            "badges": ["Excellence", "Top 20"],
            "views": 15420,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Peking University",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600",
            "ranking": "Top 25 Mondial",
            "badges": ["Excellence"],
            "views": 12350,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Zhejiang University",
            "city": "Hangzhou",
            "country": "Chine",
            "countryCode": "CN",
            "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600",
            "ranking": "Top 50 Mondial",
            "badges": ["Innovation"],
            "views": 8900,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sorbonne Université",
            "city": "Paris",
            "country": "France",
            "countryCode": "FR",
            "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
            "ranking": "Top 50 Mondial",
            "badges": ["Excellence", "Historique"],
            "views": 11200,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sciences Po Paris",
            "city": "Paris",
            "country": "France",
            "countryCode": "FR",
            "image": "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=600",
            "ranking": "Top 100 Sciences Politiques",
            "badges": ["Prestige"],
            "views": 9800,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Sample offers
    offers = [
        {
            "id": str(uuid.uuid4()),
            "title": "Master en Intelligence Artificielle",
            "university": "Tsinghua University",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "category": "engineering",
            "categoryLabel": "Ingénierie",
            "degree": "Master",
            "duration": "2 ans",
            "teachingLanguage": "Anglais",
            "intake": "Septembre 2025",
            "deadline": "31 Mars 2025",
            "image": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600",
            "originalTuition": 35000,
            "scholarshipTuition": 0,
            "currency": "CNY",
            "scholarshipType": "Chinese Government Scholarship (CSC)",
            "hasScholarship": True,
            "isPartialScholarship": False,
            "isSelfFinanced": False,
            "isOnline": False,
            "isNew": True,
            "badges": ["Bourse Complète", "Top 20", "Nouveau"],
            "description": "Programme d'excellence en IA couvrant le machine learning, deep learning, et les systèmes intelligents.",
            "requirements": {
                "age": "18-35 ans",
                "previousDegree": "Licence en Informatique ou équivalent",
                "gpa": "3.0/4.0 minimum",
                "language": "IELTS 6.5 ou TOEFL 90",
                "otherRequirements": ["Lettre de motivation", "2 lettres de recommandation"]
            },
            "scholarshipDetails": {
                "tuitionCovered": True,
                "accommodationCovered": True,
                "monthlyAllowance": 3500,
                "insuranceCovered": True
            },
            "fees": {
                "originalTuition": 35000,
                "scholarshipTuition": 0,
                "accommodationDouble": 0,
                "accommodationSingle": 0,
                "registrationFee": 400,
                "insuranceFee": 0,
                "applicationFee": 50
            },
            "documents": ["Passeport", "Diplômes", "Relevés de notes", "CV", "Lettre de motivation", "Certificat médical"],
            "views": 2450,
            "rating": 4.8,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "MBA International Business",
            "university": "Peking University",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "category": "management",
            "categoryLabel": "Gestion",
            "degree": "MBA",
            "duration": "2 ans",
            "teachingLanguage": "Anglais",
            "intake": "Septembre 2025",
            "deadline": "15 Avril 2025",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
            "originalTuition": 180000,
            "scholarshipTuition": 90000,
            "currency": "CNY",
            "scholarshipType": "Bourse Partielle Université",
            "hasScholarship": True,
            "isPartialScholarship": True,
            "isSelfFinanced": False,
            "isOnline": False,
            "isNew": False,
            "badges": ["Bourse Partielle", "Top 25", "Populaire"],
            "description": "Programme MBA axé sur le business international et les marchés émergents asiatiques.",
            "requirements": {
                "age": "23-40 ans",
                "previousDegree": "Licence + 3 ans d'expérience professionnelle",
                "gpa": "3.2/4.0 minimum",
                "language": "IELTS 7.0 ou TOEFL 100",
                "otherRequirements": ["GMAT 650+", "Entretien requis"]
            },
            "scholarshipDetails": {
                "tuitionCovered": False,
                "accommodationCovered": False,
                "monthlyAllowance": 0,
                "insuranceCovered": False
            },
            "fees": {
                "originalTuition": 180000,
                "scholarshipTuition": 90000,
                "accommodationDouble": 12000,
                "accommodationSingle": 18000,
                "registrationFee": 800,
                "insuranceFee": 800,
                "applicationFee": 100
            },
            "documents": ["Passeport", "Diplômes", "CV", "Lettres de recommandation", "Score GMAT"],
            "views": 3200,
            "rating": 4.6,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Licence en Médecine (MBBS)",
            "university": "Zhejiang University",
            "city": "Hangzhou",
            "country": "Chine",
            "countryCode": "CN",
            "category": "medicine",
            "categoryLabel": "Médecine",
            "degree": "Licence",
            "duration": "6 ans",
            "teachingLanguage": "Anglais",
            "intake": "Septembre 2025",
            "deadline": "30 Juin 2025",
            "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600",
            "originalTuition": 45000,
            "scholarshipTuition": 45000,
            "currency": "CNY",
            "scholarshipType": "",
            "hasScholarship": False,
            "isPartialScholarship": False,
            "isSelfFinanced": True,
            "isOnline": False,
            "isNew": False,
            "badges": ["Auto-financement", "MBBS Anglais"],
            "description": "Programme médical complet de 6 ans enseigné entièrement en anglais, reconnu par l'OMS.",
            "requirements": {
                "age": "18-25 ans",
                "previousDegree": "Baccalauréat scientifique",
                "gpa": "Moyenne 12/20 minimum en sciences",
                "language": "IELTS 6.0 ou équivalent",
                "otherRequirements": ["Bonne santé physique", "Test d'aptitude"]
            },
            "scholarshipDetails": {
                "tuitionCovered": False,
                "accommodationCovered": False,
                "monthlyAllowance": 0,
                "insuranceCovered": False
            },
            "fees": {
                "originalTuition": 45000,
                "scholarshipTuition": 45000,
                "accommodationDouble": 8000,
                "accommodationSingle": 15000,
                "registrationFee": 500,
                "insuranceFee": 800,
                "applicationFee": 75
            },
            "documents": ["Passeport", "Baccalauréat", "Relevés de notes lycée", "Certificat médical", "Photos"],
            "views": 5600,
            "rating": 4.5,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Master en Sciences Politiques",
            "university": "Sciences Po Paris",
            "city": "Paris",
            "country": "France",
            "countryCode": "FR",
            "category": "law",
            "categoryLabel": "Droit",
            "degree": "Master",
            "duration": "2 ans",
            "teachingLanguage": "Français/Anglais",
            "intake": "Septembre 2025",
            "deadline": "15 Janvier 2025",
            "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600",
            "originalTuition": 14500,
            "scholarshipTuition": 0,
            "currency": "EUR",
            "scholarshipType": "Bourse Eiffel",
            "hasScholarship": True,
            "isPartialScholarship": False,
            "isSelfFinanced": False,
            "isOnline": False,
            "isNew": True,
            "badges": ["Bourse Complète", "Prestige", "Nouveau"],
            "description": "Formation d'excellence en affaires internationales et diplomatie.",
            "requirements": {
                "age": "Moins de 30 ans",
                "previousDegree": "Licence en sciences sociales",
                "gpa": "Mention Bien minimum",
                "language": "Français B2 ou DELF B2",
                "otherRequirements": ["Projet professionnel", "Entretien"]
            },
            "scholarshipDetails": {
                "tuitionCovered": True,
                "accommodationCovered": False,
                "monthlyAllowance": 1181,
                "insuranceCovered": True
            },
            "fees": {
                "originalTuition": 14500,
                "scholarshipTuition": 0,
                "accommodationDouble": 6000,
                "accommodationSingle": 9000,
                "registrationFee": 200,
                "insuranceFee": 0,
                "applicationFee": 50
            },
            "documents": ["Passeport", "Diplômes", "CV", "Lettre de motivation", "Projet de recherche"],
            "views": 4100,
            "rating": 4.9,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Cours de Langue Chinoise",
            "university": "Peking University",
            "city": "Beijing",
            "country": "Chine",
            "countryCode": "CN",
            "category": "chinese",
            "categoryLabel": "Langue Chinoise",
            "degree": "Certificat",
            "duration": "1 an",
            "teachingLanguage": "Chinois",
            "intake": "Mars/Septembre 2025",
            "deadline": "Ouvert",
            "image": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600",
            "originalTuition": 26000,
            "scholarshipTuition": 0,
            "currency": "CNY",
            "scholarshipType": "Confucius Institute Scholarship",
            "hasScholarship": True,
            "isPartialScholarship": False,
            "isSelfFinanced": False,
            "isOnline": True,
            "isNew": False,
            "badges": ["Bourse Complète", "En Ligne Disponible"],
            "description": "Programme intensif de langue chinoise avec option de cours en ligne.",
            "requirements": {
                "age": "18-45 ans",
                "previousDegree": "Baccalauréat",
                "gpa": "Non requis",
                "language": "Niveau débutant accepté",
                "otherRequirements": []
            },
            "scholarshipDetails": {
                "tuitionCovered": True,
                "accommodationCovered": True,
                "monthlyAllowance": 2500,
                "insuranceCovered": True
            },
            "fees": {
                "originalTuition": 26000,
                "scholarshipTuition": 0,
                "accommodationDouble": 0,
                "accommodationSingle": 0,
                "registrationFee": 400,
                "insuranceFee": 0,
                "applicationFee": 0
            },
            "documents": ["Passeport", "Diplôme le plus élevé", "Certificat médical"],
            "views": 8900,
            "rating": 4.7,
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Sample housing
    housing_data = [
        {
            "id": str(uuid.uuid4()),
            "type": "Chambre universitaire double",
            "location": "Campus Tsinghua",
            "city": "Beijing",
            "country": "Chine",
            "priceRange": "4000-6000 CNY/semestre",
            "priceMin": 4000,
            "priceMax": 6000,
            "currency": "CNY",
            "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600",
            "amenities": ["WiFi", "Climatisation", "Laverie", "Sécurité 24h"],
            "description": "Chambres doubles confortables sur le campus avec toutes les commodités.",
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "Studio meublé",
            "location": "Haidian District",
            "city": "Beijing",
            "country": "Chine",
            "priceRange": "3500-5000 CNY/mois",
            "priceMin": 3500,
            "priceMax": 5000,
            "currency": "CNY",
            "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
            "amenities": ["WiFi", "Cuisine équipée", "Machine à laver", "Proche métro"],
            "description": "Studios modernes à proximité des universités du district Haidian.",
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "Colocation",
            "location": "Quartier Latin",
            "city": "Paris",
            "country": "France",
            "priceRange": "600-900 EUR/mois",
            "priceMin": 600,
            "priceMax": 900,
            "currency": "EUR",
            "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
            "amenities": ["WiFi", "Salon commun", "Cuisine partagée", "Centre-ville"],
            "description": "Chambres en colocation dans le célèbre Quartier Latin, idéal pour étudiants.",
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "Résidence étudiante CROUS",
            "location": "Cité Universitaire",
            "city": "Paris",
            "country": "France",
            "priceRange": "400-600 EUR/mois",
            "priceMin": 400,
            "priceMax": 600,
            "currency": "EUR",
            "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600",
            "amenities": ["WiFi", "Salle d'étude", "Cafétéria", "Sécurité"],
            "description": "Résidences universitaires gérées par le CROUS avec tarifs avantageux.",
            "isActive": True,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert data
    await db.universities.delete_many({})
    await db.offers.delete_many({})
    await db.housing.delete_many({})
    
    await db.universities.insert_many(universities)
    await db.offers.insert_many(offers)
    await db.housing.insert_many(housing_data)
    
    return {
        "message": "Données insérées avec succès",
        "universities": len(universities),
        "offers": len(offers),
        "housing": len(housing_data)
    }

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

# ============= DATA MIGRATION =============

OFFERS_DATA = [
    {
        "title": "Génie Mécanique", "titleEn": "Mechanical Engineering",
        "university": "Université de Yanshan", "universityEn": "Yanshan University",
        "city": "Qinhuangdao", "country": "Chine", "countryCode": "CN",
        "category": "engineering", "categoryLabel": "Ingénierie",
        "degree": "Master", "duration": "3 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "30 Mai 2025",
        "image": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600",
        "originalTuition": 24800, "scholarshipTuition": 0, "currency": "CNY",
        "scholarshipType": "Type A - Bourse Complète",
        "hasScholarship": True, "isPartialScholarship": False, "isSelfFinanced": False,
        "isOnline": False, "isNew": True,
        "badges": ["Bourse Complète", "Populaire"], "views": 15234, "rating": 4.8,
        "description": "Programme de Master en Génie Mécanique avec bourse complète couvrant les frais de scolarité et logement.",
        "requirements": {"age": "18-35 ans", "previousDegree": "Licence en Ingénierie ou domaine connexe", "gpa": "Minimum 80/100 ou équivalent", "language": "IELTS 6.5+ ou TOEFL 85+ ou Duolingo 95+", "otherRequirements": ["Lettre de motivation", "2 lettres de recommandation", "CV détaillé"]},
        "scholarshipDetails": {"tuitionCovered": True, "accommodationCovered": True, "monthlyAllowance": 1000, "insuranceCovered": False},
        "fees": {"originalTuition": 24800, "scholarshipTuition": 0, "accommodationDouble": 10600, "accommodationSingle": 21200, "accommodationScholarship": 0, "registrationFee": 800, "insuranceFee": 1000, "applicationFee": 500},
        "documents": ["Photo d'identité", "Passeport (page ID)", "Relevés de notes", "Diplôme le plus élevé", "Certificat médical", "Casier judiciaire vierge", "Certificat de langue", "Relevé bancaire (+5000 USD)", "Plan d'études", "CV", "2 Lettres de recommandation"]
    },
    {
        "title": "Génie Électrique", "titleEn": "Electrical Engineering",
        "university": "Université de Yanshan", "universityEn": "Yanshan University",
        "city": "Qinhuangdao", "country": "Chine", "countryCode": "CN",
        "category": "engineering", "categoryLabel": "Ingénierie",
        "degree": "Master", "duration": "3 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "30 Mai 2025",
        "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
        "originalTuition": 24800, "scholarshipTuition": 0, "currency": "CNY",
        "scholarshipType": "Type A - Bourse Complète",
        "hasScholarship": True, "isPartialScholarship": False, "isSelfFinanced": False,
        "isOnline": False, "isNew": True,
        "badges": ["Bourse Complète"], "views": 12890, "rating": 4.7,
        "description": "Programme de Master en Génie Électrique avec couverture complète des frais.",
        "requirements": {"age": "18-35 ans", "previousDegree": "Licence en Génie Électrique ou domaine connexe", "gpa": "Minimum 80/100", "language": "IELTS 6.5+ ou TOEFL 85+", "otherRequirements": ["Lettre de motivation", "2 lettres de recommandation"]},
        "scholarshipDetails": {"tuitionCovered": True, "accommodationCovered": True, "monthlyAllowance": 1000, "insuranceCovered": False},
        "fees": {"originalTuition": 24800, "scholarshipTuition": 0, "accommodationDouble": 10600, "accommodationSingle": 21200, "accommodationScholarship": 0, "registrationFee": 800, "insuranceFee": 1000, "applicationFee": 500},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes", "Diplôme", "Certificat médical", "Casier judiciaire", "Certificat de langue"]
    },
    {
        "title": "Informatique et Technologie", "titleEn": "Computer Science and Technology",
        "university": "Université de Pékin", "universityEn": "Peking University",
        "city": "Beijing", "country": "Chine", "countryCode": "CN",
        "category": "engineering", "categoryLabel": "Ingénierie",
        "degree": "Master", "duration": "2 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "15 Mars 2025",
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
        "originalTuition": 45000, "scholarshipTuition": 0, "currency": "CNY",
        "scholarshipType": "Bourse CSC",
        "hasScholarship": True, "isPartialScholarship": False, "isSelfFinanced": False,
        "isOnline": False, "isNew": True,
        "badges": ["Bourse CSC", "Top Université", "Populaire"], "views": 28450, "rating": 4.9,
        "description": "Programme prestigieux en Computer Science à l'Université de Pékin avec bourse gouvernementale.",
        "requirements": {"age": "18-35 ans", "previousDegree": "Licence en Informatique", "gpa": "Minimum 85/100", "language": "IELTS 7.0+ ou TOEFL 95+", "otherRequirements": ["Publications académiques appréciées", "Expérience en recherche"]},
        "scholarshipDetails": {"tuitionCovered": True, "accommodationCovered": True, "monthlyAllowance": 3000, "insuranceCovered": True},
        "fees": {"originalTuition": 45000, "scholarshipTuition": 0, "accommodationDouble": 15000, "accommodationSingle": 25000, "accommodationScholarship": 0, "registrationFee": 1000, "insuranceFee": 800, "applicationFee": 600},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes", "Diplôme", "Certificat médical", "Casier judiciaire", "IELTS/TOEFL", "Plan d'études détaillé", "CV académique", "2 Lettres de recommandation"]
    },
    {
        "title": "Médecine (MBBS)", "titleEn": "Medicine (MBBS)",
        "university": "Université de Médecine de Shanghai", "universityEn": "Shanghai Medical University",
        "city": "Shanghai", "country": "Chine", "countryCode": "CN",
        "category": "medicine", "categoryLabel": "Médecine",
        "degree": "Bachelor (MBBS)", "duration": "6 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "30 Juin 2025",
        "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
        "originalTuition": 45000, "scholarshipTuition": 35000, "currency": "CNY",
        "scholarshipType": "Bourse Partielle",
        "hasScholarship": True, "isPartialScholarship": True, "isSelfFinanced": False,
        "isOnline": False, "isNew": False,
        "badges": ["MBBS", "Bourse Partielle", "Top Ranking"], "views": 45670, "rating": 4.8,
        "description": "Programme MBBS en anglais reconnu par l'OMS et le MCI.",
        "requirements": {"age": "18-25 ans", "previousDegree": "Baccalauréat scientifique", "gpa": "Minimum 70% en Biologie, Chimie et Physique", "language": "IELTS 6.0+ ou équivalent", "otherRequirements": ["Certificat de santé", "Pas de daltonisme"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 45000, "scholarshipTuition": 35000, "accommodationDouble": 8000, "accommodationSingle": 15000, "registrationFee": 500, "insuranceFee": 800, "applicationFee": 500},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes du lycée", "Diplôme du Baccalauréat", "Certificat médical complet", "Casier judiciaire", "Certificat de langue"]
    },
    {
        "title": "Langue Chinoise - Niveau Débutant", "titleEn": "Chinese Language - Beginner Level",
        "university": "Université de Nanjing", "universityEn": "Nanjing University",
        "city": "Nanjing", "country": "Chine", "countryCode": "CN",
        "category": "chinese", "categoryLabel": "Langue Chinoise",
        "degree": "Non-diplômant", "duration": "1 an", "teachingLanguage": "Chinois",
        "intake": "Automne 2025", "deadline": "15 Juillet 2025",
        "image": "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=600",
        "originalTuition": 18000, "scholarshipTuition": 18000, "currency": "CNY",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": False, "isNew": False,
        "badges": ["Débutant", "Auto-financé"], "views": 23400, "rating": 4.6,
        "description": "Programme intensif de langue chinoise pour débutants avec préparation HSK.",
        "requirements": {"age": "18-45 ans", "previousDegree": "Baccalauréat minimum", "gpa": "Non requis", "language": "Aucune connaissance du chinois requise", "otherRequirements": []},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 18000, "scholarshipTuition": 18000, "accommodationDouble": 6000, "accommodationSingle": 12000, "registrationFee": 400, "insuranceFee": 600, "applicationFee": 300},
        "documents": ["Photo d'identité", "Passeport", "Diplôme le plus élevé", "Certificat médical"]
    },
    {
        "title": "Administration des Affaires", "titleEn": "Business Administration",
        "university": "Université Tsinghua", "universityEn": "Tsinghua University",
        "city": "Beijing", "country": "Chine", "countryCode": "CN",
        "category": "management", "categoryLabel": "Gestion",
        "degree": "MBA", "duration": "2 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "1er Avril 2025",
        "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600",
        "originalTuition": 180000, "scholarshipTuition": 90000, "currency": "CNY",
        "scholarshipType": "Bourse Partielle 50%",
        "hasScholarship": True, "isPartialScholarship": True, "isSelfFinanced": False,
        "isOnline": False, "isNew": False,
        "badges": ["MBA", "Bourse Partielle", "Top 10 Mondial"], "views": 34500, "rating": 4.9,
        "description": "MBA prestigieux à Tsinghua, classé parmi les meilleurs au monde.",
        "requirements": {"age": "25-40 ans", "previousDegree": "Licence + 3 ans d'expérience professionnelle", "gpa": "Minimum 3.0/4.0", "language": "GMAT 680+ et IELTS 7.0+", "otherRequirements": ["Entretien obligatoire", "Essais de candidature"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 180000, "scholarshipTuition": 90000, "accommodationDouble": 20000, "accommodationSingle": 35000, "registrationFee": 1500, "insuranceFee": 1000, "applicationFee": 800},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes universitaires", "Diplôme de Licence", "Score GMAT", "IELTS/TOEFL", "CV professionnel", "3 Lettres de recommandation", "Essais de motivation"]
    },
    {
        "title": "Ingénierie Informatique", "titleEn": "Computer Engineering",
        "university": "École Polytechnique", "universityEn": "École Polytechnique",
        "city": "Palaiseau", "country": "France", "countryCode": "FR",
        "category": "engineering", "categoryLabel": "Ingénierie",
        "degree": "Master", "duration": "2 ans", "teachingLanguage": "Français/Anglais",
        "intake": "Automne 2025", "deadline": "15 Janvier 2025",
        "image": "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=600",
        "originalTuition": 15000, "scholarshipTuition": 0, "currency": "EUR",
        "scholarshipType": "Bourse Eiffel",
        "hasScholarship": True, "isPartialScholarship": False, "isSelfFinanced": False,
        "isOnline": False, "isNew": True,
        "badges": ["Grande École", "Bourse Complète", "Excellence"], "views": 19800, "rating": 4.9,
        "description": "Programme d'ingénierie de haut niveau avec possibilité de bourse Eiffel.",
        "requirements": {"age": "18-30 ans", "previousDegree": "Licence en Ingénierie", "gpa": "Top 10% de la promotion", "language": "Français B2 ou Anglais C1", "otherRequirements": ["Lettre de motivation", "Projet de recherche"]},
        "scholarshipDetails": {"tuitionCovered": True, "accommodationCovered": False, "monthlyAllowance": 1181, "insuranceCovered": True},
        "fees": {"originalTuition": 15000, "scholarshipTuition": 0, "accommodationDouble": 5000, "accommodationSingle": 8000, "registrationFee": 300, "insuranceFee": 0, "applicationFee": 0},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes", "Diplôme", "Certificat de langue", "CV", "Lettre de motivation", "2 Lettres de recommandation"]
    },
    {
        "title": "Commerce International", "titleEn": "International Business",
        "university": "HEC Paris", "universityEn": "HEC Paris",
        "city": "Jouy-en-Josas", "country": "France", "countryCode": "FR",
        "category": "management", "categoryLabel": "Gestion",
        "degree": "Master", "duration": "2 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "1er Mars 2025",
        "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600",
        "originalTuition": 45000, "scholarshipTuition": 22500, "currency": "EUR",
        "scholarshipType": "Bourse HEC",
        "hasScholarship": True, "isPartialScholarship": True, "isSelfFinanced": False,
        "isOnline": False, "isNew": False,
        "badges": ["Grande École", "Bourse Partielle", "Top Business School"], "views": 27600, "rating": 4.9,
        "description": "Programme de management international de renommée mondiale.",
        "requirements": {"age": "21-35 ans", "previousDegree": "Licence (tout domaine)", "gpa": "Excellent dossier académique", "language": "GMAT 700+ et IELTS 7.0+", "otherRequirements": ["Entretien", "Essais"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 45000, "scholarshipTuition": 22500, "accommodationDouble": 8000, "accommodationSingle": 12000, "registrationFee": 500, "insuranceFee": 500, "applicationFee": 150},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes", "Diplôme", "GMAT", "IELTS/TOEFL", "CV", "Lettre de motivation", "2 Lettres de recommandation"]
    },
    {
        "title": "Langue Française - FLE", "titleEn": "French as Foreign Language",
        "university": "Sorbonne Université", "universityEn": "Sorbonne University",
        "city": "Paris", "country": "France", "countryCode": "FR",
        "category": "french", "categoryLabel": "Langue Française",
        "degree": "Certificat", "duration": "1 semestre", "teachingLanguage": "Français",
        "intake": "Automne 2025", "deadline": "30 Juin 2025",
        "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
        "originalTuition": 3500, "scholarshipTuition": 3500, "currency": "EUR",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": False, "isNew": False,
        "badges": ["FLE", "Auto-financé", "Sorbonne"], "views": 15400, "rating": 4.7,
        "description": "Programme intensif de français langue étrangère à la Sorbonne.",
        "requirements": {"age": "18-60 ans", "previousDegree": "Baccalauréat", "gpa": "Non requis", "language": "Niveau A1 minimum", "otherRequirements": []},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 3500, "scholarshipTuition": 3500, "accommodationDouble": 4000, "accommodationSingle": 7000, "registrationFee": 100, "insuranceFee": 200, "applicationFee": 50},
        "documents": ["Photo d'identité", "Passeport", "Diplôme du Baccalauréat", "Test de niveau de français"]
    },
    {
        "title": "Physique Appliquée", "titleEn": "Applied Physics",
        "university": "Université Fudan", "universityEn": "Fudan University",
        "city": "Shanghai", "country": "Chine", "countryCode": "CN",
        "category": "science", "categoryLabel": "Sciences",
        "degree": "Doctorat", "duration": "4 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "15 Février 2025",
        "image": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600",
        "originalTuition": 40000, "scholarshipTuition": 0, "currency": "CNY",
        "scholarshipType": "Bourse CSC",
        "hasScholarship": True, "isPartialScholarship": False, "isSelfFinanced": False,
        "isOnline": False, "isNew": True,
        "badges": ["Bourse Complète", "Doctorat", "Recherche"], "views": 8900, "rating": 4.8,
        "description": "Programme doctoral en physique avec financement complet.",
        "requirements": {"age": "18-35 ans", "previousDegree": "Master en Physique", "gpa": "Minimum 85/100", "language": "IELTS 6.5+", "otherRequirements": ["Publications requises", "Proposition de recherche"]},
        "scholarshipDetails": {"tuitionCovered": True, "accommodationCovered": True, "monthlyAllowance": 3500, "insuranceCovered": True},
        "fees": {"originalTuition": 40000, "scholarshipTuition": 0, "accommodationDouble": 12000, "accommodationSingle": 20000, "accommodationScholarship": 0, "registrationFee": 800, "insuranceFee": 800, "applicationFee": 600},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes Master", "Diplôme de Master", "Publications", "Proposition de recherche", "CV académique", "3 Lettres de recommandation"]
    },
    {
        "title": "Droit International", "titleEn": "International Law",
        "university": "Sciences Po Paris", "universityEn": "Sciences Po Paris",
        "city": "Paris", "country": "France", "countryCode": "FR",
        "category": "law", "categoryLabel": "Droit",
        "degree": "Master", "duration": "2 ans", "teachingLanguage": "Anglais/Français",
        "intake": "Automne 2025", "deadline": "15 Janvier 2025",
        "image": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
        "originalTuition": 14500, "scholarshipTuition": 0, "currency": "EUR",
        "scholarshipType": "Bourse Émile Boutmy",
        "hasScholarship": True, "isPartialScholarship": False, "isSelfFinanced": False,
        "isOnline": False, "isNew": True,
        "badges": ["Sciences Po", "Bourse Complète", "Droit"], "views": 12300, "rating": 4.8,
        "description": "Master en droit international à Sciences Po avec possibilité de bourse.",
        "requirements": {"age": "18-30 ans", "previousDegree": "Licence en Droit", "gpa": "Excellent dossier", "language": "Français B2 et Anglais C1", "otherRequirements": ["CV", "Lettre de motivation", "Projet professionnel"]},
        "scholarshipDetails": {"tuitionCovered": True, "accommodationCovered": False, "monthlyAllowance": 700, "insuranceCovered": False},
        "fees": {"originalTuition": 14500, "scholarshipTuition": 0, "accommodationDouble": 5000, "accommodationSingle": 9000, "registrationFee": 200, "insuranceFee": 200, "applicationFee": 0},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes", "Diplôme de Licence", "Certificats de langue", "CV", "Lettre de motivation"]
    },
    {
        "title": "Chinois Mandarin - En Ligne", "titleEn": "Mandarin Chinese - Online",
        "university": "Beijing Language University", "universityEn": "Beijing Language University",
        "city": "En ligne", "country": "Chine", "countryCode": "CN",
        "category": "chinese", "categoryLabel": "Langue Chinoise",
        "degree": "Certificat", "duration": "6 mois", "teachingLanguage": "Chinois/Anglais",
        "intake": "Flexible", "deadline": "Inscription continue",
        "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
        "originalTuition": 5000, "scholarshipTuition": 5000, "currency": "CNY",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": True, "isNew": True,
        "badges": ["En Ligne", "Flexible", "Certificat"], "views": 8900, "rating": 4.5,
        "description": "Cours de chinois mandarin entièrement en ligne avec professeurs natifs.",
        "requirements": {"age": "Tous âges", "previousDegree": "Aucun", "gpa": "Non requis", "language": "Anglais basique recommandé", "otherRequirements": ["Connexion internet stable", "Ordinateur ou tablette"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 5000, "scholarshipTuition": 5000, "accommodationDouble": 0, "accommodationSingle": 0, "registrationFee": 200, "insuranceFee": 0, "applicationFee": 100},
        "documents": ["Photo d'identité", "Passeport ou carte d'identité"]
    },
    {
        "title": "MBA en Ligne - Business International", "titleEn": "Online MBA - International Business",
        "university": "INSEAD Online", "universityEn": "INSEAD Online",
        "city": "En ligne", "country": "France", "countryCode": "FR",
        "category": "management", "categoryLabel": "Gestion",
        "degree": "MBA", "duration": "18 mois", "teachingLanguage": "Anglais",
        "intake": "Janvier / Septembre", "deadline": "30 Novembre 2025",
        "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600",
        "originalTuition": 35000, "scholarshipTuition": 35000, "currency": "EUR",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": True, "isNew": True,
        "badges": ["En Ligne", "MBA", "INSEAD"], "views": 12500, "rating": 4.7,
        "description": "Programme MBA en ligne de l'INSEAD, flexibilité totale pour professionnels.",
        "requirements": {"age": "25+", "previousDegree": "Licence + 5 ans expérience", "gpa": "Bon dossier académique", "language": "Anglais C1", "otherRequirements": ["GMAT/GRE recommandé", "Entretien vidéo"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 35000, "scholarshipTuition": 35000, "accommodationDouble": 0, "accommodationSingle": 0, "registrationFee": 300, "insuranceFee": 0, "applicationFee": 200},
        "documents": ["Photo d'identité", "Passeport", "CV professionnel", "Diplômes", "Lettre de motivation", "Recommandations"]
    },
    {
        "title": "Français Langue Étrangère - En Ligne", "titleEn": "French as Foreign Language - Online",
        "university": "Alliance Française", "universityEn": "Alliance Française",
        "city": "En ligne", "country": "France", "countryCode": "FR",
        "category": "french", "categoryLabel": "Langue Française",
        "degree": "Certificat DELF/DALF", "duration": "3-12 mois", "teachingLanguage": "Français",
        "intake": "Flexible", "deadline": "Inscription continue",
        "image": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600",
        "originalTuition": 1500, "scholarshipTuition": 1500, "currency": "EUR",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": True, "isNew": True,
        "badges": ["En Ligne", "DELF/DALF", "Flexible"], "views": 7800, "rating": 4.6,
        "description": "Cours de français en ligne avec préparation aux examens DELF/DALF.",
        "requirements": {"age": "Tous âges", "previousDegree": "Aucun", "gpa": "Non requis", "language": "Aucune connaissance requise (débutant accepté)", "otherRequirements": ["Connexion internet"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 1500, "scholarshipTuition": 1500, "accommodationDouble": 0, "accommodationSingle": 0, "registrationFee": 50, "insuranceFee": 0, "applicationFee": 0},
        "documents": ["Photo d'identité", "Pièce d'identité"]
    },
    {
        "title": "Data Science & Intelligence Artificielle", "titleEn": "Data Science & Artificial Intelligence",
        "university": "Coursera - Université de Pékin", "universityEn": "Coursera - Peking University",
        "city": "En ligne", "country": "Chine", "countryCode": "CN",
        "category": "engineering", "categoryLabel": "Ingénierie",
        "degree": "Certificat Professionnel", "duration": "6 mois", "teachingLanguage": "Anglais",
        "intake": "Flexible", "deadline": "Inscription continue",
        "image": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600",
        "originalTuition": 3000, "scholarshipTuition": 3000, "currency": "CNY",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": True, "isNew": True,
        "badges": ["En Ligne", "IA", "Certificat"], "views": 15600, "rating": 4.8,
        "description": "Certificat professionnel en Data Science et IA de l'Université de Pékin.",
        "requirements": {"age": "Tous âges", "previousDegree": "Licence recommandée", "gpa": "Non requis", "language": "Anglais intermédiaire", "otherRequirements": ["Connaissances de base en programmation"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 3000, "scholarshipTuition": 3000, "accommodationDouble": 0, "accommodationSingle": 0, "registrationFee": 0, "insuranceFee": 0, "applicationFee": 0},
        "documents": ["Inscription en ligne uniquement"]
    },
    {
        "title": "Commerce et Marketing", "titleEn": "Business and Marketing",
        "university": "Université de Shanghai", "universityEn": "Shanghai University",
        "city": "Shanghai", "country": "Chine", "countryCode": "CN",
        "category": "management", "categoryLabel": "Gestion",
        "degree": "Licence", "duration": "4 ans", "teachingLanguage": "Anglais",
        "intake": "Automne 2025", "deadline": "30 Juin 2025",
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
        "originalTuition": 28000, "scholarshipTuition": 28000, "currency": "CNY",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": False, "isNew": False,
        "badges": ["Auto-financé", "Anglais"], "views": 9800, "rating": 4.4,
        "description": "Programme de licence en commerce international à Shanghai.",
        "requirements": {"age": "18-25 ans", "previousDegree": "Baccalauréat", "gpa": "Minimum 60%", "language": "IELTS 5.5+", "otherRequirements": []},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 28000, "scholarshipTuition": 28000, "accommodationDouble": 8000, "accommodationSingle": 15000, "registrationFee": 500, "insuranceFee": 800, "applicationFee": 400},
        "documents": ["Photo d'identité", "Passeport", "Relevés de notes", "Diplôme du Baccalauréat", "Certificat de langue"]
    },
    {
        "title": "Architecture et Design", "titleEn": "Architecture and Design",
        "university": "École des Beaux-Arts", "universityEn": "École des Beaux-Arts",
        "city": "Paris", "country": "France", "countryCode": "FR",
        "category": "arts", "categoryLabel": "Arts & Design",
        "degree": "Master", "duration": "2 ans", "teachingLanguage": "Français",
        "intake": "Automne 2025", "deadline": "15 Avril 2025",
        "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600",
        "originalTuition": 12000, "scholarshipTuition": 12000, "currency": "EUR",
        "scholarshipType": "Auto-financement",
        "hasScholarship": False, "isPartialScholarship": False, "isSelfFinanced": True,
        "isOnline": False, "isNew": False,
        "badges": ["Auto-financé", "Arts", "Paris"], "views": 6700, "rating": 4.6,
        "description": "Master en architecture et design à l'École des Beaux-Arts de Paris.",
        "requirements": {"age": "18-35 ans", "previousDegree": "Licence en Architecture ou Design", "gpa": "Bon dossier", "language": "Français B2", "otherRequirements": ["Portfolio", "Entretien"]},
        "scholarshipDetails": {"tuitionCovered": False, "accommodationCovered": False, "monthlyAllowance": 0, "insuranceCovered": False},
        "fees": {"originalTuition": 12000, "scholarshipTuition": 12000, "accommodationDouble": 5000, "accommodationSingle": 9000, "registrationFee": 300, "insuranceFee": 300, "applicationFee": 100},
        "documents": ["Photo d'identité", "Passeport", "Diplôme", "Portfolio (min 15 projets)", "Certificat de langue", "CV"]
    }
]

@api_router.post("/admin/import-offers-data")
async def import_offers_data(admin: dict = Depends(get_admin_user)):
    """Import all offers from the static data into the database. Skips duplicates by title+university."""
    imported = 0
    skipped = 0
    for offer_data in OFFERS_DATA:
        existing = await db.offers.find_one({
            "title": offer_data["title"],
            "university": offer_data["university"]
        })
        if existing:
            skipped += 1
            continue
        offer = Offer(**offer_data)
        await db.offers.insert_one(serialize_doc(offer.model_dump()))
        imported += 1
    return {"message": f"{imported} offres importées, {skipped} doublons ignorés", "imported": imported, "skipped": skipped}

# ============= UNIVERSITIES DATA =============

UNIVERSITIES_DATA = [
    {"name": "Université de Pékin", "city": "Beijing", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400",
     "ranking": "Top 20 Mondial", "badges": ["Projet 985", "Double First Class"]},
    {"name": "Université Tsinghua", "city": "Beijing", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1562774053-701939374585?w=400",
     "ranking": "Top 15 Mondial", "badges": ["Projet 985", "Projet 211"]},
    {"name": "Université Fudan", "city": "Shanghai", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
     "ranking": "Top 50 Mondial", "badges": ["Projet 985"]},
    {"name": "Université Zhejiang", "city": "Hangzhou", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400",
     "ranking": "Top 60 Mondial", "badges": ["Double First Class"]},
    {"name": "Université de Yanshan", "city": "Qinhuangdao", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1562774053-701939374585?w=400",
     "ranking": "Top 500 National", "badges": ["Ingénierie", "Recherche"]},
    {"name": "Université de Nanjing", "city": "Nanjing", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
     "ranking": "Top 100 Mondial", "badges": ["Projet 985", "Double First Class"]},
    {"name": "Université de Médecine de Shanghai", "city": "Shanghai", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
     "ranking": "Top 5 Médecine Chine", "badges": ["MBBS", "OMS"]},
    {"name": "Université de Shanghai", "city": "Shanghai", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
     "ranking": "Top 200 Mondial", "badges": ["Commerce", "Projet 211"]},
    {"name": "Beijing Language University", "city": "Beijing", "country": "Chine", "countryCode": "CN",
     "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
     "ranking": "N°1 Langue Chinoise", "badges": ["HSK", "Langue Chinoise"]},
    {"name": "Sorbonne Université", "city": "Paris", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400",
     "ranking": "Top 50 Mondial", "badges": ["Excellence", "Recherche"]},
    {"name": "École Polytechnique", "city": "Palaiseau", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400",
     "ranking": "Top 60 Mondial", "badges": ["Grande École", "Ingénierie"]},
    {"name": "Université PSL", "city": "Paris", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
     "ranking": "Top 30 Mondial", "badges": ["Excellence", "Recherche"]},
    {"name": "Sciences Po Paris", "city": "Paris", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400",
     "ranking": "Top 3 Sciences Politiques", "badges": ["Sciences Politiques", "Droit"]},
    {"name": "HEC Paris", "city": "Jouy-en-Josas", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400",
     "ranking": "Top 5 Business School", "badges": ["Grande École", "MBA"]},
    {"name": "École des Beaux-Arts", "city": "Paris", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
     "ranking": "Top 10 Arts & Design", "badges": ["Arts", "Architecture"]},
    {"name": "Alliance Française", "city": "Paris", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400",
     "ranking": "N°1 FLE Mondial", "badges": ["DELF/DALF", "Langue Française"]},
    {"name": "INSEAD", "city": "Fontainebleau", "country": "France", "countryCode": "FR",
     "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
     "ranking": "Top 3 MBA Mondial", "badges": ["MBA", "Business"]},
]

@api_router.post("/admin/import-universities-data")
async def import_universities_data(admin: dict = Depends(get_admin_user)):
    """Import universities into the database. Skips duplicates by name."""
    imported = 0
    skipped = 0
    for uni_data in UNIVERSITIES_DATA:
        existing = await db.universities.find_one({"name": uni_data["name"]})
        if existing:
            skipped += 1
            continue
        uni = University(**uni_data)
        await db.universities.insert_one(serialize_doc(uni.model_dump()))
        imported += 1
    return {"message": f"{imported} universités importées, {skipped} doublons ignorés", "imported": imported, "skipped": skipped}

# ============= HOUSING DATA =============

HOUSING_DATA = [
    {"type": "Résidence Universitaire", "location": "Campus Université de Pékin", "city": "Beijing", "country": "Chine",
     "priceRange": "800-1,500 CNY/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["Sécurité 24h", "Internet inclus", "Proche des cours", "Buanderie", "Cantine sur place"]},
    {"type": "Résidence Universitaire", "location": "Campus Tsinghua", "city": "Beijing", "country": "Chine",
     "priceRange": "1,000-2,000 CNY/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["Sécurité 24h", "Internet haut débit", "Salle de sport", "Chambre double/simple"]},
    {"type": "Appartement Privé", "location": "Haidian District", "city": "Beijing", "country": "Chine",
     "priceRange": "3,000-6,000 CNY/mois", "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
     "features": ["Indépendance", "Cuisine équipée", "Proche métro", "Wi-Fi inclus"]},
    {"type": "Colocation", "location": "Wudaokou", "city": "Beijing", "country": "Chine",
     "priceRange": "2,000-4,000 CNY/mois", "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
     "features": ["Prix réduit", "Quartier étudiant", "Partage des charges", "Communauté internationale"]},
    {"type": "Résidence Universitaire", "location": "Campus Fudan", "city": "Shanghai", "country": "Chine",
     "priceRange": "1,200-2,500 CNY/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["Sécurité 24h", "Internet inclus", "Chambre individuelle disponible", "Climatisation"]},
    {"type": "Appartement Privé", "location": "Jing'an District", "city": "Shanghai", "country": "Chine",
     "priceRange": "4,000-8,000 CNY/mois", "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
     "features": ["Centre-ville", "Moderne", "Transports à proximité", "Sécurisé"]},
    {"type": "Résidence Universitaire", "location": "Campus Nanjing", "city": "Nanjing", "country": "Chine",
     "priceRange": "600-1,200 CNY/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["Économique", "Communauté étudiante", "Cantine", "Bibliothèque"]},
    {"type": "Résidence CROUS", "location": "Cité Universitaire Internationale", "city": "Paris", "country": "France",
     "priceRange": "400-700 €/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["APL éligible", "Proche RER B", "Restauration", "Espaces communs"]},
    {"type": "Studio meublé", "location": "Quartier Latin", "city": "Paris", "country": "France",
     "priceRange": "600-1,200 €/mois", "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
     "features": ["Centre de Paris", "Meublé", "Proche universités", "Commerces"]},
    {"type": "Colocation", "location": "Belleville", "city": "Paris", "country": "France",
     "priceRange": "400-700 €/mois", "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
     "features": ["Prix réduit", "Vie sociale", "Quartier animé", "Métro ligne 2/11"]},
    {"type": "Famille d'Accueil", "location": "Quartier résidentiel", "city": "Paris", "country": "France",
     "priceRange": "500-900 €/mois", "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
     "features": ["Immersion culturelle", "Repas inclus", "Accompagnement", "Pratique du français"]},
    {"type": "Résidence étudiante privée", "location": "Saclay", "city": "Palaiseau", "country": "France",
     "priceRange": "500-800 €/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["Proche École Polytechnique", "Moderne", "Salle de sport", "Parking vélo"]},
    {"type": "Résidence Universitaire", "location": "Campus Yanshan", "city": "Qinhuangdao", "country": "Chine",
     "priceRange": "400-800 CNY/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["Très économique", "Sur campus", "Cantine", "Internet inclus"]},
    {"type": "Appartement Privé", "location": "Gulou District", "city": "Nanjing", "country": "Chine",
     "priceRange": "2,000-4,000 CNY/mois", "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
     "features": ["Centre historique", "Transports faciles", "Cuisine équipée", "Abordable"]},
    {"type": "Colocation", "location": "Quartier Montparnasse", "city": "Paris", "country": "France",
     "priceRange": "450-750 €/mois", "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
     "features": ["Proche Sorbonne", "Ambiance conviviale", "Transports pratiques", "Commerces"]},
    {"type": "Résidence étudiante", "location": "Pudong New Area", "city": "Shanghai", "country": "Chine",
     "priceRange": "1,500-3,000 CNY/mois", "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
     "features": ["Moderne", "Sécurité 24h", "Salle commune", "Proche métro"]},
]

@api_router.post("/admin/import-housing-data")
async def import_housing_data(admin: dict = Depends(get_admin_user)):
    """Import housing options into the database. Skips duplicates by type+location+city."""
    imported = 0
    skipped = 0
    for h_data in HOUSING_DATA:
        existing = await db.housing.find_one({
            "type": h_data["type"],
            "location": h_data["location"],
            "city": h_data["city"]
        })
        if existing:
            skipped += 1
            continue
        housing = Housing(**h_data)
        await db.housing.insert_one(serialize_doc(housing.model_dump()))
        imported += 1
    return {"message": f"{imported} logements importés, {skipped} doublons ignorés", "imported": imported, "skipped": skipped}

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
