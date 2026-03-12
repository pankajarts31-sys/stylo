"""
/api/feed — Trending Feed endpoint backed by live Google Shopping (SerpApi).

GET /api/feed — returns live cached "trending fashion" products.
"""
from __future__ import annotations

import logging
import re
import time
from collections import OrderedDict

from fastapi import APIRouter, Query

from app.services.shopping import search_fashion_items

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/feed", tags=["feed"])

# Bounded LRU cache keyed by (category, search)
_feed_cache: OrderedDict[tuple[str, str], dict] = OrderedDict()
CACHE_TTL = 3600  # 1 hour
CACHE_MAX_SIZE = 100  # evict oldest entries beyond this


def _cache_set(key: tuple[str, str], value: dict) -> None:
    """Insert into the bounded cache, evicting the oldest entry if full."""
    _feed_cache[key] = value
    _feed_cache.move_to_end(key)
    while len(_feed_cache) > CACHE_MAX_SIZE:
        _feed_cache.popitem(last=False)


@router.get("")
async def get_feed(
    category: str = Query("All"),
    search: str = Query(""),
    sort: str = Query("trending"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
) -> dict:
    """Return live trending items from Google Shopping."""
    now = time.time()

    cache_key = (category, search)
    cached_data = _feed_cache.get(cache_key)

    # Refresh cache if empty or expired for this specific query
    if not cached_data or (now - cached_data["time"]) > CACHE_TTL:
        logger.info("Fetching fresh feed for %s", cache_key)

        # Build a highly relevant search query for Google Shopping
        query_parts = ["latest trending"]
        # Treat both "All" and empty string as no category filter
        if category and category != "All":
            query_parts.append(category)
        else:
            query_parts.append("fashion styles men women")

        if search.strip():
            query_parts.append(search.strip())

        q = " ".join(query_parts)

        # Fetch up to 20 results from SerpApi
        fetched_items = search_fashion_items(q, max_results=20)
        _cache_set(cache_key, {"time": now, "items": fetched_items})
        cached_data = _feed_cache[cache_key]

    items = list(cached_data["items"])

    def parse_price(p_str: str | None) -> float:
        if not p_str:
            return 0.0
        cleaned = re.sub(r'[^\d.]', '', str(p_str))
        try:
            return float(cleaned) if cleaned else 0.0
        except ValueError:
            return 0.0

    # Sort
    if sort == "price-asc":
        items.sort(key=lambda x: parse_price(x.get("price", "")) or 999999)
    elif sort == "price-desc":
        items.sort(key=lambda x: parse_price(x.get("price", "")), reverse=True)

    # Pagination
    total = len(items)
    items = items[skip : skip + limit]

    return {"items": items, "total": total, "category": category, "search": search}
