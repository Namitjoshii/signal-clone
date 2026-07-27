"use client";

import { useCallback, useEffect, useState } from "react";
import type { Conversation, Message } from "@/lib/dummy-data";
import { useConversationWebSocket } from "@/hooks/useConversationWebSocket";
import { mapMessageToListItem } from "@/lib/message-utils";
import {
  fetchMessages,
  type MessageResponse,
} from "@/lib/messages-api";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

type ChatWindowProps = {
  conversation: Conversation | null;
  conversationId: number | null;
  userId: number | null;
  onBack?: () => void;
  showBackButton?: boolean;
};

export default function ChatWindow({
  conversation,
  conversationId,
  userId,
  onBack,
  showBackButton,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const appendMessage = useCallback(
    (message: MessageResponse) => {
      if (userId === null) {
        return;
      }

      const mapped = mapMessageToListItem(message, userId);
      setMessages((current) => {
        if (current.some((item) => item.id === mapped.id)) {
          return current;
        }

        return [...current, mapped];
      });
    },
    [userId],
  );

  const { sendMessage: sendWebSocketMessage } = useConversationWebSocket({
    conversationId,
    userId,
    onMessage: appendMessage,
  });

  const loadMessages = useCallback(async () => {
    if (conversationId === null) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    setMessagesError("");

    try {
      const data = await fetchMessages(conversationId);
      if (userId === null) {
        setMessages([]);
        return;
      }

      setMessages(data.map((message) => mapMessageToListItem(message, userId)));
    } catch (error) {
      setMessages([]);
      setMessagesError(
        error instanceof Error ? error.message : "Failed to load messages.",
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-signal-chat-bg px-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-signal-blue/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-signal-blue"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-signal-text">
          Select a conversation
        </h2>
        <p className="mt-1 max-w-xs text-sm text-signal-muted">
          Choose a chat from the sidebar to start messaging.
        </p>
      </div>
    );
  }

  function handleSend(content: string) {
    if (conversationId === null || isSending) {
      return;
    }

    setIsSending(true);
    setMessagesError("");

    const sent = sendWebSocketMessage(content);

    if (!sent) {
      setMessagesError("Failed to send message.");
    }

    setIsSending(false);
  }

  return (
    <div className="flex flex-1 flex-col bg-signal-chat-bg">
      <ChatHeader
        name={conversation.name}
        avatar={conversation.avatar}
        isOnline={conversation.isOnline}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {isLoadingMessages ? (
            <p className="py-8 text-center text-sm text-signal-muted">
              Loading messages...
            </p>
          ) : messagesError && messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-red-600">
              {messagesError}
            </p>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-signal-muted">
              No messages yet. Say hello!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                    message.isSent
                      ? "rounded-br-md bg-signal-blue text-white"
                      : "rounded-bl-md bg-white text-signal-text"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      message.isSent ? "text-blue-100" : "text-signal-muted"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {messagesError && messages.length > 0 ? (
        <p className="border-t border-signal-border bg-red-50 px-4 py-2 text-center text-sm text-red-600">
          {messagesError}
        </p>
      ) : null}

      <MessageInput onSend={handleSend} disabled={isSending} />
    </div>
  );
}
