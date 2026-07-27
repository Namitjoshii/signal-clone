import type { ConversationResponse } from "@/lib/conversations-api";
import type { Conversation } from "@/lib/dummy-data";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (dayDiff === 1) {
    return "Yesterday";
  }

  if (dayDiff < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getOtherMember(
  conversation: ConversationResponse,
  currentUserId: number,
) {
  return conversation.members.find(
    (member) => member.user_id !== currentUserId,
  );
}

export function getConversationDisplayName(
  conversation: ConversationResponse,
  currentUserId: number,
): string {
  if (conversation.type === "group") {
    return conversation.name?.trim() || "Group Chat";
  }

  return (
    getOtherMember(conversation, currentUserId)?.user.display_name ||
    "Direct Chat"
  );
}

export function mapConversationToListItem(
  conversation: ConversationResponse,
  currentUserId: number,
): Conversation {
  const name = getConversationDisplayName(conversation, currentUserId);
  const otherMember = getOtherMember(conversation, currentUserId);

  return {
    id: String(conversation.id),
    name,
    avatar: getInitials(name),
    lastMessage: "",
    timestamp: formatTimestamp(conversation.created_at),
    isOnline:
      conversation.type === "direct" ? otherMember?.user.online : undefined,
    messages: [],
  };
}
