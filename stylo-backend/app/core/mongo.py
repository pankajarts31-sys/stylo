"""
MongoDB client setup.

- Local dev (no MONGODB_URL or MONGODB_URL=mock://):
    Uses mongomock-motor (in-memory, no server required).
- Production (Railway / Atlas):
    Uses real Motor async client via MONGODB_URL.
"""
from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

from app.core.config import get_settings

_client: AsyncIOMotorClient | None = None
_mock_client = None
DB_NAME = "stylodb"


def _is_mock() -> bool:
    url = get_settings().mongodb_url
    return not url or url.startswith("mock://") or url == "mongodb://localhost:27017"


async def get_mongo_client() -> AsyncIOMotorClient:
    global _client, _mock_client

    if _is_mock():
        if _mock_client is None:
            from mongomock_motor import AsyncMongoMockClient  # type: ignore
            _mock_client = AsyncMongoMockClient()
        return _mock_client

    if _client is None:
        _client = AsyncIOMotorClient(get_settings().mongodb_url)
    return _client


async def get_trend_collection() -> AsyncIOMotorCollection:
    client = await get_mongo_client()
    return client[DB_NAME]["trends"]
