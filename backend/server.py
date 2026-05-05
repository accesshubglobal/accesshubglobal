import sys
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables FIRST (before shared modules read them)
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Add api/ directory to import path for shared modules
sys.path.insert(0, str(ROOT_DIR.parent / 'api'))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from typing import Dict
import jwt

from _helpers import init_db, close_db, get_db, register_hooks, SECRET_KEY, ALGORITHM, start_inactivity_purge
from _routes import api_router

# Initialize database
init_db(os.environ['MONGO_URL'], os.environ['DB_NAME'])

# Create app
app = FastAPI()
app.include_router(api_router, prefix="/api")

# ============= LOCAL-ONLY: FILE SERVING =============

@app.get("/api/files/{filename}")
async def get_file(filename: str):
    file_path = f"/app/uploads/{filename}"
    if not os.path.exists(file_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    return FileResponse(file_path)

# ============= WEBSOCKET: NOTIFICATIONS =============

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
        db = get_db()
        admin_users = await db.users.find({"role": "admin"}).to_list(100)
        for admin in admin_users:
            admin_id = admin.get("id")
            if admin_id in self.active_connections:
                try:
                    await self.active_connections[admin_id].send_json(message)
                except Exception:
                    self.disconnect(admin_id)

manager = ConnectionManager()

# ============= WEBSOCKET: LIVE CHAT =============

class ChatManager:
    def __init__(self):
        self.chat_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.user_chats: Dict[str, str] = {}

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

# ============= REGISTER WEBSOCKET HOOKS =============

async def on_notification(user_id: str, notification: dict):
    await manager.send_personal_notification(user_id, notification)

async def on_admin_broadcast(message: dict):
    await manager.broadcast_to_admins(message)

register_hooks(on_notification=on_notification, on_admin_broadcast=on_admin_broadcast)

# ============= WEBSOCKET ENDPOINTS =============

@app.websocket("/ws/notifications/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return

        await manager.connect(websocket, user_id)

        await websocket.send_json({
            "type": "connected",
            "message": "Notifications connectées"
        })

        try:
            while True:
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
        except WebSocketDisconnect:
            manager.disconnect(user_id)
    except jwt.ExpiredSignatureError:
        await websocket.close(code=4002)
    except jwt.JWTError:
        await websocket.close(code=4003)


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

# ============= MIDDLEWARE =============

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= LOGGING =============

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Schedule daily purge of inactive accounts (>7 months)
    start_inactivity_purge()


@app.on_event("shutdown")
async def shutdown_db_client():
    close_db()
