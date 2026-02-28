"""Pydantic schemas for the Trend Feed."""
from __future__ import annotations

from pydantic import BaseModel, Field


class TrendItem(BaseModel):
    id: str = Field(alias="_id", default="")
    title: str
    brand: str
    category: str
    tags: list[str] = []
    price: float
    currency: str = "USD"
    imageGradient: str
    imageEmoji: str
    likes: int = 0
    saves: int = 0
    trending: bool = False
    heat: str = "✦"
    reviewCount: int = 0

    model_config = {"populate_by_name": True}


class FeedResponse(BaseModel):
    items: list[TrendItem]
    total: int
    category: str
    search: str
