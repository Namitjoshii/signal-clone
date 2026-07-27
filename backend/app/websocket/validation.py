from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Conversation, ConversationMember, User


def validate_connection(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> str | None:
    if db.get(Conversation, conversation_id) is None:
        return "Conversation not found"

    if db.get(User, user_id) is None:
        return "User not found"

    is_member = db.scalar(
        select(ConversationMember.id).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == user_id,
        )
    )
    if is_member is None:
        return "Not a member of this conversation"

    return None
