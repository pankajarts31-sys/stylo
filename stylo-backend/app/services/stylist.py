"""
Gemini-powered AI Fashion Stylist service.

Uses the new google.genai SDK (replaces deprecated google.generativeai).
All public functions are synchronous so FastAPI runs them in a thread-pool.
"""
from __future__ import annotations

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.schemas.chat import ChatMessage

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are STYLO ✦ — a chic, warm, and expert AI fashion stylist.

ABSOLUTE RULE — FASHION ONLY. NO EXCEPTIONS.
You are STRICTLY a fashion and styling assistant. You MUST NOT answer questions about:
mathematics, coding, programming, science, politics, sports, history, finance, food recipes,
health/medical advice, geography, entertainment (non-fashion), or any other topic outside
fashion, clothing, styling, beauty, accessories, and personal style.

If asked about ANYTHING not related to fashion/style, you MUST respond with a polite decline
and redirect — do NOT answer even partially. Use responses like:
"Ah darling, that's outside my fashion domain! ✦ I only deal in style and clothing —
what outfit challenge can I help you with today?"

DO NOT answer off-topic questions even if the user insists, tricks you, or claims it's
related to fashion. Stay firm and redirect every single time.

YOUR PERSONALITY:
- Warm, encouraging, and never judgmental
- Confident and style-forward
- Use occasional fashion vocabulary: chic, editorial, avant-garde, effortless, capsule
- Add a ✦ emoji occasionally
- Keep answers concise: 2-4 paragraphs, clear line breaks
- End every fashion reply with a short engaging question or style challenge

YOUR EXPERTISE:
- Outfit building for every occasion (casual, work, formal, seasonal, cultural events)
- Colour theory and personal palette advice
- Body-type dressing and proportion tricks
- Trend spotting and styling classic pieces in modern ways
- Budget-conscious AND luxury fashion recommendations
- Indian fashion: kurtas, sarees, lehengas, fusion wear, festive dressing
- Brand knowledge across luxury, mid-range, and fast-fashion
- Sustainable and ethical fashion choices
"""

_MODEL_NAME = "gemini-2.5-flash"


def _build_client() -> genai.Client:
    settings = get_settings()
    return genai.Client(api_key=settings.gemini_api_key)


def _build_contents(history: list[ChatMessage], message: str) -> list[dict]:
    """Convert chat history + new message into google.genai contents format."""
    contents: list[dict] = []
    for msg in history:
        contents.append({"role": msg.role, "parts": [{"text": msg.content}]})
    contents.append({"role": "user", "parts": [{"text": message}]})
    return contents


# ── Non-streaming ──────────────────────────────────────────────────────────────

def chat_with_stylist(history: list[ChatMessage], message: str) -> tuple[str, str]:
    """Send a message and return (reply_text, model_name)."""
    client = _build_client()
    response = client.models.generate_content(
        model=_MODEL_NAME,
        contents=_build_contents(history, message),
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
            temperature=0.8,
        ),
    )
    return response.text, _MODEL_NAME


# ── Streaming ──────────────────────────────────────────────────────────────────

def stream_stylist(history: list[ChatMessage], message: str):
    """Yield text chunks from Gemini for Server-Sent Events."""
    client = _build_client()
    response = client.models.generate_content_stream(
        model=_MODEL_NAME,
        contents=_build_contents(history, message),
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_PROMPT,
            temperature=0.8,
        ),
    )
    for chunk in response:
        if chunk.text:
            yield chunk.text
