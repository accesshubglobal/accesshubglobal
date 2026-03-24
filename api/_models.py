from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


# ============= USER MODELS =============

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
    isApproved: Optional[bool] = None
    company: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============= OFFER MODELS =============

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


# ============= UNIVERSITY MODELS =============

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


# ============= HOUSING MODELS =============

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


# ============= MESSAGE MODELS =============

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


# ============= APPLICATION MODELS =============

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


FullApplicationCreate = ApplicationCreate


# ============= PAYMENT SETTINGS =============

class PaymentSettings(BaseModel):
    id: str = "payment_settings"
    wechatQrCode: str = ""
    alipayQrCode: str = ""
    paypalEmail: str = "payments@winners-consulting.com"
    bankName: str = "Bank of China"
    bankAccountName: str = "Winner's Consulting Ltd"
    bankAccountNumber: str = "6222 0000 1234 5678 9012"
    bankSwiftCode: str = "BKCHCNBJ"
    bankIban: str = ""
    termsConditions: List[dict] = [
        {"title": "Engagement du candidat", "content": "En soumettant cette candidature, je certifie que toutes les informations fournies sont exactes et complètes. Je comprends que toute fausse déclaration peut entraîner le rejet de ma candidature ou l'annulation de mon inscription."},
        {"title": "Frais de dossier", "content": "Les frais de dossier ne sont pas remboursables, quelle que soit l'issue de la candidature."},
        {"title": "Traitement des données", "content": "J'accepte que mes données personnelles soient traitées par Winner's Consulting dans le cadre de ma candidature et partagées avec l'université concernée."},
        {"title": "Délais de traitement", "content": "Je comprends que le traitement de ma candidature peut prendre plusieurs semaines et que Winner's Consulting me tiendra informé de l'avancement par email."},
        {"title": "Responsabilité", "content": "Winner's Consulting agit en tant qu'intermédiaire et ne garantit pas l'acceptation de ma candidature par l'université."}
    ]


# ============= CHAT =============

class ChatMessage(BaseModel):
    content: str


# ============= NEWSLETTER =============

class NewsletterSubscribe(BaseModel):
    email: EmailStr


# ============= PASSWORD RESET =============

class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    newPassword: str


# ============= BANNER SLIDES =============

class BannerSlide(BaseModel):
    id: str
    image: str
    title: str = ""
    subtitle: str = ""


class BannerSlidesUpdate(BaseModel):
    slides: List[BannerSlide]


# ============= TESTIMONIALS =============

class TestimonialCreate(BaseModel):
    text: str
    program: str
    rating: int = 5


class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str = ""
    userName: str = ""
    userCountry: str = ""
    userImage: str = ""
    text: str
    program: str
    rating: int = 5
    status: str = "pending"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============= CONTACT FORM =============

class ContactFormCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    service: Optional[str] = ""
    message: str


# ============= FAQ =============

class FAQItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str


class FAQListUpdate(BaseModel):
    faqs: List[FAQItem]


# ============= DOCUMENT UPDATE =============

class DocumentUpdate(BaseModel):
    documents: list


# ============= BLOG MODELS =============

class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str = ""
    coverImage: str = ""
    category: str = "general"
    tags: List[str] = []
    published: bool = False


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    coverImage: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None


# ============= COMMUNITY MODELS =============

class CommunityPostCreate(BaseModel):
    title: str
    content: str
    category: str = "general"


class CommunityReplyCreate(BaseModel):
    content: str


# ============= AGENT MODELS =============

class AgentRegister(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    company: Optional[str] = None
    activationCode: str


class AgentStudentCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: Optional[str] = None
    dateOfBirth: Optional[str] = None
    nationality: Optional[str] = None
    sex: Optional[str] = None
    passportNumber: Optional[str] = None
    address: Optional[str] = None


class AgentStudentUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    dateOfBirth: Optional[str] = None
    nationality: Optional[str] = None
    sex: Optional[str] = None
    passportNumber: Optional[str] = None
    address: Optional[str] = None


class AgentApplicationCreate(BaseModel):
    studentId: str
    offerId: str
    offerTitle: str
    documents: List[dict] = []
    additionalPrograms: List[str] = []
    paymentMethod: str = ""
    paymentProof: str = ""
    paymentAmount: float = 0
    termsAccepted: bool = False
