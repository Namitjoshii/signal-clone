import type { UserResponse } from "@/lib/auth-api";
import { getToken, getUserId } from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export type MessageResponse = {
  id: number;
  sender: UserResponse;
  content: string;
  status: MessageStatus;
  created_at: string;
};

export class MessagesApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "MessagesApiError";
  }
}

async function parseErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string | { msg?: string }[];
    };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      return data.detail[0].msg;
    }
  } catch {
    // Fall back to generic message below.
  }

  return fallback;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const userId = getUserId();

  if (!token || userId === null) {
    throw new MessagesApiError(401, "Not authenticated");
  }

  return {
    Authorization: `Bearer ${token}`,
    "X-User-Id": String(userId),
  };
}

export async function fetchMessages(
  conversationId: number,
): Promise<MessageResponse[]> {
  const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new MessagesApiError(
      response.status,
      await parseErrorMessage(response, "Failed to load messages."),
    );
  }

  return response.json() as Promise<MessageResponse[]>;
}

export async function sendMessage(
  conversationId: number,
  content: string,
): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      content,
    }),
  });

  if (!response.ok) {
    throw new MessagesApiError(
      response.status,
      await parseErrorMessage(response, "Failed to send message."),
    );
  }

  return response.json() as Promise<MessageResponse>;
}
