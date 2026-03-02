"""
Service to interact with SerpApi (Google Shopping API)
"""
from __future__ import annotations

import os
from serpapi import GoogleSearch

def search_fashion_items(query: str, max_results: int = 15) -> list[dict]:
    """
    Search Google Shopping using SerpApi for the given text query.
    Extracts the title, price, thumbnail, original store link, and source store name.
    """
    # Read key at call-time so it's always fresh (avoids stale import-time singleton)
    api_key = os.environ.get("SERPAPI_KEY", "")
    if not api_key:
        print("WARNING: SERPAPI_KEY is missing. Returning empty list.")
        return []

    params = {
        "engine": "google_shopping",
        "q": query,
        "api_key": api_key,
        "hl": "hi",
        "gl": "in",
        "currency": "INR",
    }

    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        if "error" in results:
            print("SerpApi API Error:", results["error"])
    except Exception as e:
        print(f"SerpApi Error: {e}")
        return []

    # The shopping results are usually under "shopping_results"
    shopping_results = results.get("shopping_results", [])
    if not shopping_results:
        print("WARNING: 'shopping_results' key is missing or empty. Top-level keys:", list(results.keys()))
    
    formatted_items = []
    
    for idx, item in enumerate(shopping_results):
        if len(formatted_items) >= max_results:
            break
            
        # Ensure we have the minimum required fields for rendering our cards
        title = item.get("title")
        # SerpApi shopping results use "product_link" for the store link, "link" is often None
        link = item.get("product_link") or item.get("link") or item.get("serpapi_product_api_link", "")
        price_str = item.get("price")  # usually a string like "$12.99"
        thumbnail = item.get("thumbnail")
        source = item.get("source")
        
        if title and price_str and thumbnail:
            formatted_items.append({
                "id": f"sp_{item.get('product_id', idx)}_{idx}", # generate a unique string ID
                "title": title[:50] + "..." if len(title) > 50 else title,
                "price": price_str,
                "link": link,
                "thumbnail": thumbnail,
                "source": source or "Unknown Store",
                "similarity": 1.0 # default for pure search
            })

    return formatted_items
