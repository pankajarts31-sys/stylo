"""
/api/saved — User Saved Items endpoints.

POST /api/saved  → Save a product
GET  /api/saved  → List all saved products
DELETE /api/saved/{id} → Remove a saved product
"""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.saved_item import SavedItem
from app.schemas.saved_item import SavedItemCreate, SavedItemOut

router = APIRouter(prefix="/api/saved", tags=["saved_items"])

DbDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("", response_model=SavedItemOut, status_code=status.HTTP_201_CREATED)
def save_item(body: SavedItemCreate, current_user: CurrentUser, db: DbDep) -> SavedItemOut:
    """Save a new item for the current user."""
    # Check if already saved
    existing = db.query(SavedItem).filter(
        SavedItem.user_id == current_user.id,
        SavedItem.product_url == body.product_url
    ).first()
    
    if existing:
        return existing
        
    item = SavedItem(
        user_id=current_user.id,
        product_url=body.product_url,
        image_url=body.image_url,
        title=body.title,
        price=body.price,
        source=body.source,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("", response_model=list[SavedItemOut])
def get_saved_items(current_user: CurrentUser, db: DbDep) -> list[SavedItemOut]:
    """Retrieve all saved items for the current user."""
    return db.query(SavedItem).filter(SavedItem.user_id == current_user.id).order_by(SavedItem.created_at.desc()).all()


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, current_user: CurrentUser, db: DbDep):
    """Delete a saved item."""
    item = db.query(SavedItem).filter(
        SavedItem.id == item_id,
        SavedItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
    db.delete(item)
    db.commit()
