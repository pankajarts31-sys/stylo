"""
/api/feed — Trending Feed endpoint backed by live Google Shopping (SerpApi).

GET /api/feed — returns live cached "trending fashion" products.
"""
from __future__ import annotations
import time
from fastapi import APIRouter, Query
from app.services.shopping import search_fashion_items

router = APIRouter(prefix="/api/feed", tags=["feed"])

# Simple in-memory cache to prevent burning API credits for the homepage feed
_feed_cache = []
_feed_cache_time = 0
CACHE_TTL = 3600  # 1 hour

@router.get("")
async def get_feed(
    category: str = Query("All"),
    search: str = Query(""),
    sort: str = Query("trending"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
) -> dict:
    """Return live trending items from Google Shopping."""
    global _feed_cache, _feed_cache_time
    now = time.time()
    
    # Refresh cache if empty or expired
    if not _feed_cache or (now - _feed_cache_time) > CACHE_TTL:
        print("Fetching fresh trending feed from SerpApi...")
        # A broad query to get a good mix of fashion items
        _feed_cache = search_fashion_items("latest trending fashion outfits men women", max_results=20)
        _feed_cache_time = now

    items = list(_feed_cache)

    # Filter
    if category != "All":
        items = [item for item in items if category.lower() in item["title"].lower()]
        
    if search.strip():
        s = search.lower()
        items = [item for item in items if s in item["title"].lower() or s in item["source"].lower()]

    # Sort (mocked for live data since SerpApi ranking is best)
    if sort == "price-asc":
        # Extract numbers from string "$12.99"
        items.sort(key=lambda x: float(x["price"].replace("$", "").replace(",", "")) if "$" in x["price"] else 9999)
    elif sort == "price-desc":
        items.sort(key=lambda x: float(x["price"].replace("$", "").replace(",", "")) if "$" in x["price"] else 0, reverse=True)

    # Pagination
    total = len(items)
    items = items[skip:skip+limit]

    return {"items": items, "total": total, "category": category, "search": search}
