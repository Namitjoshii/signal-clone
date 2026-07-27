from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Conversation, ConversationMember, ConversationType, User
from app.schemas.conversation import (
    CreateDirectConversationRequest,
    CreateGroupConversationRequest,
)


class ConversationService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _conversation_query(self):
        return select(Conversation).options(
            selectinload(Conversation.members).selectinload(ConversationMember.user)
        )

    def _get_user(self, user_id: int) -> User:
        user = self.db.get(User, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

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

    def _find_direct_conversation(
        self,
        user_id: int,
        other_user_id: int,
    ) -> Conversation | None:
        conversations = self.db.scalars(
            self._conversation_query()
            .join(ConversationMember)
            .where(
                Conversation.type == ConversationType.DIRECT,
                ConversationMember.user_id.in_([user_id, other_user_id]),
            )
        ).unique().all()

        for conversation in conversations:
            member_ids = {member.user_id for member in conversation.members}
            if member_ids == {user_id, other_user_id}:
                return conversation
        return None

    def list_conversations(self, user_id: int) -> list[Conversation]:
        return list(
            self.db.scalars(
                self._conversation_query()
                .join(ConversationMember)
                .where(ConversationMember.user_id == user_id)
                .order_by(Conversation.created_at.desc())
            ).unique().all()
        )

    def create_direct_conversation(
        self,
        current_user_id: int,
        data: CreateDirectConversationRequest,
    ) -> tuple[Conversation, bool]:
        if data.user_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create a direct conversation with yourself",
            )

        self._get_user(data.user_id)

        existing = self._find_direct_conversation(current_user_id, data.user_id)
        if existing is not None:
            return existing, False

        conversation = Conversation(type=ConversationType.DIRECT)
        self.db.add(conversation)
        self.db.flush()

        self.db.add_all(
            [
                ConversationMember(
                    conversation_id=conversation.id,
                    user_id=current_user_id,
                ),
                ConversationMember(
                    conversation_id=conversation.id,
                    user_id=data.user_id,
                ),
            ]
        )
        self.db.commit()

        created = self.db.scalar(
            self._conversation_query().where(Conversation.id == conversation.id)
        )
        return created, True

    def create_group_conversation(
        self,
        creator_id: int,
        data: CreateGroupConversationRequest,
    ) -> Conversation:
        member_ids = set(data.member_ids)
        member_ids.discard(creator_id)

        if not member_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group must include at least one other member",
            )

        users = self.db.scalars(
            select(User).where(User.id.in_(member_ids))
        ).all()
        if len(users) != len(member_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more members not found",
            )

        conversation = Conversation(
            type=ConversationType.GROUP,
            name=data.name,
        )
        self.db.add(conversation)
        self.db.flush()

        members = [
            ConversationMember(
                conversation_id=conversation.id,
                user_id=creator_id,
                is_admin=True,
            )
        ]
        members.extend(
            ConversationMember(
                conversation_id=conversation.id,
                user_id=member_id,
            )
            for member_id in member_ids
        )
        self.db.add_all(members)
        self.db.commit()

        created = self.db.scalar(
            self._conversation_query().where(Conversation.id == conversation.id)
        )
        return created

    def get_conversation(
        self,
        conversation_id: int,
        user_id: int,
    ) -> Conversation:
        conversation = self.db.scalar(
            self._conversation_query().where(Conversation.id == conversation_id)
        )
        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        self._ensure_member(conversation_id, user_id)
        return conversation
