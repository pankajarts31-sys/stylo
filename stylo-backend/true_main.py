import os as _os
from pathlib import Path as _Path
_env_path = _Path(__file__).resolve().parent / ".env"
if _env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(_env_path)  # Local dev only — Railway injects env vars natively

# FIX FOR JIO NETWORK (local dev only): Force IPv4 resolution for outgoing requests.
# Jio's IPv6 routing often hangs when connecting to Google APIs or SerpApi.
# On Railway/production this patch is SKIPPED because Docker may use IPv6 internally.
import socket as _socket
_app_env = _os.environ.get("APP_ENV", "development")
if _app_env != "production":
    _old_getaddrinfo = _socket.getaddrinfo
    def _patched_getaddrinfo(*args, **kwargs):
        responses = _old_getaddrinfo(*args, **kwargs)
        ipv4_only = [r for r in responses if r[0] == _socket.AF_INET]
        return ipv4_only if ipv4_only else responses  # fallback if no IPv4
    _socket.getaddrinfo = _patched_getaddrinfo

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.stylist import router as stylist_router
from app.api.auth import router as auth_router
from app.api.feed import router as feed_router
from app.api.visual_search import router as visual_search_router
from app.api.search import router as search_router
from app.api.saved import router as saved_router
from app.api.deals import router as deals_router
from app.api.collab import router as collab_router
from app.core.config import get_settings
from app.core.database import engine, Base

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # PostgreSQL / SQLite tables
    try:
        from app.models.saved_item import SavedItem  # noqa: F401
        from app.models.collaboration import Collaboration  # noqa: F401
        Base.metadata.create_all(bind=engine)
    except Exception:
        logger.critical(
            "DB Connection Failed. The app will start but DB queries will fail.",
            exc_info=True,
        )
    yield


app = FastAPI(
    title="STYLO API",
    description="Virtual Fashion Universe — AI Stylist, Feed & Deal Engine",
    version="0.4.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(stylist_router)
app.include_router(feed_router)
app.include_router(visual_search_router)
app.include_router(search_router)
app.include_router(saved_router)
app.include_router(deals_router)
app.include_router(collab_router)


@app.get("/health")
def health() -> dict:
    db_type = "sqlite" if settings.database_url.startswith("sqlite") else "postgresql"
    return {"status": "ok", "env": settings.app_env, "db": db_type, "version": "0.4.0"}
