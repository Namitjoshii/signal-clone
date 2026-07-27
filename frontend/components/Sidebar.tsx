"use client";

import { useMemo, useState } from "react";
import type { Conversation } from "@/lib/dummy-data";
import ConversationItem from "./ConversationItem";

type SidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  error?: string;
};

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  isLoading = false,
  error = "",
}: SidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.lastMessage.toLowerCase().includes(query),
    );
  }, [conversations, search]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-signal-border bg-white md:w-80 lg:w-96">
      <div className="border-b border-signal-border px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-signal-text">Chats</h1>
          <button
            type="button"
            aria-label="New chat"
            className="flex h-9 w-9 items-center justify-center rounded-full text-signal-muted transition-colors hover:bg-signal-hover hover:text-signal-text"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-signal-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="w-full rounded-lg border border-signal-border bg-signal-input py-2.5 pl-10 pr-4 text-sm text-signal-text placeholder:text-signal-muted focus:border-signal-blue focus:outline-none focus:ring-1 focus:ring-signal-blue"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-signal-muted">
            Loading conversations...
          </p>
        ) : error ? (
          <p className="px-4 py-8 text-center text-sm text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-signal-muted">
            {search.trim() ? "No conversations found" : "No conversations yet"}
          </p>
        ) : (
          filtered.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              name={conversation.name}
              avatar={conversation.avatar}
              lastMessage={conversation.lastMessage}
              timestamp={conversation.timestamp}
              unreadCount={conversation.unreadCount}
              isOnline={conversation.isOnline}
              isActive={conversation.id === activeId}
              onClick={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
