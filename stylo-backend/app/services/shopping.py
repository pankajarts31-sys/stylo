"""
Service to interact with SerpApi (Google Shopping API).
"""
from __future__ import annotations

import logging
import re

from serpapi import GoogleSearch

from app.core.config import settings

logger = logging.getLogger(__name__)


def _extract_price_num(raw: str | None) -> float:
    """Extract numeric price from a string like '₹1,299' or '$12.99'."""
    if not raw:
        return 0.0
    nums = re.sub(r"[^\d.]", "", str(raw))
    try:
        return float(nums)
    except ValueError:
        return 0.0


def search_fashion_items(query: str, max_results: int = 15) -> list[dict]:
    """
    Search Google Shopping using SerpApi for the given text query.
    Extracts the title, price, thumbnail, original store link, and source store name.
    """
    api_key = settings.serpapi_key
    if not api_key:
        logger.warning("SERPAPI_KEY is missing. Returning empty list.")
        return []

    params = {
        "engine": "google_shopping",
        "q": query,
        "api_key": api_key,
        "hl": "en",
        "gl": "in",
        "currency": "INR",
        "num": max_results + 5,  # fetch extra to account for filtering
    }

    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        if "error" in results:
            logger.error("SerpApi API Error: %s", results["error"])
            return []
    except Exception:
        logger.exception("SerpApi request failed")
        return []

    # The shopping results are usually under "shopping_results"
    shopping_results = results.get("shopping_results", [])
    if not shopping_results:
        logger.warning(
            "'shopping_results' key is missing or empty. Top-level keys: %s",
            list(results.keys()),
        )

    formatted_items = []

    for idx, item in enumerate(shopping_results):
        if len(formatted_items) >= max_results:
            break

        # Ensure we have the minimum required fields for rendering our cards
        title = item.get("title")
        # SerpApi shopping results use "product_link" for the store link
        link = item.get("product_link") or item.get("link") or item.get("serpapi_product_api_link", "")
        price_str = item.get("price")  # usually a string like "$12.99" or "₹1,299"
        thumbnail = item.get("thumbnail")
        source = item.get("source")
        extracted_price = item.get("extracted_price", 0) or _extract_price_num(price_str)
        rating = item.get("rating")
        reviews = item.get("reviews")

        if title and price_str and thumbnail:
            # Compute similarity score (higher for earlier results — Google ranks by relevance)
            sim = round(max(0.7, 1.0 - (idx * 0.03)), 2)

            formatted_items.append({
                "id": f"sp_{item.get('product_id', idx)}_{idx}",
                "title": title,
                "price": price_str,
                "link": link,
                "thumbnail": thumbnail,
                "source": source or "Unknown Store",
                "brand": source or "Fashion",
                "similarity": sim,
                "extracted_price": extracted_price,
                "rating": rating,
                "reviews": reviews,
                "category": "Fashion",
            })

    return formatted_items
