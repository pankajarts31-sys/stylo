"""
/api/feed — Trending Feed endpoints backed by MongoDB.

GET  /api/feed        — paginated, filterable, sortable trend items
POST /api/feed/seed   — (dev only) seed the DB with starter items
"""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.mongo import get_trend_collection

router = APIRouter(prefix="/api/feed", tags=["feed"])

# ── Seed data (mirrors the frontend FEED_DATA) ────────────────────────────────
SEED_ITEMS = [
    {"_id": "1", "title": "Linen Midi Wrap Dress", "brand": "& Other Stories", "category": "Dresses", "tags": ["summer", "elegant", "boho"], "price": 89, "currency": "USD", "imageGradient": "linear-gradient(135deg, #ffecd2, #fcb69f)", "imageEmoji": "👗", "likes": 4821, "saves": 1203, "trending": True, "heat": "🔥", "reviewCount": 384},
    {"_id": "2", "title": "Oversized Wool Trench", "brand": "Totême", "category": "Outerwear", "tags": ["autumn", "classic", "editorial"], "price": 395, "currency": "USD", "imageGradient": "linear-gradient(135deg, #d4b896, #a08060)", "imageEmoji": "🧥", "likes": 6340, "saves": 2150, "trending": True, "heat": "🔥", "reviewCount": 520},
    {"_id": "3", "title": "Cargo Wide-Leg Trousers", "brand": "Zara", "category": "Streetwear", "tags": ["casual", "Y2K", "trendy"], "price": 49, "currency": "USD", "imageGradient": "linear-gradient(135deg, #c2e9fb, #a1c4fd)", "imageEmoji": "👖", "likes": 3205, "saves": 890, "trending": False, "heat": "✦", "reviewCount": 211},
    {"_id": "4", "title": "Satin Slip Skirt", "brand": "Reformation", "category": "Minimalist", "tags": ["silk", "evening", "chic"], "price": 148, "currency": "USD", "imageGradient": "linear-gradient(135deg, #e0c3fc, #8ec5fc)", "imageEmoji": "👗", "likes": 5120, "saves": 1876, "trending": True, "heat": "💜", "reviewCount": 430},
    {"_id": "5", "title": "Micro Mini Plaid Skirt", "brand": "Urban Outfitters", "category": "Y2K", "tags": ["Y2K", "playful", "retro"], "price": 55, "currency": "USD", "imageGradient": "linear-gradient(135deg, #f093fb, #f5576c)", "imageEmoji": "🩷", "likes": 7890, "saves": 3210, "trending": True, "heat": "🔥", "reviewCount": 892},
    {"_id": "6", "title": "Prairie Floral Blouse", "brand": "Free People", "category": "Cottagecore", "tags": ["floral", "romantic", "spring"], "price": 78, "currency": "USD", "imageGradient": "linear-gradient(135deg, #a8edea, #fed6e3)", "imageEmoji": "🌸", "likes": 2340, "saves": 678, "trending": False, "heat": "🌿", "reviewCount": 167},
    {"_id": "7", "title": "Blazer Dress", "brand": "COS", "category": "Workwear", "tags": ["office", "structured", "power"], "price": 175, "currency": "USD", "imageGradient": "linear-gradient(135deg, #667eea, #764ba2)", "imageEmoji": "💼", "likes": 4500, "saves": 1920, "trending": True, "heat": "✦", "reviewCount": 310},
    {"_id": "8", "title": "Barrel Jeans", "brand": "Agolde", "category": "Streetwear", "tags": ["denim", "relaxed", "modern"], "price": 228, "currency": "USD", "imageGradient": "linear-gradient(135deg, #4facfe, #00f2fe)", "imageEmoji": "👖", "likes": 5670, "saves": 2340, "trending": True, "heat": "🔥", "reviewCount": 561},
    {"_id": "9", "title": "Smocked Maxi Dress", "brand": "Faithfull The Brand", "category": "Cottagecore", "tags": ["vacation", "boho", "flowy"], "price": 265, "currency": "USD", "imageGradient": "linear-gradient(135deg, #ffeaa7, #dfe6e9)", "imageEmoji": "🌼", "likes": 3890, "saves": 1450, "trending": False, "heat": "🌿", "reviewCount": 289},
    {"_id": "10", "title": "Leather Moto Jacket", "brand": "AllSaints", "category": "Outerwear", "tags": ["edgy", "rock", "statement"], "price": 379, "currency": "USD", "imageGradient": "linear-gradient(135deg, #2d3436, #636e72)", "imageEmoji": "🤘", "likes": 8120, "saves": 3890, "trending": True, "heat": "🔥", "reviewCount": 743},
    {"_id": "11", "title": "Lace Trim Cami", "brand": "Revolve", "category": "Y2K", "tags": ["delicate", "layering", "feminine"], "price": 68, "currency": "USD", "imageGradient": "linear-gradient(135deg, #fbc2eb, #a6c1ee)", "imageEmoji": "🎀", "likes": 6230, "saves": 2780, "trending": True, "heat": "💜", "reviewCount": 402},
    {"_id": "12", "title": "Ribbed Knit Set", "brand": "Skims", "category": "Minimalist", "tags": ["cozy", "matching", "neutral"], "price": 128, "currency": "USD", "imageGradient": "linear-gradient(135deg, #e2cfc4, #c8b8b0)", "imageEmoji": "🧶", "likes": 9450, "saves": 4210, "trending": True, "heat": "🔥", "reviewCount": 1023},
]


def _sort_key(sort: str):
    """Return a MongoDB sort spec tuple."""
    match sort:
        case "popular":
            return [("saves", -1)]
        case "price-asc":
            return [("price", 1)]
        case "price-desc":
            return [("price", -1)]
        case _:  # "trending" default
            return [("trending", -1), ("likes", -1)]


@router.get("")
async def get_feed(
    category: str = Query("All"),
    search: str = Query(""),
    sort: str = Query("trending"),
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=50),
) -> dict:
    """Return paginated trend items with optional filter and sort."""
    col = await get_trend_collection()

    query: dict = {}
    if category and category != "All":
        query["category"] = category
    if search.strip():
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"tags": {"$elemMatch": {"$regex": search, "$options": "i"}}},
            {"category": {"$regex": search, "$options": "i"}},
        ]

    total = await col.count_documents(query)
    cursor = col.find(query).sort(_sort_key(sort)).skip(skip).limit(limit)
    raw = await cursor.to_list(length=limit)

    # Convert ObjectId / _id to string
    items = []
    for doc in raw:
        doc["_id"] = str(doc.get("_id", ""))
        items.append(doc)

    return {"items": items, "total": total, "category": category, "search": search}


@router.post("/seed", status_code=201)
async def seed_feed() -> dict:
    """Seed the trends collection with starter items (dev/admin use)."""
    col = await get_trend_collection()
    existing = await col.count_documents({})
    if existing > 0:
        return {"message": f"Already seeded ({existing} items). Drop collection first to re-seed."}

    await col.insert_many(SEED_ITEMS)
    return {"message": f"Seeded {len(SEED_ITEMS)} trend items successfully."}
