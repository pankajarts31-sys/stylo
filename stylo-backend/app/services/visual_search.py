"""
Visual search service powered by Gemini 2.5 Flash.

Sends the uploaded image to Gemini and asks it to generate
a specific e-commerce search query for Google Shopping.
"""
from __future__ import annotations

import logging

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)


def _detect_mime_type(image_bytes: bytes) -> str:
    """Detect image MIME type from magic bytes."""
    if image_bytes[:4] == b'\x89PNG':
        return "image/png"
    if image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
        return "image/webp"
    # Default to JPEG (covers SOI marker \xff\xd8 and unknowns)
    return "image/jpeg"


def generate_search_query_from_image(image_bytes: bytes) -> str:
    """
    Pass the user's image to Gemini 2.5 Flash and ask it to generate
    a highly specific e-commerce search query.
    """
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    client = genai.Client(
        api_key=settings.gemini_api_key,
        http_options={'api_version': 'v1alpha'}
    )

    prompt = """You are an expert fashion product search specialist working for a top Indian e-commerce company like Myntra, Amazon India, or Flipkart.

Analyze this image carefully and generate the BEST possible Google Shopping search query to find this exact product or the closest match available to buy online in India.

RULES:
1. Be VERY specific about the product — include exact garment type, color, pattern, fabric, fit, and style
2. Use e-commerce friendly keywords that Indian shoppers would search for
3. Include brand name ONLY if clearly visible on the product (logo/tag)
4. Include gender (men/women/unisex/kids)
5. Keep query between 6-12 words for optimal search results
6. Use common shopping terms: "buy online", brand names, fabric types, occasion names
7. If the image shows an outfit, focus on the MAIN/most prominent piece

EXAMPLES of GOOD queries:
- women navy blue floral print A-line kurta cotton
- men black slim fit leather jacket biker style
- women pink embroidered anarkali suit georgette wedding
- men grey melange joggers cotton track pants
- women white sneakers casual shoes platform sole
- kids red check shirt cotton casual boys
- women golden silk banarasi saree wedding heavy work

EXAMPLES of BAD queries (too vague):
- nice dress
- men's shirt
- blue top

Return ONLY the raw search query. No quotes, no markdown, no explanation."""

    docs = [
        types.Part.from_bytes(data=image_bytes, mime_type=_detect_mime_type(image_bytes)),
        prompt,
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=docs,
        config=types.GenerateContentConfig(
            temperature=0.15,
        ),
    )

    try:
        query = response.text.strip().replace('"', '').replace('\n', ' ').strip()
        # Remove common prefixes Gemini might add
        for prefix in ["search query:", "query:", "search:"]:
            if query.lower().startswith(prefix):
                query = query[len(prefix):].strip()
        return query
    except Exception as e:
        raise ValueError(f"Failed to generate query from Gemini: {e}")
