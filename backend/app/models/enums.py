import enum


class ConversationType(str, enum.Enum):
    DIRECT = "direct"
    GROUP = "group"


class MessageStatus(str, enum.Enum):
    SENDING = "sending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
