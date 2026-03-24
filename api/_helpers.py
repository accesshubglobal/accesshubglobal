from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import jwt
import uuid
import os

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
