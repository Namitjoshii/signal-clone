from fastapi import APIRouter, Depends, Response, status

from app.models import User
from app.schemas.conversation import (
    ConversationResponse,
    CreateDirectConversationRequest,
    CreateGroupConversationRequest,
)
from app.services.conversation_service import ConversationService
from app.services.dependencies import get_conversation_service, get_current_user

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
) -> list[ConversationResponse]:
    conversations = conversation_service.list_conversations(current_user.id)
    return [ConversationResponse.model_validate(c) for c in conversations]


@router.post(
    "/direct",
    response_model=ConversationResponse,
)
def create_direct_conversation(
    data: CreateDirectConversationRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    conversation, created = conversation_service.create_direct_conversation(
        current_user.id,
        data,
    )
    response.status_code = (
        status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )
    return ConversationResponse.model_validate(conversation)


@router.post(
    "/group",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_group_conversation(
    data: CreateGroupConversationRequest,
    current_user: User = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    conversation = conversation_service.create_group_conversation(
        current_user.id,
        data,
    )
    return ConversationResponse.model_validate(conversation)


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    conversation = conversation_service.get_conversation(
        conversation_id,
        current_user.id,
    )
    return ConversationResponse.model_validate(conversation)
