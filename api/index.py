import sys
import os
import logging

# Ensure shared modules are importable
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from _helpers import init_db
from _routes import api_router

# Initialize database from Vercel environment variables
mongo_url = os.environ.get('MONGO_URL', '')
db_name = os.environ.get('DB_NAME', 'winnersconsulting')

if mongo_url:
    init_db(mongo_url, db_name)

# Create the Vercel app with root_path="/api"
app = FastAPI(root_path="/api")
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
