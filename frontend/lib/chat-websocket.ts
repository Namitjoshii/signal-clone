import type { MessageResponse } from "@/lib/messages-api";

export const WS_BASE_URL = "ws://127.0.0.1:8000";

export type WebSocketConnectedEvent = {
  type: "connected";
  conversation_id: number;
  user_id: number;
  connected_users: number[];
};

export type WebSocketMessageEvent = {
  type: "message";
  message: MessageResponse;
};

export type WebSocketServerEvent =
  | WebSocketConnectedEvent
  | WebSocketMessageEvent;

export function getConversationWebSocketUrl(
  conversationId: number,
  userId: number,
): string {
  return `${WS_BASE_URL}/ws/${conversationId}/${userId}`;
}

export function parseWebSocketServerEvent(
  data: string,
): WebSocketServerEvent | null {
  try {
    const parsed = JSON.parse(data) as WebSocketServerEvent;

    if (parsed.type === "connected" || parsed.type === "message") {
      return parsed;
    }
  } catch {
    // Ignore malformed payloads.
  }

  return null;
}

export function createWebSocketSendPayload(content: string): string {
  return JSON.stringify({ content });
}
