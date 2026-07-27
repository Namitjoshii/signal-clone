from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ConversationType
from app.schemas.user import UserResponse


class ConversationMemberResponse(BaseModel):
    id: int
    user_id: int
    is_admin: bool
    joined_at: datetime
    user: UserResponse

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: int
    type: ConversationType
    name: Optional[str] = None
    created_at: datetime
    members: list[ConversationMemberResponse]

    model_config = ConfigDict(from_attributes=True)


class CreateDirectConversationRequest(BaseModel):
    user_id: int = Field(gt=0)


class CreateGroupConversationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    member_ids: list[int] = Field(default_factory=list)
