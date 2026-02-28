"""
Product embedding store using CLIP (sentence-transformers clip-ViT-B-32).

At startup, we generate text embeddings for every product in SEED_ITEMS.
These are stored in memory and used for cosine similarity against uploaded images.
"""
from __future__ import annotations

import numpy as np

# Lazy-loaded — imported only when first needed to avoid slow startup
_model = None
_product_embeddings: list[dict] = []  # [{id, title, brand, embedding}, ...]


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer  # type: ignore
        _model = SentenceTransformer("clip-ViT-B-32")
    return _model


def build_product_embeddings(products: list[dict]) -> None:
    """Pre-compute CLIP text embeddings for all products. Called at startup."""
    global _product_embeddings
    model = _get_model()

    texts = [
        f"{p['title']} {p['brand']} {p['category']} {' '.join(p.get('tags', []))}"
        for p in products
    ]
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)

    _product_embeddings = [
        {
            "id": p["_id"],
            "title": p["title"],
            "brand": p["brand"],
            "category": p["category"],
            "price": p["price"],
            "imageGradient": p["imageGradient"],
            "imageEmoji": p["imageEmoji"],
            "tags": p.get("tags", []),
            "embedding": embeddings[i],
        }
        for i, p in enumerate(products)
    ]


def find_similar_products(image_embedding: np.ndarray, top_k: int = 5) -> list[dict]:
    """Return top-k products by cosine similarity to the image embedding."""
    if not _product_embeddings:
        return []

    # Stack all product embeddings into a matrix
    matrix = np.stack([p["embedding"] for p in _product_embeddings])

    # Cosine similarity
    img_norm = image_embedding / (np.linalg.norm(image_embedding) + 1e-9)
    mat_norms = matrix / (np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-9)
    scores = mat_norms @ img_norm

    # Top-k indices
    top_indices = np.argsort(scores)[::-1][:top_k]

    results = []
    for idx in top_indices:
        p = _product_embeddings[idx]
        results.append({
            "id": p["id"],
            "title": p["title"],
            "brand": p["brand"],
            "category": p["category"],
            "price": p["price"],
            "imageGradient": p["imageGradient"],
            "imageEmoji": p["imageEmoji"],
            "tags": p["tags"],
            "similarity": float(scores[idx]),
        })
    return results
