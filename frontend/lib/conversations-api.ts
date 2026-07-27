import type { UserResponse } from "@/lib/auth-api";
import { getToken, getUserId } from "@/lib/auth-storage";

const API_BASE_URL = "http://127.0.0.1:8000";

export type ConversationType = "direct" | "group";

export type ConversationMemberResponse = {
  id: number;
  user_id: number;
  is_admin: boolean;
  joined_at: string;
  user: UserResponse;
};

export type ConversationResponse = {
  id: number;
  type: ConversationType;
  name: string | null;
  created_at: string;
  members: ConversationMemberResponse[];
};

export class ConversationsApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ConversationsApiError";
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
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

  return "Failed to load conversations. Please try again.";
}

export async function fetchConversations(): Promise<ConversationResponse[]> {
  const token = getToken();
  const userId = getUserId();

  if (!token || userId === null) {
    throw new ConversationsApiError(401, "Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-User-Id": String(userId),
    },
  });

  if (!response.ok) {
    throw new ConversationsApiError(
      response.status,
      await parseErrorMessage(response),
    );
  }

  return response.json() as Promise<ConversationResponse[]>;
}
