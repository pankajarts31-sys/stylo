"""
Visual search service powered by Gemini 2.0 Flash.

Sends the uploaded image along with the product catalog to the Gemini model
and asks it to return the top 5 visual matches in JSON format.
"""
from __future__ import annotations

import json

from google import genai
from google.genai import types

from app.core.config import settings


def gemini_visual_search(image_bytes: bytes, catalog: list[dict]) -> list[dict]:
    """
    Pass the user's image and the JSON catalog to Gemini 2.0 Flash.
    Returns a parsed list of up to 5 best-match products.
    """
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    client = genai.Client(
        api_key=settings.gemini_api_key,
        http_options={'api_version': 'v1alpha'}
    )
    
    # Strip unnecessary large data from catalog to keep prompt small
    lean_catalog = []
    for item in catalog:
        lean_catalog.append({
            "id": item["_id"],
            "title": item["title"],
            "brand": item["brand"],
            "category": item["category"],
            "tags": item.get("tags", []),
        })

    prompt = f"""
    You are an expert AI fashion stylist. 
    I am providing an image of a fashion item (or outfit) and a JSON catalog of available products.
    Analyze the visual style, color, texture, and aesthetic of the uploaded image.
    Find the top 5 products from the catalog that visually match or would pair perfectly with the uploaded image.
    
    Here is the catalog:
    {json.dumps(lean_catalog)}
    
    CRITICAL: You MUST return exactly 5 items. Even if the matches aren't perfect, choose the 5 closest options.
    Return EXACTLY a JSON array of objects. Do not include any markdown formatting or explanation.
    Each object must have two keys:
    1. "id" (string): the exact _id from the catalog
    2. "similarity_score" (float): a confidence score between 0.0 and 1.0
    """

    # We send the raw bytes to Gemini using the standard part structure
    docs = [
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        prompt,
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=docs,
        config=types.GenerateContentConfig(
            temperature=0.1,  # low temperature for stable JSON output
            response_mime_type="application/json",
        ),
    )

    try:
        print("GEMINI RESPONSE:", response.text)
        results = json.loads(response.text)
        # Sort just in case it didn't return them in order
        results = sorted(results, key=lambda x: x.get("similarity_score", 0), reverse=True)
        return results[:5]
    except Exception as e:
        raise ValueError(f"Failed to parse Gemini output: {e}. Output was: {response.text}")
