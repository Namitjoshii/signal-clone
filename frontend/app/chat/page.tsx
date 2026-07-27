"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { mapConversationToListItem } from "@/lib/conversation-utils";
import {
  ConversationsApiError,
  fetchConversations,
  type ConversationResponse,
} from "@/lib/conversations-api";
import { getToken, getUserId } from "@/lib/auth-storage";

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    [],
  );
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationResponse | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    const currentUserId = getUserId();

    if (!token || currentUserId === null) {
      router.push("/login");
      return;
    }

    setUserId(currentUserId);

    let cancelled = false;

    async function loadConversations() {
      try {
        const data = await fetchConversations();
        if (cancelled) {
          return;
        }

        setConversations(data);
        setError("");
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (
          loadError instanceof ConversationsApiError &&
          loadError.status === 401
        ) {
          router.push("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load conversations.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadConversations();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const sidebarConversations = useMemo(() => {
    if (userId === null) {
      return [];
    }

    return conversations.map((conversation) =>
      mapConversationToListItem(conversation, userId),
    );
  }, [conversations, userId]);

  const activeConversation = useMemo(() => {
    if (!selectedConversation || userId === null) {
      return null;
    }

    return mapConversationToListItem(selectedConversation, userId);
  }, [selectedConversation, userId]);

  function handleSelect(id: string) {
    const conversation =
      conversations.find((item) => String(item.id) === id) ?? null;

    setSelectedConversation(conversation);
    setMobileView("chat");
  }

  function handleBack() {
    setMobileView("list");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div
        className={`h-full shrink-0 ${
          mobileView === "list" ? "flex w-full" : "hidden md:flex"
        } md:w-80 lg:w-96`}
      >
        <Sidebar
          conversations={sidebarConversations}
          activeId={
            selectedConversation ? String(selectedConversation.id) : null
          }
          onSelect={handleSelect}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <div
        className={`min-w-0 flex-1 ${
          mobileView === "chat" ? "flex" : "hidden md:flex"
        }`}
      >
        <ChatWindow
          key={selectedConversation?.id ?? "empty"}
          conversation={activeConversation}
          conversationId={selectedConversation?.id ?? null}
          userId={userId}
          onBack={handleBack}
          showBackButton={mobileView === "chat"}
        />
      </div>
    </div>
  );
}
