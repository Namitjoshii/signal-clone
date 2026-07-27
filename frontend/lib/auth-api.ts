const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export type UserResponse = {
  id: number;
  username: string;
  phone: string;
  display_name: string;
  avatar: string | null;
  online: boolean;
  last_seen: string | null;
  created_at: string;
};

export type LoginResponse = {
  user: UserResponse;
  token: string;
};

export class AuthApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AuthApiError";
  }
}

function formatPhone(phoneDigits: string): string {
  return `+1${phoneDigits}`;
}

function buildRegisterPayload(phoneDigits: string, otp: string) {
  const phone = formatPhone(phoneDigits);

  return {
    username: `user_${phoneDigits}`,
    phone,
    display_name: phone,
    otp,
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string | { msg?: string }[] };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      return data.detail[0].msg;
    }
  } catch {
    // Fall back to generic message below.
  }

  return "Authentication failed. Please try again.";
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AuthApiError(response.status, await parseErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

export async function login(
  phoneDigits: string,
  otp: string,
): Promise<LoginResponse> {
  return postJson<LoginResponse>("/auth/login", {
    phone: formatPhone(phoneDigits),
    otp,
  });
}

export async function register(
  phoneDigits: string,
  otp: string,
): Promise<UserResponse> {
  return postJson<UserResponse>(
    "/auth/register",
    buildRegisterPayload(phoneDigits, otp),
  );
}

export async function authenticate(
  phoneDigits: string,
  otp: string,
): Promise<LoginResponse> {
  try {
    return await login(phoneDigits, otp);
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 404) {
      throw error;
    }

    await register(phoneDigits, otp);
    return login(phoneDigits, otp);
  }
}
