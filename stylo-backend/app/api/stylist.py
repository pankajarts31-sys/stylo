"""
/api/stylist  — AI Fashion Stylist endpoints.

POST /api/stylist/chat   → full reply (JSON)
POST /api/stylist/stream → streaming reply (text/event-stream SSE)
"""

from __future__ import annotations

import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.core.config import Settings, get_settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.stylist import chat_with_stylist, stream_stylist

router = APIRouter(prefix="/api/stylist", tags=["stylist"])

SettingsDep = Annotated[Settings, Depends(get_settings)]


def _check_api_key(settings: Settings) -> None:
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not configured. Add it to your .env file.",
        )


# ── POST /api/stylist/chat ────────────────────────────────────────────────────

@router.post("/chat")
def stylist_chat(body: ChatRequest, settings: SettingsDep) -> ChatResponse:
    """Return a complete AI reply as JSON."""
    _check_api_key(settings)
    try:
        reply, model_name = chat_with_stylist(body.history, body.message)
        return ChatResponse(reply=reply, model=model_name)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ── POST /api/stylist/stream ──────────────────────────────────────────────────

@router.post("/stream", response_class=StreamingResponse)
def stylist_stream(body: ChatRequest, settings: SettingsDep):
    """
    Stream the AI reply as Server-Sent Events.
    Each event: `data: <json>\n\n`
    Final event: `data: [DONE]\n\n`
    """
    _check_api_key(settings)

    def _event_generator():
        try:
            for chunk in stream_stylist(body.history, body.message):
                payload = json.dumps({"delta": chunk})
                yield f"data: {payload}\n\n"
        except Exception as exc:
            error_payload = json.dumps({"error": str(exc)})
            yield f"data: {error_payload}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        _event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
