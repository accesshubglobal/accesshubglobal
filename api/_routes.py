"""
AccessHub Global — API Router Aggregator

This file is the entry point imported by server.py.
All route logic is split into focused sub-modules under routers/:

  routers/auth.py      — Authentication (register, login, password-reset, agent auth, partner auth)
  routers/public.py    — Public & user-facing routes (offers, universities, upload, chat, FAQ, pages…)
  routers/admin.py     — Admin CRUD (users, offers, universities, blog, newsletter, agents, pages…)
  routers/agent.py     — Agent dashboard & management
  routers/partner.py   — Partner dashboard, codes & messaging
"""

from fastapi import APIRouter
from routers.auth import router as auth_router
from routers.public import router as public_router
from routers.admin import router as admin_router
from routers.agent import router as agent_router
from routers.partner import router as partner_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(public_router)
api_router.include_router(admin_router)
api_router.include_router(agent_router)
api_router.include_router(partner_router)
