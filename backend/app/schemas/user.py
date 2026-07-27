from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: int
    username: str
    phone: str
    display_name: str
    avatar: Optional[str] = None
    online: bool
    last_seen: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    id: int
    username: str
    display_name: str
    phone: str

    model_config = ConfigDict(from_attributes=True)
