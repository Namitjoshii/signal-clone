from fastapi import APIRouter, Depends, status

from app.models import User
from app.schemas.message import MessageResponse, SendMessageRequest
from app.services.dependencies import get_current_user, get_message_service
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    message_service: MessageService = Depends(get_message_service),
) -> MessageResponse:
    message = message_service.send_message(current_user.id, data)
    return MessageResponse.model_validate(message)


@router.get("/{conversation_id}", response_model=list[MessageResponse])
def list_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    message_service: MessageService = Depends(get_message_service),
) -> list[MessageResponse]:
    messages = message_service.list_messages(conversation_id, current_user.id)
    return [MessageResponse.model_validate(message) for message in messages]


@router.patch("/{message_id}/read", response_model=MessageResponse)
def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    message_service: MessageService = Depends(get_message_service),
) -> MessageResponse:
    message = message_service.mark_as_read(message_id, current_user.id)
    return MessageResponse.model_validate(message)
