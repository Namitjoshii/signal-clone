from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import MessageStatus
from app.schemas.user import UserResponse


class SendMessageRequest(BaseModel):
    conversation_id: int = Field(gt=0)
    content: str = Field(min_length=1)


class MessageResponse(BaseModel):
    id: int
    sender: UserResponse
    content: str
    status: MessageStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
