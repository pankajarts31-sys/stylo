"""Saved Items Pydantic schemas."""
from pydantic import BaseModel
from datetime import datetime

class SavedItemCreate(BaseModel):
    product_url: str
    image_url: str
    title: str
    price: str
    source: str

class SavedItemOut(BaseModel):
    id: int
    user_id: int
    product_url: str
    image_url: str
    title: str
    price: str
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}
