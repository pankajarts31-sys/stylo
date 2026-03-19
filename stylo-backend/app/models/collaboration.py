"""SQLAlchemy Collaboration/Invite model."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Collaboration(Base):
    __tablename__ = "collaborations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # The user who sent the invite
    inviter_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    # Email of the person being invited (used for lookup before they accept)
    invitee_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    # Set once the invitee accepts (links to their user record)
    invitee_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    # "pending" | "accepted" | "rejected"
    status: Mapped[str] = mapped_column(String(20), default="pending", server_default="pending", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
