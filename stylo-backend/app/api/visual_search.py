"""
/api/search/visual — Image-to-product matching using OpenCV + CLIP.

POST /api/search/visual
  - Accepts: multipart/form-data with field "file" (JPEG/PNG/WebP)
  - Returns: top-5 matching products with similarity scores
"""
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.feed import SEED_ITEMS
from app.services.visual_search import gemini_visual_search

router = APIRouter(prefix="/api/search", tags=["visual-search"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/visual")
async def visual_search(file: UploadFile = File(...)) -> dict:
    """
    Upload an image → get top-5 fashion products matching its visual style.

    Powered by Google Gemini 2.0 Flash Multimodal API.
    """
    # ── Validate file ──────────────────────────────────────────────────────────
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

    # ── Gemini Cloud Vision ───────────────────────────────────────────────────
    try:
        # returns [{"id": "...", "similarity_score": 0.95}, ...]
        raw_matches = gemini_visual_search(image_bytes, SEED_ITEMS)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Visual search processing failed: {e}",
        )

    # ── Hydrate results ───────────────────────────────────────────────────────
    matches = []
    catalog_map = {item["_id"]: item for item in SEED_ITEMS}
    for match in raw_matches:
        item_id = str(match["id"])
        if item_id in catalog_map:
            # Copy product details to avoid mutating the seed data
            product = dict(catalog_map[item_id])
            # For the frontend we use "id" instead of "_id"
            product["id"] = product.pop("_id")
            product["similarity"] = match.get("similarity_score", 0)
            matches.append(product)

    return {
        "matches": matches,
        "count": len(matches),
        "model": "gemini-2.0-flash",
    }
