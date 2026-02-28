"""
Gemini-powered AI Fashion Stylist service.

Uses google-generativeai SDK.  All public functions are regular (sync)
so FastAPI can run them in its built-in thread-pool without blocking the
event loop.
"""

from __future__ import annotations

import google.generativeai as genai

from app.core.config import get_settings
from app.schemas.chat import ChatMessage

_SYSTEM_PROMPT = """You are STYLO ✦ — a chic, warm, and knowledgeable AI fashion stylist.

Your personality:
- Encouraging and fun, never judgmental
- Speak with confidence and style
- Use occasional fashion-forward vocabulary (chic, editorial, avant-garde, effortless, etc.)
- Add a ✦ sparkle emoji occasionally for personality

Your expertise:
- Outfit building for every occasion (casual, work, formal, seasonal, cultural)
- Colour theory and personal palette advice
- Body-type dressing and proportion
- Trend spotting and styling classic pieces in modern ways
- Budget-conscious and luxury recommendations alike
- Sustainable and ethical fashion choices

Keep responses friendly and concise (2–4 paragraphs max). Use line breaks for readability.
Always end with a short question or mini-challenge to keep the conversation going.
"""

_MODEL_NAME = "gemini-2.5-flash"


def _build_client() -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        model_name=_MODEL_NAME,
        system_instruction=_SYSTEM_PROMPT,
    )


def _to_sdk_history(history: list[ChatMessage]) -> list[dict]:
    """Convert our Pydantic history into the format the SDK expects."""
    return [{"role": msg.role, "parts": [msg.content]} for msg in history]


# ── Non-streaming ─────────────────────────────────────────────────────────────

def chat_with_stylist(history: list[ChatMessage], message: str) -> tuple[str, str]:
    """
    Send a message and return (reply_text, model_name).
    Runs synchronously — FastAPI will push it into a thread pool automatically
    when called from a regular `def` path operation.
    """
    model = _build_client()
    chat = model.start_chat(history=_to_sdk_history(history))
    response = chat.send_message(message)
    return response.text, _MODEL_NAME


# ── Streaming ─────────────────────────────────────────────────────────────────

def stream_stylist(history: list[ChatMessage], message: str):
    """
    Yield text chunks from Gemini for Server-Sent Events.
    Each yielded value is a raw string fragment.
    """
    model = _build_client()
    chat = model.start_chat(history=_to_sdk_history(history))
    response = chat.send_message(message, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text
