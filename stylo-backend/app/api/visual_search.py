"""
/api/search/visual — Image-to-product matching using OpenCV + CLIP.

POST /api/search/visual
  - Accepts: multipart/form-data with field "file" (JPEG/PNG/WebP)
  - Returns: top-5 matching products with similarity scores
"""
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.services.visual_search import generate_search_query_from_image
from app.services.shopping import search_fashion_items

router = APIRouter(prefix="/api/search", tags=["visual-search"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/visual")
async def visual_search(file: UploadFile = File(...)) -> dict:
    """
    Upload an image → get top-15 fashion products matching from Google Shopping.
    Powered by Google Gemini 2.5 Flash + SerpApi.
    """
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    content_type = (file.content_type or "").lower()
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}'. Upload a JPEG, PNG, or WebP image.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image too large. Maximum size is 10 MB.",
        )

    try:
        # 1. Ask Gemini to describe the clothing item accurately
        search_query = generate_search_query_from_image(image_bytes)
        print(f"Generated visual search query: {search_query}")
        
        # 2. Fetch real products from Google Shopping
        matches = search_fashion_items(search_query, max_results=15)
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Visual search processing failed: {e}",
        )

    return {
        "matches": matches,
        "count": len(matches),
        "model": "gemini-2.5-flash + serpapi",
        "query": search_query
    }
