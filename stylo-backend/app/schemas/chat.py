from typing import Literal
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    model: str = "gemini-1.5-flash"
