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

    prompt = """
    You are an expert AI fashion stylist and personal shopper.
    Look at the fashion item or outfit in this image.
    Write a highly specific, concise e-commerce search query (max 5-8 words) that I can type into Google Shopping to find this exact item or something extremely similar.
    Focus on: gender, color, material, style, and specific item type.
    Example outputs:
    - Men's black leather double rider moto jacket
    - Women's floral midi wrap summer dress
    - Unisex oversized washed grey graphic t-shirt
    
    Return ONLY the raw search query string. Do not include any quotes, markdown formatting, or explanation.
    """

    docs = [
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        prompt,
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=docs,
        config=types.GenerateContentConfig(
            temperature=0.2, 
        ),
    )

    try:
        query = response.text.strip().replace('"', '').replace('\n', ' ')
        return query
    except Exception as e:
        raise ValueError(f"Failed to generate query from Gemini: {e}")
