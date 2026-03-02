import os as _os
if _os.path.exists(".env"):
    from dotenv import load_dotenv
    load_dotenv()  # Local dev only — Railway injects env vars natively


from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.stylist import router as stylist_router
from app.api.auth import router as auth_router
from app.api.feed import router as feed_router
from app.api.visual_search import router as visual_search_router
from app.api.search import router as search_router
from app.api.saved import router as saved_router
from app.core.config import get_settings
from app.core.database import engine, Base

settings = get_settings()

import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    # PostgreSQL / SQLite tables
    try:
        from app.models.saved_item import SavedItem
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"CRITICAL BOOT ERROR: DB Connection Failed. The app will start but DB queries will fail.\n{traceback.format_exc()}")
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


@app.get("/health")
def health() -> dict:
    db_type = "sqlite" if settings.database_url.startswith("sqlite") else "postgresql"
    return {"status": "ok", "env": settings.app_env, "db": db_type, "version": "0.4.0"}
