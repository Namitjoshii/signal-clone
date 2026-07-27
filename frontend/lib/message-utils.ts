import type { MessageResponse } from "@/lib/messages-api";
import type { Message } from "@/lib/dummy-data";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function mapMessageToListItem(
  message: MessageResponse,
  currentUserId: number,
): Message {
  return {
    id: String(message.id),
    content: message.content,
    timestamp: formatTimestamp(message.created_at),
    isSent: message.sender.id === currentUserId,
  };
}
