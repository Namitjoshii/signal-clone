const TOKEN_KEY = "token";
const USER_ID_KEY = "user_id";

export function storeAuth(token: string, userId: number): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, String(userId));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserId(): number | null {
  const value = localStorage.getItem(USER_ID_KEY);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
