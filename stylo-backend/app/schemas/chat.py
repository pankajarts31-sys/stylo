from typing import Literal, Optional
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    gender: Optional[Literal["men", "women"]] = None


class ChatResponse(BaseModel):
    reply: str
    model: str = "gemini-2.5-flash"
