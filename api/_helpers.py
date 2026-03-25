from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import jwt
import uuid
import os
import asyncio
import random
import logging

logger = logging.getLogger(__name__)

# ============= EMAIL (RESEND) =============

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')


def _init_resend():
    if RESEND_API_KEY:
        import resend
        resend.api_key = RESEND_API_KEY
        return resend
    return None


async def send_email(to_email: str, subject: str, html: str):
    resend_mod = _init_resend()
    if not resend_mod:
        logger.warning(f"Resend not configured, email to {to_email} skipped")
        return None
    try:
        params = {"from": SENDER_EMAIL, "to": [to_email], "subject": subject, "html": html}
        result = await asyncio.to_thread(resend_mod.Emails.send, params)
        logger.info(f"Email sent to {to_email}: {result}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return None


def generate_verification_code():
    return str(random.randint(100000, 999999))


async def send_verification_email(email: str, code: str):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1e3a5f,#2a5298);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">AccessHub Global</h1>
      </div>
      <div style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
        <h2 style="color:#1e3a5f;margin:0 0 8px;font-size:18px;">Verification de votre email</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Utilisez le code ci-dessous pour verifier votre adresse email :</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e3a5f;">{code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:0;">Ce code expire dans 15 minutes.</p>
      </div>
    </div>
    """
    return await send_email(email, f"Code de verification: {code}", html)


async def send_password_reset_email(email: str, code: str):
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1e3a5f,#2a5298);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">AccessHub Global</h1>
      </div>
      <div style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
        <h2 style="color:#1e3a5f;margin:0 0 8px;font-size:18px;">Reinitialisation du mot de passe</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Vous avez demande la reinitialisation de votre mot de passe. Voici votre code :</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e3a5f;">{code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:0;">Ce code expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    </div>
    """
    return await send_email(email, f"Reinitialisation mot de passe: {code}", html)

# ============= DATABASE =============

_client = None
_db = None


def init_db(mongo_url: str, db_name: str):
    global _client, _db
    _client = AsyncIOMotorClient(mongo_url)
    _db = _client[db_name]


def get_db():
    return _db


def close_db():
    global _client
    if _client:
        _client.close()


# ============= SECURITY =============

SECRET_KEY = os.environ.get('JWT_SECRET', 'winners-consulting-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ============= NOTIFICATION HOOKS (for WebSocket in local env) =============

_on_notification = None
_on_admin_broadcast = None


def register_hooks(on_notification=None, on_admin_broadcast=None):
    global _on_notification, _on_admin_broadcast
    if on_notification is not None:
        _on_notification = on_notification
    if on_admin_broadcast is not None:
        _on_admin_broadcast = on_admin_broadcast


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

        db = get_db()
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")

        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except (jwt.PyJWTError, jwt.InvalidTokenError, Exception):
        raise HTTPException(status_code=401, detail="Token invalide")


async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("admin", "admin_principal", "admin_secondary"):
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return current_user


async def get_principal_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("admin", "admin_principal"):
        raise HTTPException(status_code=403, detail="Accès admin principal requis")
    return current_user


async def get_agent_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "agent":
        raise HTTPException(status_code=403, detail="Accès agent requis")
    if not current_user.get("isApproved", False):
        raise HTTPException(status_code=403, detail="Votre compte agent est en attente d'approbation")
    return current_user


def serialize_doc(doc: dict) -> dict:
    if doc.get('createdAt') and isinstance(doc['createdAt'], datetime):
        doc['createdAt'] = doc['createdAt'].isoformat()
    return doc


async def send_notification(user_id: str, notification_type: str, title: str, message: str, data: dict = None):
    db = get_db()
    notification = {
        "id": str(uuid.uuid4()),
        "type": notification_type,
        "title": title,
        "message": message,
        "data": data or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    await db.notifications.insert_one({**notification, "userId": user_id})
    if _on_notification:
        await _on_notification(user_id, notification)
    return notification


async def broadcast_to_admins(message: dict):
    if _on_admin_broadcast:
        await _on_admin_broadcast(message)
