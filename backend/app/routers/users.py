from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.user import UserListResponse
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserListResponse])
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[UserListResponse]:
    users = db.scalars(select(User).order_by(User.id)).all()
    return [UserListResponse.model_validate(user) for user in users]
