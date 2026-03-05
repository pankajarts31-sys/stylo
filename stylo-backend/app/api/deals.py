"""
/api/deals — Live Price Comparison endpoint.

Fetches Google Shopping results via SerpApi, then builds
a multi-store comparison structure for each product.
Simulates competitive pricing across popular Indian platforms
(Amazon, Flipkart, Myntra, Meesho, Ajio, Tata CLiQ, etc.)
"""
from __future__ import annotations

import os
import re
import random
import hashlib
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from serpapi import GoogleSearch

router = APIRouter(prefix="/api", tags=["deals"])

# ── Indian Stores for price comparison ──────────────────────────
INDIAN_STORES = [
    {"name": "Amazon India", "logo": "📦", "shipping_min": 1, "shipping_max": 3},
    {"name": "Flipkart", "logo": "🛒", "shipping_min": 2, "shipping_max": 4},
    {"name": "Myntra", "logo": "🌿", "shipping_min": 2, "shipping_max": 5},
    {"name": "Meesho", "logo": "🛍️", "shipping_min": 3, "shipping_max": 7},
    {"name": "Ajio", "logo": "✨", "shipping_min": 2, "shipping_max": 5},
    {"name": "Tata CLiQ", "logo": "🌐", "shipping_min": 2, "shipping_max": 4},
    {"name": "Nykaa Fashion", "logo": "⚫", "shipping_min": 3, "shipping_max": 6},
    {"name": "Snapdeal", "logo": "🔴", "shipping_min": 3, "shipping_max": 7},
]

GRADIENTS = [
    "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
    "linear-gradient(135deg, #d4b896, #7f7053)",
    "linear-gradient(135deg, #2d3436, #636e72)",
    "linear-gradient(135deg, #f5d0b8, #e8946a)",
    "linear-gradient(135deg, #c2e9fb, #a1c4fd)",
    "linear-gradient(135deg, #f6d365, #fda085)",
    "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
]

EMOJIS = ["👗", "👟", "👜", "🧥", "👖", "👠", "💛", "🧣", "👢", "🎒"]

DEAL_TAGS = [
    "Best Seller", "Limited Time", "Flash Sale", "Clearance",
    "New Arrival", "Extra 10% Off", "Bank Offer", "Free Shipping"
]


def _extract_price(raw: str | None) -> float:
    """Pull numeric price from strings like '₹1,299' or '$45.00'."""
    if not raw:
        return 0.0
    nums = re.sub(r"[^\d.]", "", str(raw))
    try:
        return float(nums)
    except ValueError:
        return 0.0


def _build_comparison_stores(base_price: float, source: str, link: str, seed: str):
    """
    Given the real price from Google Shopping, simulate what the same item
    *might* cost at other Indian platforms.  Uses a seeded random so the
    same product always gets the same simulated prices within a session.
    """
    rng = random.Random(seed)

    stores = []
    # 1) The real store we got from SerpApi
    stores.append({
        "store": source or "Google Shopping",
        "storeLogo": "🛒",
        "price": round(base_price),
        "currency": "INR",
        "inStock": True,
        "shippingDays": rng.randint(1, 4),
        "url": link or "#",
        "deal": rng.choice(["Free shipping", "Extra 5% Off", None, None]),
    })

    # 2) Pick 3-5 Indian stores
    chosen = rng.sample(INDIAN_STORES, k=min(rng.randint(3, 5), len(INDIAN_STORES)))
    for s in chosen:
        # Vary price ± 20%
        variation = rng.uniform(-0.20, 0.20)
        sim_price = max(99, round(base_price * (1 + variation)))
        in_stock = rng.random() > 0.15  # 85% chance in stock
        deal = None
        if rng.random() > 0.5:
            deal = rng.choice(DEAL_TAGS)

        stores.append({
            "store": s["name"],
            "storeLogo": s["logo"],
            "price": sim_price,
            "currency": "INR",
            "inStock": in_stock,
            "shippingDays": rng.randint(s["shipping_min"], s["shipping_max"]),
            "url": "#",
            "deal": deal,
        })

    return stores


@router.get("/deals")
def get_deals(
    q: str = Query("trending fashion india", description="Search query"),
    category: Optional[str] = Query(None, description="Optional category filter"),
):
    api_key = os.environ.get("SERPAPI_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="SERPAPI_KEY is not configured.")

    search_q = q.strip() or "trending fashion india"
    if category and category != "All":
        search_q = f"{category} {search_q}"

    params = {
        "engine": "google_shopping",
        "q": search_q,
        "api_key": api_key,
        "gl": "in",
        "hl": "en",
        "currency": "INR",
        "num": 12,
    }

    try:
        search = GoogleSearch(params)
        raw = search.get_dict()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SerpApi error: {e}")

    if "error" in raw:
        raise HTTPException(status_code=502, detail=raw["error"])

    shopping_results = raw.get("shopping_results", [])

    deals = []
    for idx, item in enumerate(shopping_results[:12]):
        title = item.get("title", "")
        if not title:
            continue

        price_raw = item.get("price", "")
        extracted = item.get("extracted_price", 0) or _extract_price(price_raw)
        if extracted <= 0:
            continue

        source = item.get("source", "")
        link = item.get("product_link") or item.get("link") or ""
        thumbnail = item.get("thumbnail", "")
        rating = item.get("rating", round(random.uniform(3.8, 4.9), 1))
        reviews = item.get("reviews", random.randint(50, 12000))

        # Build a deterministic seed from the title
        seed = hashlib.md5(title.encode()).hexdigest()

        stores = _build_comparison_stores(extracted, source, link, seed)

        # Calculate savings
        prices = [s["price"] for s in stores if s["inStock"]]
        best = min(prices) if prices else extracted
        worst = max(prices) if prices else extracted
        savings_pct = round((1 - best / worst) * 100) if worst > 0 else 0

        grad_idx = idx % len(GRADIENTS)
        emoji_idx = idx % len(EMOJIS)

        deals.append({
            "id": f"deal_{idx}_{seed[:8]}",
            "title": title[:60] + ("..." if len(title) > 60 else ""),
            "brand": source or "Fashion",
            "category": category or "Fashion",
            "description": f"Found on {source}. Compare prices across {len(stores)} Indian stores.",
            "imageGradient": GRADIENTS[grad_idx],
            "imageEmoji": EMOJIS[emoji_idx],
            "thumbnail": thumbnail,
            "rating": float(rating) if rating else 4.2,
            "reviewCount": int(reviews) if reviews else 100,
            "isHotDeal": savings_pct >= 15,
            "savingsPercent": savings_pct,
            "tags": [category or "fashion", "deals"],
            "stores": stores,
        })

    return {
        "success": True,
        "query": q,
        "category": category,
        "results_count": len(deals),
        "deals": deals,
    }
