from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Conversation, ConversationMember, Message, MessageStatus
from app.schemas.message import SendMessageRequest


class MessageService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _message_query(self):
        return select(Message).options(selectinload(Message.sender))

    def _ensure_member(self, conversation_id: int, user_id: int) -> None:
        is_member = self.db.scalar(
            select(ConversationMember.id).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
        )
        if is_member is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this conversation",
            )

    def send_message(self, sender_id: int, data: SendMessageRequest) -> Message:
        conversation = self.db.get(Conversation, data.conversation_id)
        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        self._ensure_member(data.conversation_id, sender_id)

        message = Message(
            conversation_id=data.conversation_id,
            sender_id=sender_id,
            content=data.content,
            status=MessageStatus.SENT,
        )
        self.db.add(message)
        self.db.commit()

        return self.db.scalar(
            self._message_query().where(Message.id == message.id)
        )

    def list_messages(
        self,
        conversation_id: int,
        user_id: int,
    ) -> list[Message]:
        conversation = self.db.get(Conversation, conversation_id)
        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        self._ensure_member(conversation_id, user_id)

        return list(
            self.db.scalars(
                self._message_query()
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at.asc())
            ).all()
        )

    def mark_as_read(self, message_id: int, user_id: int) -> Message:
        message = self.db.scalar(
            self._message_query().where(Message.id == message_id)
        )
        if message is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found",
            )

        self._ensure_member(message.conversation_id, user_id)

        message.status = MessageStatus.READ
        message.read_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(message)
        return message
