"""
/api/search — Text & Voice search endpoint.

GET /api/search?q="..." — queries Google Shopping via SerpApi.
"""
from __future__ import annotations

from fastapi import APIRouter, Query, HTTPException
from app.services.shopping import search_fashion_items

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
async def text_search(q: str = Query(..., min_length=1)) -> dict:
    """
    Takes a raw text query (which might originate from voice-to-text on the frontend)
    and fetches real matching products with prices and buy links from Google Shopping.
    """
    try:
        # We cap at 15 results for text searches to stay snappy
        matches = search_fashion_items(q, max_results=15)
        return {
            "query": q,
            "count": len(matches),
            "matches": matches
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Live search failed: {e}",
        )
