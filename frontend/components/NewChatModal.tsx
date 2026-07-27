"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createDirectConversation,
  ConversationsApiError,
  type ConversationResponse,
} from "@/lib/conversations-api";
import { fetchUsers, UsersApiError, type UserListResponse } from "@/lib/users-api";

type NewChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: ConversationResponse) => void;
  existingConversations: ConversationResponse[];
  currentUserId: number | null;
};

export default function NewChatModal({
  isOpen,
  onClose,
  onConversationCreated,
  existingConversations,
  currentUserId,
}: NewChatModalProps) {
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [creatingUserId, setCreatingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSearch("");
    setError("");
    setIsLoading(true);

    let cancelled = false;

    async function loadUsers() {
      try {
        const data = await fetchUsers();
        if (cancelled) {
          return;
        }
        setUsers(data.filter((user) => user.id !== currentUserId));
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load users.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [isOpen, currentUserId]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.display_name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query),
    );
  }, [users, search]);

  function findExistingDirectConversation(
    targetUserId: number,
  ): ConversationResponse | null {
    return (
      existingConversations.find(
        (conversation) =>
          conversation.type === "direct" &&
          conversation.members.some(
            (member) => member.user_id === targetUserId,
          ),
      ) ?? null
    );
  }

  async function handleSelectUser(targetUserId: number) {
    const existing = findExistingDirectConversation(targetUserId);
    if (existing) {
      onConversationCreated(existing);
      return;
    }

    setCreatingUserId(targetUserId);
    setError("");

    try {
      const conversation = await createDirectConversation(targetUserId);
      onConversationCreated(conversation);
    } catch (createError) {
      setError(
        createError instanceof ConversationsApiError ||
          createError instanceof UsersApiError ||
          createError instanceof Error
          ? createError.message
          : "Failed to start conversation. Please try again.",
      );
    } finally {
      setCreatingUserId(null);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-signal-border px-4 py-4">
          <h2 className="text-lg font-bold text-signal-text">New chat</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-signal-muted transition-colors hover:bg-signal-hover hover:text-signal-text"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-signal-border px-4 py-3">
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
              placeholder="Search people"
              autoFocus
              className="w-full rounded-lg border border-signal-border bg-signal-input py-2.5 pl-10 pr-4 text-sm text-signal-text placeholder:text-signal-muted focus:border-signal-blue focus:outline-none focus:ring-1 focus:ring-signal-blue"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-signal-muted">
              Loading people...
            </p>
          ) : error ? (
            <p className="px-4 py-8 text-center text-sm text-red-600">
              {error}
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-signal-muted">
              {search.trim() ? "No people found" : "No other users yet"}
            </p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={creatingUserId !== null}
                onClick={() => handleSelectUser(user.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal-blue/10 text-sm font-semibold text-signal-blue">
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-signal-text">
                    {user.display_name}
                  </p>
                  <p className="truncate text-xs text-signal-muted">
                    @{user.username}
                  </p>
                </div>
                {creatingUserId === user.id && (
                  <span className="text-xs text-signal-muted">Starting...</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}