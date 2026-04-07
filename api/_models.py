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
    emailVerified: Optional[bool] = None


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
    province: Optional[str] = None
    country: str
    countryCode: str
    status: Optional[str] = "public"
    image: Optional[str] = None
    coverImage: Optional[str] = None
    logo: Optional[str] = None
    ranking: Optional[str] = None
    badges: List[str] = []
    youtubeUrl: Optional[str] = None
    description: Optional[str] = None
    foundedYear: Optional[str] = None
    president: Optional[str] = None
    totalStudents: Optional[str] = None
    internationalStudents: Optional[str] = None
    website: Optional[str] = None
    faculties: List[str] = []
    conditions: List[str] = []
    photos: List[str] = []


class University(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    city: str
    province: Optional[str] = None
    country: str
    countryCode: str
    status: Optional[str] = "public"
    image: Optional[str] = None
    coverImage: Optional[str] = None
    logo: Optional[str] = None
    ranking: Optional[str] = None
    badges: List[str] = []
    youtubeUrl: Optional[str] = None
    description: Optional[str] = None
    foundedYear: Optional[str] = None
    president: Optional[str] = None
    totalStudents: Optional[str] = None
    internationalStudents: Optional[str] = None
    website: Optional[str] = None
    faculties: List[str] = []
    conditions: List[str] = []
    photos: List[str] = []
    views: int = 0
    likes: int = 0
    rating: float = 0
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
    # --- Personal Information ---
    firstName: str = ""
    lastName: str = ""
    nationality: str = ""
    sex: str = ""
    countryOfBirth: str = ""
    placeOfBirth: str = ""
    nativeLanguage: str = ""
    religion: str = ""
    maritalStatus: str = ""
    occupation: str = ""
    hobby: str = ""
    highestEducation: str = ""
    majorInChina: str = ""
    currentEmployer: str = ""
    personalEmail: str = ""
    dateOfBirth: str = ""
    phoneNumber: str = ""
    # --- Home/Permanent Address ---
    address: str = ""
    addressDetailed: str = ""
    addressPhone: str = ""
    zipCode: str = ""
    # --- Current Address if different ---
    currentAddress: str = ""
    currentAddressDetailed: str = ""
    currentAddressPhone: str = ""
    currentAddressZipCode: str = ""
    # --- Health Status ---
    bloodGroup: str = ""
    height: str = ""
    weight: str = ""
    # --- Whether in China Now ---
    inChinaNow: bool = False
    chinaSchool: str = ""
    chinaLearningPeriodStart: str = ""
    chinaLearningPeriodEnd: str = ""
    chinaVisaType: str = ""
    chinaVisaNo: str = ""
    chinaVisaExpiry: str = ""
    # --- Passport Information ---
    passportNumber: str = ""
    passportIssuedDate: str = ""
    passportExpiryDate: str = ""
    oldPassportNo: str = ""
    oldPassportIssuedDate: str = ""
    oldPassportExpiryDate: str = ""
    # --- Educational Background (last 3 schools) ---
    educationalBackground: List[dict] = []
    # --- Work Experience ---
    workExperience: List[dict] = []
    # --- Family Information ---
    fatherInfo: dict = {}
    motherInfo: dict = {}
    spouseInfo: dict = {}
    # --- Financial Sponsor ---
    financialSponsor: dict = {}
    # --- Emergency Contact in China ---
    emergencyContact: dict = {}
    # --- Application fields ---
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
    # Required personal info
    firstName: str
    lastName: str
    nationality: str
    sex: str
    passportNumber: str
    dateOfBirth: str
    phoneNumber: str
    address: str
    # Optional personal info
    countryOfBirth: Optional[str] = ""
    placeOfBirth: Optional[str] = ""
    nativeLanguage: Optional[str] = ""
    religion: Optional[str] = ""
    maritalStatus: Optional[str] = ""
    occupation: Optional[str] = ""
    hobby: Optional[str] = ""
    highestEducation: Optional[str] = ""
    majorInChina: Optional[str] = ""
    currentEmployer: Optional[str] = ""
    personalEmail: Optional[str] = ""
    addressDetailed: Optional[str] = ""
    addressPhone: Optional[str] = ""
    zipCode: Optional[str] = ""
    currentAddress: Optional[str] = ""
    currentAddressDetailed: Optional[str] = ""
    currentAddressPhone: Optional[str] = ""
    currentAddressZipCode: Optional[str] = ""
    # Health
    bloodGroup: Optional[str] = ""
    height: Optional[str] = ""
    weight: Optional[str] = ""
    # China
    inChinaNow: Optional[bool] = False
    chinaSchool: Optional[str] = ""
    chinaLearningPeriodStart: Optional[str] = ""
    chinaLearningPeriodEnd: Optional[str] = ""
    chinaVisaType: Optional[str] = ""
    chinaVisaNo: Optional[str] = ""
    chinaVisaExpiry: Optional[str] = ""
    # Passport
    passportIssuedDate: Optional[str] = ""
    passportExpiryDate: Optional[str] = ""
    oldPassportNo: Optional[str] = ""
    oldPassportIssuedDate: Optional[str] = ""
    oldPassportExpiryDate: Optional[str] = ""
    # Education & Work
    educationalBackground: Optional[List[dict]] = []
    workExperience: Optional[List[dict]] = []
    # Family
    fatherInfo: Optional[dict] = {}
    motherInfo: Optional[dict] = {}
    spouseInfo: Optional[dict] = {}
    financialSponsor: Optional[dict] = {}
    emergencyContact: Optional[dict] = {}
    # Application
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
    paypalEmail: str = "payments@accesshubglobal.com"
    bankName: str = "Bank of China"
    bankAccountName: str = "AccessHub Global Ltd"
    bankAccountNumber: str = "6222 0000 1234 5678 9012"
    bankSwiftCode: str = "BKCHCNBJ"
    bankIban: str = ""
    termsConditions: List[dict] = [
        {"title": "Engagement du candidat", "content": "En soumettant cette candidature, je certifie que toutes les informations fournies sont exactes et complètes. Je comprends que toute fausse déclaration peut entraîner le rejet de ma candidature ou l'annulation de mon inscription."},
        {"title": "Frais de dossier", "content": "Les frais de dossier ne sont pas remboursables, quelle que soit l'issue de la candidature."},
        {"title": "Traitement des données", "content": "J'accepte que mes données personnelles soient traitées par AccessHub Global dans le cadre de ma candidature et partagées avec l'université concernée."},
        {"title": "Délais de traitement", "content": "Je comprends que le traitement de ma candidature peut prendre plusieurs semaines et que AccessHub Global me tiendra informé de l'avancement par email."},
        {"title": "Responsabilité", "content": "AccessHub Global agit en tant qu'intermédiaire et ne garantit pas l'acceptation de ma candidature par l'université."}
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


# ============= PARTNER MODELS =============

class PartnerRegister(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    activationCode: str


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
    # Core
    firstName: str
    lastName: str
    email: EmailStr
    phone: Optional[str] = None
    # Personal
    sex: Optional[str] = ""
    dateOfBirth: Optional[str] = ""
    nationality: Optional[str] = ""
    countryOfBirth: Optional[str] = ""
    placeOfBirth: Optional[str] = ""
    nativeLanguage: Optional[str] = ""
    religion: Optional[str] = ""
    maritalStatus: Optional[str] = ""
    occupation: Optional[str] = ""
    hobby: Optional[str] = ""
    highestEducation: Optional[str] = ""
    majorInChina: Optional[str] = ""
    currentEmployer: Optional[str] = ""
    personalEmail: Optional[str] = ""
    # Address
    address: Optional[str] = ""
    addressDetailed: Optional[str] = ""
    addressPhone: Optional[str] = ""
    zipCode: Optional[str] = ""
    currentAddress: Optional[str] = ""
    currentAddressDetailed: Optional[str] = ""
    currentAddressPhone: Optional[str] = ""
    currentAddressZipCode: Optional[str] = ""
    # Health
    bloodGroup: Optional[str] = ""
    height: Optional[str] = ""
    weight: Optional[str] = ""
    # China
    inChinaNow: Optional[bool] = False
    chinaSchool: Optional[str] = ""
    chinaLearningPeriodStart: Optional[str] = ""
    chinaLearningPeriodEnd: Optional[str] = ""
    chinaVisaType: Optional[str] = ""
    chinaVisaNo: Optional[str] = ""
    chinaVisaExpiry: Optional[str] = ""
    # Passport
    passportNumber: Optional[str] = ""
    passportIssuedDate: Optional[str] = ""
    passportExpiryDate: Optional[str] = ""
    oldPassportNo: Optional[str] = ""
    oldPassportIssuedDate: Optional[str] = ""
    oldPassportExpiryDate: Optional[str] = ""
    # Education / Work / Family
    educationalBackground: Optional[List[dict]] = []
    workExperience: Optional[List[dict]] = []
    fatherInfo: Optional[dict] = {}
    motherInfo: Optional[dict] = {}
    spouseInfo: Optional[dict] = {}
    financialSponsor: Optional[dict] = {}
    emergencyContact: Optional[dict] = {}


class AgentStudentUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    sex: Optional[str] = None
    dateOfBirth: Optional[str] = None
    nationality: Optional[str] = None
    countryOfBirth: Optional[str] = None
    placeOfBirth: Optional[str] = None
    nativeLanguage: Optional[str] = None
    religion: Optional[str] = None
    maritalStatus: Optional[str] = None
    occupation: Optional[str] = None
    hobby: Optional[str] = None
    highestEducation: Optional[str] = None
    majorInChina: Optional[str] = None
    currentEmployer: Optional[str] = None
    personalEmail: Optional[str] = None
    address: Optional[str] = None
    addressDetailed: Optional[str] = None
    addressPhone: Optional[str] = None
    zipCode: Optional[str] = None
    currentAddress: Optional[str] = None
    currentAddressDetailed: Optional[str] = None
    currentAddressPhone: Optional[str] = None
    currentAddressZipCode: Optional[str] = None
    bloodGroup: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    inChinaNow: Optional[bool] = None
    chinaSchool: Optional[str] = None
    chinaLearningPeriodStart: Optional[str] = None
    chinaLearningPeriodEnd: Optional[str] = None
    chinaVisaType: Optional[str] = None
    chinaVisaNo: Optional[str] = None
    chinaVisaExpiry: Optional[str] = None
    passportNumber: Optional[str] = None
    passportIssuedDate: Optional[str] = None
    passportExpiryDate: Optional[str] = None
    oldPassportNo: Optional[str] = None
    oldPassportIssuedDate: Optional[str] = None
    oldPassportExpiryDate: Optional[str] = None
    educationalBackground: Optional[List[dict]] = None
    workExperience: Optional[List[dict]] = None
    fatherInfo: Optional[dict] = None
    motherInfo: Optional[dict] = None
    spouseInfo: Optional[dict] = None
    financialSponsor: Optional[dict] = None
    emergencyContact: Optional[dict] = None


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



# ============= EMPLOYER MODELS =============

class EmployerRegister(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    phone: Optional[str] = None
    company: str
    activationCode: str


class EmployerCompanyUpdate(BaseModel):
    companyName: str
    sector: str
    description: str
    website: Optional[str] = None
    address: str
    city: str
    country: str
    phone: str
    email: str
    logoUrl: Optional[str] = None
    coverUrl: Optional[str] = None
    officialDocumentUrl: Optional[str] = None
    foundedYear: Optional[str] = None
    employeeCount: Optional[str] = None
    socialLinkedIn: Optional[str] = None
    socialTwitter: Optional[str] = None


class JobOfferCreate(BaseModel):
    title: str
    sector: str
    contractType: str
    location: str
    country: str
    companyName: Optional[str] = None
    salary: Optional[str] = None
    salaryMin: Optional[float] = None
    salaryMax: Optional[float] = None
    currency: str = "EUR"
    description: str
    missions: List[str] = []
    requiredProfile: str
    requiredSkills: List[str] = []
    educationLevel: str
    experienceRequired: str
    benefits: List[str] = []
    deadline: Optional[str] = None
    startDate: Optional[str] = None
    numberOfPositions: int = 1
    languages: List[str] = []
    remote: str = "Non"
    # New enriched fields
    whyJoinUs: Optional[str] = None
    workMode: str = "Présentiel"
    workHours: Optional[str] = None
    workDays: Optional[str] = None
    contractDuration: Optional[str] = None
    conditions: Optional[str] = None
    positionType: str = "Temps plein"


class JobApplicationCreate(BaseModel):
    jobOfferId: str
    coverLetter: str
    cvUrl: str
    portfolioUrl: Optional[str] = None
    linkedinUrl: Optional[str] = None
    availableFrom: Optional[str] = None
    expectedSalary: Optional[str] = None


# ============= FEATURED COMPANY MODELS =============

class FeaturedCompanyCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    logo: Optional[str] = ""
    coverUrl: Optional[str] = ""
    website: Optional[str] = ""
    sector: Optional[str] = ""
    city: Optional[str] = ""
    country: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    isMain: bool = False
    isActive: bool = True


# ============= LOGEMENT PARTNER MODELS =============

class LogementPartnerRegister(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str
    phone: Optional[str] = ""
    companyName: Optional[str] = ""
    companyDoc: Optional[str] = ""

class LogementPropertyCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    propertyType: str = "Appartement"
    city: str
    country: Optional[str] = ""
    address: Optional[str] = ""
    price: float
    pricePeriod: Optional[str] = "mois"
    surface: Optional[int] = 0
    rooms: Optional[int] = 1
    amenities: Optional[List[str]] = []
    images: Optional[List[str]] = []
    availableFrom: Optional[str] = ""
    isAvailable: bool = True
