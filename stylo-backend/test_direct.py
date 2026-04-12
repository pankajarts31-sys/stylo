from app.schemas.chat import ChatMessage
from app.services.stylist import stream_stylist

history = [
    ChatMessage(role="user", content="hi"),
    ChatMessage(role="model", content="hello")
]

try:
    for chunk in stream_stylist(history, "what should I wear?", "men"):
        print("CHUNK:", chunk)
except Exception as e:
    print("ERROR:", type(e), e)
