"""
/api/collab — Collaboration / Invite endpoints.

POST   /api/collab/invite                    → Send an invite to a user by email
GET    /api/collab/invites/received          → List invites received by current user
GET    /api/collab/invites/sent              → List invites sent by current user
POST   /api/collab/invite/{invite_id}/accept → Accept a received invite
POST   /api/collab/invite/{invite_id}/reject → Reject a received invite
GET    /api/collab/collaborators             → List accepted collaborators
DELETE /api/collab/collaborators/{collaboration_id}   → Remove a collaborator
"""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.collaboration import Collaboration
from app.models.user import User
from app.schemas.collaboration import CollaborationOut, CollaboratorOut, InviteRequest

router = APIRouter(prefix="/api/collab", tags=["collaboration"])

DbDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("/invite", response_model=CollaborationOut, status_code=status.HTTP_201_CREATED)
def send_invite(body: InviteRequest, current_user: CurrentUser, db: DbDep) -> CollaborationOut:
    """Send a collaboration invite to a user by email."""
    if body.email.lower() == current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot invite yourself.",
        )

    # Prevent duplicate pending invites
    existing = db.query(Collaboration).filter(
        Collaboration.inviter_id == current_user.id,
        Collaboration.invitee_email == body.email.lower(),
        Collaboration.status == "pending",
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pending invite has already been sent to this email.",
        )

    # Also prevent re-inviting an already accepted collaborator
    accepted = db.query(Collaboration).filter(
        Collaboration.inviter_id == current_user.id,
        Collaboration.invitee_email == body.email.lower(),
        Collaboration.status == "accepted",
    ).first()
    if accepted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user is already a collaborator.",
        )

    # Look up whether this email already belongs to a registered user
    invitee_user = db.query(User).filter(User.email == body.email.lower()).first()

    invite = Collaboration(
        inviter_id=current_user.id,
        invitee_email=body.email.lower(),
        invitee_id=invitee_user.id if invitee_user else None,
        status="pending",
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


@router.get("/invites/received", response_model=list[CollaborationOut])
def get_received_invites(current_user: CurrentUser, db: DbDep) -> list[CollaborationOut]:
    """List all invites received by the current user (matched by email)."""
    return (
        db.query(Collaboration)
        .filter(
            Collaboration.invitee_email == current_user.email.lower(),
            Collaboration.status == "pending",
        )
        .order_by(Collaboration.created_at.desc())
        .all()
    )


@router.get("/invites/sent", response_model=list[CollaborationOut])
def get_sent_invites(current_user: CurrentUser, db: DbDep) -> list[CollaborationOut]:
    """List all invites sent by the current user."""
    return (
        db.query(Collaboration)
        .filter(Collaboration.inviter_id == current_user.id)
        .order_by(Collaboration.created_at.desc())
        .all()
    )


@router.post("/invite/{invite_id}/accept", response_model=CollaborationOut)
def accept_invite(invite_id: int, current_user: CurrentUser, db: DbDep) -> CollaborationOut:
    """Accept a pending invite addressed to the current user."""
    invite = db.query(Collaboration).filter(
        Collaboration.id == invite_id,
        Collaboration.invitee_email == current_user.email.lower(),
        Collaboration.status == "pending",
    ).first()

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found or already actioned.",
        )

    invite.status = "accepted"
    invite.invitee_id = current_user.id
    db.commit()
    db.refresh(invite)
    return invite


@router.post("/invite/{invite_id}/reject", response_model=CollaborationOut)
def reject_invite(invite_id: int, current_user: CurrentUser, db: DbDep) -> CollaborationOut:
    """Reject a pending invite addressed to the current user."""
    invite = db.query(Collaboration).filter(
        Collaboration.id == invite_id,
        Collaboration.invitee_email == current_user.email.lower(),
        Collaboration.status == "pending",
    ).first()

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found or already actioned.",
        )

    invite.status = "rejected"
    invite.invitee_id = current_user.id
    db.commit()
    db.refresh(invite)
    return invite


@router.get("/collaborators", response_model=list[CollaboratorOut])
def get_collaborators(current_user: CurrentUser, db: DbDep) -> list[CollaboratorOut]:
    """List all accepted collaborators for the current user (both directions)."""
    # Collaborations where current user is the inviter and the invite was accepted
    as_inviter = (
        db.query(Collaboration)
        .filter(
            Collaboration.inviter_id == current_user.id,
            Collaboration.status == "accepted",
        )
        .all()
    )

    # Collaborations where current user is the invitee and they accepted
    as_invitee = (
        db.query(Collaboration)
        .filter(
            Collaboration.invitee_id == current_user.id,
            Collaboration.status == "accepted",
        )
        .all()
    )

    # Collect all other-user IDs in one shot to avoid N+1 queries
    invitee_ids = [c.invitee_id for c in as_inviter if c.invitee_id]
    inviter_ids = [c.inviter_id for c in as_invitee]

    user_map: dict[int, User] = {}
    all_ids = list(set(invitee_ids + inviter_ids))
    if all_ids:
        users = db.query(User).filter(User.id.in_(all_ids)).all()
        user_map = {u.id: u for u in users}

    collaborators: list[CollaboratorOut] = []

    for collab in as_inviter:
        if collab.invitee_id and collab.invitee_id in user_map:
            other_user = user_map[collab.invitee_id]
            collaborators.append(
                CollaboratorOut(
                    collaboration_id=collab.id,
                    user_id=other_user.id,
                    full_name=other_user.full_name,
                    email=other_user.email,
                    avatar_url=other_user.avatar_url,
                )
            )

    for collab in as_invitee:
        if collab.inviter_id in user_map:
            inviter = user_map[collab.inviter_id]
            collaborators.append(
                CollaboratorOut(
                    collaboration_id=collab.id,
                    user_id=inviter.id,
                    full_name=inviter.full_name,
                    email=inviter.email,
                    avatar_url=inviter.avatar_url,
                )
            )

    return collaborators


@router.delete("/collaborators/{collaboration_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_collaborator(collaboration_id: int, current_user: CurrentUser, db: DbDep):
    """Remove a collaborator by marking the collaboration as rejected."""
    collab = db.query(Collaboration).filter(
        Collaboration.id == collaboration_id,
        Collaboration.status == "accepted",
    ).first()

    if not collab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaboration not found.",
        )

    # Verify current user is a participant
    if collab.inviter_id != current_user.id and collab.invitee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this collaboration.",
        )

    db.delete(collab)
    db.commit()
