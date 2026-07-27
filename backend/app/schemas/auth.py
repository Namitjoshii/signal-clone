from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    phone: str = Field(min_length=1, max_length=20)
    display_name: str = Field(min_length=1, max_length=100)
    otp: str


class LoginRequest(BaseModel):
    phone: str = Field(min_length=1, max_length=20)
    otp: str


class LoginResponse(BaseModel):
    user: UserResponse
    token: str
