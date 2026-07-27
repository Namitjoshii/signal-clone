from pydantic import BaseModel, Field


class WebSocketIncomingMessage(BaseModel):
    content: str = Field(min_length=1)
