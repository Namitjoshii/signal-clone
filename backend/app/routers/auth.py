from fastapi import APIRouter, Depends, status

from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.services.dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    user = auth_service.register(data)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=LoginResponse)
def login(
    data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> LoginResponse:
    user, token = auth_service.login(data)
    return LoginResponse(user=UserResponse.model_validate(user), token=token)
