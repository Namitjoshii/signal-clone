from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import User
from app.schemas.auth import LoginRequest, RegisterRequest

VALID_OTP = "123456"
MOCK_TOKEN = "mock-jwt-token"


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def register(self, data: RegisterRequest) -> User:
        if data.otp != VALID_OTP:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP",
            )

        existing_user = self.db.scalar(
            select(User).where(
                or_(User.username == data.username, User.phone == data.phone)
            )
        )
        if existing_user:
            if existing_user.username == data.username:
                detail = "Username already registered"
            else:
                detail = "Phone number already registered"
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=detail,
            )

        user = User(
            username=data.username,
            phone=data.phone,
            display_name=data.display_name,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def login(self, data: LoginRequest) -> tuple[User, str]:
        if data.otp != VALID_OTP:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP",
            )

        user = self.db.scalar(select(User).where(User.phone == data.phone))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return user, MOCK_TOKEN
