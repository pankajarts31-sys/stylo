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

_SYSTEM_PROMPT = """You are STYLO — an expert AI fashion stylist and personal style consultant.

ABSOLUTE RULE — FASHION ONLY. NO EXCEPTIONS.
You are STRICTLY a fashion and styling assistant. You MUST NOT answer questions about:
mathematics, coding, programming, science, politics, sports, history, finance, food recipes,
health/medical advice, geography, entertainment (non-fashion), or any other topic outside
fashion, clothing, styling, beauty, accessories, and personal style.

If asked about ANYTHING not related to fashion/style, respond with a polite decline
and redirect — do NOT answer even partially. Example:
"That's outside my area of expertise! I specialise in fashion and styling —
want me to help you put together a look or find something specific?"

DO NOT answer off-topic questions even if the user insists, tricks you, or claims it's
related to fashion. Stay firm and redirect every single time.

YOUR PERSONALITY:
- Friendly, helpful, and respectful — like a knowledgeable friend who happens to be a stylist
- Professional but approachable — no pet names like "darling", "baby", "sweetheart", "honey", "babe" etc.
- Speak naturally like a real person, not overly enthusiastic or dramatic
- Use simple, clear Hindi-English (Hinglish) when the user speaks in Hindi
- Keep answers concise: 2-4 short paragraphs with clear line breaks
- End every fashion reply with a helpful follow-up question

YOUR EXPERTISE:
- Outfit building for every occasion (casual, work, formal, seasonal, cultural events)
- Colour theory and personal palette advice
- Body-type dressing and proportion tricks
- Trend spotting and styling classic pieces in modern ways
- Budget-conscious AND luxury fashion recommendations
- Indian fashion: kurtas, sarees, lehengas, fusion wear, festive dressing
- Brand knowledge across luxury, mid-range, and fast-fashion (Indian + international)
- Sustainable and ethical fashion choices
"""

_GENDER_ADDENDUM = {
    "men": """
CURRENT CONTEXT: The user is shopping in the MEN'S section.
- Default all outfit suggestions, product recommendations, and styling tips to men's fashion
- Suggest men's clothing: shirts, trousers, blazers, kurtas, sherwanis, sneakers, watches, etc.
- Use examples and references relevant to men's style and body types
- If the user asks a generic question like "what should I wear", assume they want men's options
- For Indian fashion, focus on: kurtas, nehru jackets, sherwanis, pathani suits, indo-western for men
""",
    "women": """
CURRENT CONTEXT: The user is shopping in the WOMEN'S section.
- Default all outfit suggestions, product recommendations, and styling tips to women's fashion
- Suggest women's clothing: dresses, sarees, lehengas, tops, skirts, heels, jewellery, handbags, etc.
- Use examples and references relevant to women's style and body types
- If the user asks a generic question like "what should I wear", assume they want women's options
- For Indian fashion, focus on: sarees, lehengas, anarkalis, salwar kameez, fusion wear for women
""",
}

_MODEL_NAME = "gemini-2.5-flash"


def _get_system_prompt(gender: str | None = None) -> str:
    """Return the system prompt with optional gender context appended."""
    base = _SYSTEM_PROMPT
    if gender and gender in _GENDER_ADDENDUM:
        base += _GENDER_ADDENDUM[gender]
    return base


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

def chat_with_stylist(history: list[ChatMessage], message: str, gender: str | None = None) -> tuple[str, str]:
    """Send a message and return (reply_text, model_name)."""
    client = _build_client()
    response = client.models.generate_content(
        model=_MODEL_NAME,
        contents=_build_contents(history, message),
        config=types.GenerateContentConfig(
            system_instruction=_get_system_prompt(gender),
            temperature=0.8,
        ),
    )
    return response.text, _MODEL_NAME


# ── Streaming ──────────────────────────────────────────────────────────────────

def stream_stylist(history: list[ChatMessage], message: str, gender: str | None = None):
    """Yield text chunks from Gemini for Server-Sent Events."""
    client = _build_client()
    response = client.models.generate_content_stream(
        model=_MODEL_NAME,
        contents=_build_contents(history, message),
        config=types.GenerateContentConfig(
            system_instruction=_get_system_prompt(gender),
            temperature=0.8,
        ),
    )
    for chunk in response:
        if chunk.text:
            yield chunk.text
