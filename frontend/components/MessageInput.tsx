"use client";

import { FormEvent, useState } from "react";

type MessageInputProps = {
  onSend?: (message: string) => void;
  disabled?: boolean;
};

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setMessage("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-signal-border bg-white px-4 py-3"
    >
      <button
        type="button"
        aria-label="Attach file"
        className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-signal-muted transition-colors hover:bg-signal-hover hover:text-signal-text"
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
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      <div className="relative min-w-0 flex-1">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          placeholder="Message"
          rows={1}
          className="max-h-32 w-full resize-none rounded-2xl border border-signal-border bg-signal-input px-4 py-2.5 text-sm text-signal-text placeholder:text-signal-muted focus:border-signal-blue focus:outline-none focus:ring-1 focus:ring-signal-blue"
        />
      </div>

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        aria-label="Send message"
        className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal-blue text-white transition-colors hover:bg-signal-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
}
