from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

# MongoDB connection - using environment variables
mongo_url = os.environ.get('MONGO_URL', '')
db_name = os.environ.get('DB_NAME', 'winnersconsulting')

# Create client only if URL is provided
client = None
db = None

def get_db():
    global client, db
    if client is None and mongo_url:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
    return db

# Create the main app
app = FastAPI(root_path="/api")
api_router = APIRouter()

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
    role: str = "user"
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
    admissionConditions: List[dict] = []
    requiredDocuments: List[str] = []
    documentTemplates: List[dict] = []
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
    admissionConditions: List[dict] = []
    requiredDocuments: List[str] = []
    documentTemplates: List[dict] = []
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
    firstName: str = ""
    lastName: str = ""
    nationality: str = ""
    sex: str = ""
    passportNumber: str = ""
    dateOfBirth: str = ""
    phoneNumber: str = ""
    address: str = ""
    additionalPrograms: List[str] = []
    documents: List[dict] = []
    termsAccepted: bool = False
    paymentMethod: str = ""
    paymentProof: str = ""
    paymentStatus: str = "pending"
    paymentAmount: float = 0
    status: str = "pending"
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
        
        database = get_db()
        user = await database.users.find_one({"id": user_id})
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
    if doc.get('createdAt') and isinstance(doc['createdAt'], datetime):
        doc['createdAt'] = doc['createdAt'].isoformat()
    return doc

def deserialize_doc(doc: dict) -> dict:
    if doc.get('createdAt') and isinstance(doc['createdAt'], str):
        doc['createdAt'] = datetime.fromisoformat(doc['createdAt'])
    return doc

# ============= AUTH ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Winners Consulting API", "status": "ok"}

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    database = get_db()
    existing_user = await database.users.find_one({"email": user_data.email})
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
    
    await database.users.insert_one(user_dict)
    
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
    database = get_db()
    user = await database.users.find_one({"email": credentials.email})
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
    database = get_db()
    favorites = current_user.get("favorites", [])
    if offer_id not in favorites:
        favorites.append(offer_id)
        await database.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"favorites": favorites}}
        )
    return {"message": "Ajouté aux favoris", "favorites": favorites}

@api_router.delete("/user/favorites/{offer_id}")
async def remove_from_favorites(offer_id: str, current_user: dict = Depends(get_current_user)):
    database = get_db()
    favorites = current_user.get("favorites", [])
    if offer_id in favorites:
        favorites.remove(offer_id)
        await database.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"favorites": favorites}}
        )
    return {"message": "Retiré des favoris", "favorites": favorites}

@api_router.get("/user/favorites")
async def get_favorites(current_user: dict = Depends(get_current_user)):
    database = get_db()
    favorites = current_user.get("favorites", [])
    if not favorites:
        return []
    
    offers = await database.offers.find({"id": {"$in": favorites}}, {"_id": 0}).to_list(100)
    
    valid_ids = [o["id"] for o in offers]
    invalid_ids = [f for f in favorites if f not in valid_ids]
    
    if invalid_ids:
        new_favorites = [f for f in favorites if f in valid_ids]
        await database.users.update_one(
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
    database = get_db()
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
    
    offers = await database.offers.find(query, {"_id": 0}).sort("createdAt", -1).to_list(100)
    
    offer_ids = [o["id"] for o in offers]
    if offer_ids:
        pipeline = [
            {"$match": {"favorites": {"$in": offer_ids}}},
            {"$unwind": "$favorites"},
            {"$match": {"favorites": {"$in": offer_ids}}},
            {"$group": {"_id": "$favorites", "count": {"$sum": 1}}}
        ]
        fav_counts = {}
        async for doc in database.users.aggregate(pipeline):
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
    database = get_db()
    offer = await database.offers.find_one({"id": offer_id}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    
    await database.offers.update_one({"id": offer_id}, {"$inc": {"views": 1}})
    
    return offer

# ============= MESSAGES ROUTES =============

class MessageReplyUser(BaseModel):
    content: str
    attachments: Optional[List[str]] = []

@api_router.post("/messages")
async def create_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    database = get_db()
    message = Message(
        senderId=current_user["id"],
        senderName=f"{current_user['firstName']} {current_user['lastName']}",
        senderEmail=current_user["email"],
        subject=message_data.subject,
        content=message_data.content,
        offerId=message_data.offerId,
        attachments=message_data.attachments or []
    )
    
    await database.messages.insert_one(serialize_doc(message.model_dump()))
    return {"message": "Message envoyé avec succès", "id": message.id}

@api_router.get("/messages")
async def get_my_messages(current_user: dict = Depends(get_current_user)):
    database = get_db()
    messages = await database.messages.find(
        {"senderId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return messages

@api_router.post("/messages/{message_id}/reply")
async def user_reply_message(message_id: str, reply: MessageReplyUser, current_user: dict = Depends(get_current_user)):
    database = get_db()
    message = await database.messages.find_one({"id": message_id})
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
    
    await database.messages.update_one(
        {"id": message_id},
        {"$push": {"replies": reply_data}, "$set": {"isRead": False}}
    )
    
    return {"message": "Réponse envoyée"}

# ============= APPLICATIONS ROUTES =============

@api_router.post("/applications")
async def create_application(app_data: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    database = get_db()
    existing = await database.applications.find_one({
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
    
    await database.applications.insert_one(serialize_doc(application.model_dump()))
    return {"message": "Candidature soumise avec succès", "id": application.id}

@api_router.get("/applications")
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    database = get_db()
    applications = await database.applications.find(
        {"userId": current_user["id"]},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(100)
    return applications

# ============= UNIVERSITIES ROUTES =============

@api_router.get("/universities")
async def get_universities(country: Optional[str] = None):
    database = get_db()
    query = {"isActive": True}
    if country:
        query["countryCode"] = country
    
    universities = await database.universities.find(query, {"_id": 0}).to_list(100)
    return universities

@api_router.get("/universities/{uni_id}")
async def get_university(uni_id: str):
    database = get_db()
    uni = await database.universities.find_one({"id": uni_id}, {"_id": 0})
    if not uni:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    
    await database.universities.update_one({"id": uni_id}, {"$inc": {"views": 1}})
    return uni

# ============= HOUSING ROUTES =============

@api_router.get("/housing")
async def get_housing():
    database = get_db()
    housing = await database.housing.find({"isActive": True}, {"_id": 0}).to_list(100)
    return housing

# ============= ADMIN ROUTES =============

@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    database = get_db()
    users = await database.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/toggle-status")
async def admin_toggle_user_status(user_id: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    user = await database.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    new_status = not user.get("isActive", True)
    await database.users.update_one({"id": user_id}, {"$set": {"isActive": new_status}})
    return {"message": "Statut modifié", "isActive": new_status}

@api_router.put("/admin/users/{user_id}/make-admin")
async def admin_make_admin(user_id: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    await database.users.update_one({"id": user_id}, {"$set": {"role": "admin"}})
    return {"message": "Utilisateur promu administrateur"}

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    result = await database.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé"}

# Admin - Offers
@api_router.get("/admin/offers")
async def admin_get_offers(admin: dict = Depends(get_admin_user)):
    database = get_db()
    offers = await database.offers.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return offers

@api_router.post("/admin/offers")
async def admin_create_offer(offer_data: OfferCreate, admin: dict = Depends(get_admin_user)):
    database = get_db()
    offer = Offer(**offer_data.model_dump())
    await database.offers.insert_one(serialize_doc(offer.model_dump()))
    return {"message": "Offre créée avec succès", "id": offer.id}

@api_router.put("/admin/offers/{offer_id}")
async def admin_update_offer(offer_id: str, offer_data: OfferCreate, admin: dict = Depends(get_admin_user)):
    database = get_db()
    update_data = offer_data.model_dump()
    await database.offers.update_one({"id": offer_id}, {"$set": update_data})
    return {"message": "Offre mise à jour"}

@api_router.delete("/admin/offers/{offer_id}")
async def admin_delete_offer(offer_id: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    result = await database.offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return {"message": "Offre supprimée"}

# Admin - Universities
@api_router.get("/admin/universities")
async def admin_get_universities(admin: dict = Depends(get_admin_user)):
    database = get_db()
    universities = await database.universities.find({}, {"_id": 0}).to_list(1000)
    return universities

@api_router.post("/admin/universities")
async def admin_create_university(uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    database = get_db()
    university = University(**uni_data.model_dump())
    await database.universities.insert_one(serialize_doc(university.model_dump()))
    return {"message": "Université créée avec succès", "id": university.id}

@api_router.put("/admin/universities/{uni_id}")
async def admin_update_university(uni_id: str, uni_data: UniversityCreate, admin: dict = Depends(get_admin_user)):
    database = get_db()
    await database.universities.update_one({"id": uni_id}, {"$set": uni_data.model_dump()})
    return {"message": "Université mise à jour"}

@api_router.delete("/admin/universities/{uni_id}")
async def admin_delete_university(uni_id: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    result = await database.universities.delete_one({"id": uni_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Université non trouvée")
    return {"message": "Université supprimée"}

# Admin - Housing
@api_router.get("/admin/housing")
async def admin_get_housing(admin: dict = Depends(get_admin_user)):
    database = get_db()
    housing = await database.housing.find({}, {"_id": 0}).to_list(1000)
    return housing

@api_router.post("/admin/housing")
async def admin_create_housing(housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    database = get_db()
    housing = Housing(**housing_data.model_dump())
    await database.housing.insert_one(serialize_doc(housing.model_dump()))
    return {"message": "Logement créé avec succès", "id": housing.id}

@api_router.put("/admin/housing/{housing_id}")
async def admin_update_housing(housing_id: str, housing_data: HousingCreate, admin: dict = Depends(get_admin_user)):
    database = get_db()
    await database.housing.update_one({"id": housing_id}, {"$set": housing_data.model_dump()})
    return {"message": "Logement mis à jour"}

@api_router.delete("/admin/housing/{housing_id}")
async def admin_delete_housing(housing_id: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    result = await database.housing.delete_one({"id": housing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Logement non trouvé")
    return {"message": "Logement supprimé"}

# Admin - Messages
@api_router.get("/admin/messages")
async def admin_get_messages(admin: dict = Depends(get_admin_user)):
    database = get_db()
    messages = await database.messages.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return messages

@api_router.put("/admin/messages/{message_id}/read")
async def admin_mark_message_read(message_id: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    await database.messages.update_one({"id": message_id}, {"$set": {"isRead": True}})
    return {"message": "Marqué comme lu"}

@api_router.post("/admin/messages/{message_id}/reply")
async def admin_reply_message(message_id: str, reply: MessageReply, admin: dict = Depends(get_admin_user)):
    database = get_db()
    message = await database.messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    reply_data = {
        "content": reply.content,
        "adminName": f"{admin['firstName']} {admin['lastName']}",
        "isAdmin": True,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await database.messages.update_one(
        {"id": message_id},
        {"$push": {"replies": reply_data}, "$set": {"isRead": True}}
    )
    
    return {"message": "Réponse envoyée"}

# Admin - Applications
@api_router.get("/admin/applications")
async def admin_get_applications(admin: dict = Depends(get_admin_user)):
    database = get_db()
    applications = await database.applications.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return applications

@api_router.put("/admin/applications/{app_id}/status")
async def admin_update_application_status(app_id: str, status: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    if status not in ["pending", "reviewing", "accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    application = await database.applications.find_one({"id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    await database.applications.update_one({"id": app_id}, {"$set": {"status": status}})
    
    return {"message": f"Statut mis à jour: {status}"}

# Admin - Stats
@api_router.get("/admin/stats")
async def admin_get_stats(admin: dict = Depends(get_admin_user)):
    database = get_db()
    users_count = await database.users.count_documents({"role": "user"})
    offers_count = await database.offers.count_documents({"isActive": True})
    universities_count = await database.universities.count_documents({"isActive": True})
    housing_count = await database.housing.count_documents({"isActive": True})
    messages_count = await database.messages.count_documents({})
    unread_messages = await database.messages.count_documents({"isRead": False})
    applications_count = await database.applications.count_documents({})
    pending_applications = await database.applications.count_documents({"status": "pending"})
    
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
    database = get_db()
    existing = await database.users.find_one({"role": "admin"})
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
    
    await database.users.insert_one(admin_dict)
    return {"message": "Admin créé", "email": "admin@winners-consulting.com", "password": "Admin2025!"}

# ============= NOTIFICATIONS =============

@api_router.get("/notifications")
async def get_notifications(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    notifications = await database.notifications.find(
        {"userId": user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    await database.notifications.update_one(
        {"id": notification_id, "userId": user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marquée comme lue"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    await database.notifications.update_many(
        {"userId": user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "Toutes les notifications marquées comme lues"}

@api_router.get("/notifications/unread-count")
async def get_unread_count(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    count = await database.notifications.count_documents({"userId": user["id"], "read": False})
    return {"count": count}

# ============= CHAT =============

class ChatMessage(BaseModel):
    content: str

@api_router.post("/chat/start")
async def start_chat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    
    existing = await database.chats.find_one({"userId": user["id"], "status": "active"}, {"_id": 0})
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
    await database.chats.insert_one(chat)
    
    return {k: v for k, v in chat.items() if k != "_id"}

@api_router.get("/chat/me")
async def get_my_chat(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    chat = await database.chats.find_one({"userId": user["id"], "status": "active"}, {"_id": 0})
    return chat

@api_router.post("/chat/{chat_id}/message")
async def send_chat_message(chat_id: str, message: ChatMessage, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    
    chat = await database.chats.find_one({"id": chat_id})
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
    
    await database.chats.update_one(
        {"id": chat_id},
        {"$push": {"messages": msg}, "$set": {"lastMessageAt": msg["timestamp"]}}
    )
    
    return msg

@api_router.get("/chat/{chat_id}/messages")
async def get_chat_messages(chat_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    
    chat = await database.chats.find_one({"id": chat_id}, {"_id": 0})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")
    
    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return chat.get("messages", [])

@api_router.put("/chat/{chat_id}/close")
async def close_chat(chat_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    database = get_db()
    
    chat = await database.chats.find_one({"id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat non trouvé")
    
    if chat["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    await database.chats.update_one({"id": chat_id}, {"$set": {"status": "closed"}})
    return {"message": "Chat fermé"}

@api_router.get("/admin/chats")
async def admin_get_chats(admin: dict = Depends(get_admin_user)):
    database = get_db()
    chats = await database.chats.find({"status": "active"}, {"_id": 0}).sort("lastMessageAt", -1).to_list(50)
    return chats

@api_router.get("/admin/chats/all")
async def admin_get_all_chats(admin: dict = Depends(get_admin_user)):
    database = get_db()
    chats = await database.chats.find({}, {"_id": 0}).sort("lastMessageAt", -1).to_list(100)
    return chats

# ============= PASSWORD RESET =============

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    newPassword: str

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


@api_router.post("/auth/password-reset-request")
async def request_password_reset(request: PasswordResetRequest):
    database = get_db()
    user = await database.users.find_one({"email": request.email})
    if not user:
        return {"message": "Si cet email existe, un lien de réinitialisation sera envoyé"}
    
    reset_token = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await database.password_resets.insert_one({
        "token": reset_token,
        "userId": user["id"],
        "email": request.email,
        "expiresAt": expires.isoformat(),
        "used": False
    })
    
    return {
        "message": "Si cet email existe, un lien de réinitialisation sera envoyé",
        "dev_token": reset_token
    }

@api_router.get("/auth/password-reset-verify/{token}")
async def verify_reset_token(token: str):
    database = get_db()
    reset = await database.password_resets.find_one({"token": token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    
    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expiré")
    
    return {"valid": True, "email": reset["email"]}

@api_router.post("/auth/password-reset")
async def reset_password(request: PasswordResetConfirm):
    database = get_db()
    reset = await database.password_resets.find_one({"token": request.token, "used": False})
    if not reset:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    
    expires = datetime.fromisoformat(reset["expiresAt"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expiré")
    
    hashed = hash_password(request.newPassword)
    await database.users.update_one({"id": reset["userId"]}, {"$set": {"password": hashed}})
    
    await database.password_resets.update_one({"token": request.token}, {"$set": {"used": True}})
    

# ============= PAYMENT SETTINGS ROUTES =============

@api_router.get("/admin/payment-settings")
async def get_payment_settings(admin: dict = Depends(get_admin_user)):
    database = get_db()
    settings = await database.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        default = PaymentSettings()
        return default.model_dump()
    return settings

@api_router.post("/admin/payment-settings")
async def update_payment_settings(settings: PaymentSettings, admin: dict = Depends(get_admin_user)):
    database = get_db()
    settings_dict = settings.model_dump()
    await database.payment_settings.update_one(
        {"id": "payment_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    return {"message": "Paramètres de paiement mis à jour"}

# Public endpoint to get payment settings (for users during application)
@api_router.get("/payment-settings")
async def get_public_payment_settings():
    database = get_db()
    settings = await database.payment_settings.find_one({"id": "payment_settings"}, {"_id": 0})
    if not settings:
        default = PaymentSettings()
        return default.model_dump()
    return settings


# ============= FILE UPLOAD WITH CLOUDINARY =============
import cloudinary
import cloudinary.uploader
from io import BytesIO

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

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
    """
    Upload a file to Cloudinary and return the URL
    Works in production (Vercel) and local environments
    """
    try:
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            BytesIO(contents),
            folder="winners_consulting",  # Organize files in a folder
            resource_type="auto",  # Automatically detect file type (image, pdf, etc.)
            use_filename=True,
            unique_filename=True
        )
        
        # Return the secure URL
        return {
            "url": upload_result['secure_url'],
            "filename": file.filename,
            "public_id": upload_result['public_id'],
            "format": upload_result.get('format', ''),
            "size": upload_result.get('bytes', 0)
        }
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du téléchargement: {str(e)}")

    return {"message": "Mot de passe mis à jour avec succès"}

# ============= NEWSLETTER =============

class NewsletterSubscribe(BaseModel):
    email: EmailStr

@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(data: NewsletterSubscribe):
    database = get_db()
    existing = await database.newsletter.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà inscrit à la newsletter")
    await database.newsletter.insert_one({
        "email": data.email,
        "subscribedAt": datetime.now(timezone.utc).isoformat(),
    })
    return {"message": "Inscription à la newsletter réussie"}

@api_router.get("/admin/newsletter")
async def admin_get_newsletter(admin: dict = Depends(get_admin_user)):
    database = get_db()
    subscribers = await database.newsletter.find({}, {"_id": 0}).sort("subscribedAt", -1).to_list(5000)
    return subscribers

@api_router.delete("/admin/newsletter/{email}")
async def admin_delete_newsletter(email: str, admin: dict = Depends(get_admin_user)):
    database = get_db()
    result = await database.newsletter.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Abonné non trouvé")
    return {"message": "Abonné supprimé"}

# Include the router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Vercel handler - FastAPI natively supported by Vercel
# No need for Mangum adapter
app = app
