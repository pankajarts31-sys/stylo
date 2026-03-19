"""Collaboration Pydantic schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr


class InviteRequest(BaseModel):
    email: EmailStr


class CollaborationOut(BaseModel):
    id: int
    inviter_id: int
    invitee_email: str
    invitee_id: int | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CollaboratorOut(BaseModel):
    """Represents an accepted collaborator (the other user's public info)."""
    collaboration_id: int
    user_id: int
    full_name: str
    email: str
    avatar_url: str | None = None
