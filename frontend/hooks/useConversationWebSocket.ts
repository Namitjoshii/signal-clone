"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MessageResponse } from "@/lib/messages-api";
import {
  createWebSocketSendPayload,
  getConversationWebSocketUrl,
  parseWebSocketServerEvent,
} from "@/lib/chat-websocket";

const MAX_RECONNECT_DELAY_MS = 30_000;

type UseConversationWebSocketOptions = {
  conversationId: number | null;
  userId: number | null;
  onMessage: (message: MessageResponse) => void;
};

export function useConversationWebSocket({
  conversationId,
  userId,
  onMessage,
}: UseConversationWebSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (conversationId === null || userId === null) {
      return;
    }

    const activeConversationId = conversationId;
    const activeUserId = userId;

    let reconnectAttempt = 0;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let intentionalClose = false;

    function clearReconnectTimeout() {
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    }

    function connect() {
      clearReconnectTimeout();

      const socket = new WebSocket(
        getConversationWebSocketUrl(activeConversationId, activeUserId),
      );
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttempt = 0;
      };

      socket.onmessage = (event) => {
        const payload = parseWebSocketServerEvent(String(event.data));
        if (payload?.type === "message") {
          onMessageRef.current(payload.message);
        }
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (intentionalClose) {
          return;
        }

        const delay = Math.min(
          1000 * 2 ** reconnectAttempt,
          MAX_RECONNECT_DELAY_MS,
        );
        reconnectAttempt += 1;
        reconnectTimeout = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      intentionalClose = true;
      clearReconnectTimeout();

      const socket = socketRef.current;
      socketRef.current = null;

      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };
  }, [conversationId, userId]);

  const sendMessage = useCallback((content: string): boolean => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(createWebSocketSendPayload(content));
    return true;
  }, []);

  return { sendMessage };
}
