"""
Visual search service.

Pipeline:
  image bytes → OpenCV decode + resize → CLIP image encode → embedding
"""
from __future__ import annotations

import io

import numpy as np


def preprocess_image(image_bytes: bytes) -> "np.ndarray":
    """
    Decode raw image bytes with OpenCV, resize to 224×224, convert to RGB PIL image.
    Returns the PIL Image ready for CLIP encoding.
    """
    import cv2  # type: ignore
    from PIL import Image

    # Decode bytes → numpy array (BGR)
    buf = np.frombuffer(image_bytes, dtype=np.uint8)
    img_bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Could not decode image. Make sure it is a valid JPEG/PNG/WebP file.")

    # Resize to 224×224 (CLIP standard input size)
    img_bgr = cv2.resize(img_bgr, (224, 224), interpolation=cv2.INTER_AREA)

    # BGR → RGB → PIL Image
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(img_rgb)
    return pil_image


def encode_image(pil_image) -> "np.ndarray":
    """Encode a PIL image using CLIP (sentence-transformers). Returns a 512-dim embedding."""
    from app.core.embedding_store import _get_model  # lazy load

    model = _get_model()
    embedding = model.encode(pil_image, convert_to_numpy=True, show_progress_bar=False)
    return embedding
