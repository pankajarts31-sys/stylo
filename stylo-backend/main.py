from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.stylist import router as stylist_router
from app.api.auth import router as auth_router
from app.api.feed import router as feed_router, SEED_ITEMS
from app.api.visual_search import router as visual_search_router
from app.core.config import get_settings
from app.core.database import engine, Base
from app.core.mongo import get_trend_collection
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # PostgreSQL / SQLite tables
    Base.metadata.create_all(bind=engine)

    # Auto-seed MongoDB trends on startup if empty
    col = await get_trend_collection()
    if await col.count_documents({}) == 0:
        await col.insert_many(SEED_ITEMS)

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


@app.get("/health")
def health() -> dict:
    db_type = "sqlite" if settings.database_url.startswith("sqlite") else "postgresql"
    return {"status": "ok", "env": settings.app_env, "db": db_type, "version": "0.4.0"}
