// Simple cookie utilities for storing user state client-side
// Avoids database checks on every page visit

const COOKIE_NAME = "kvitty_user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface UserCookie {
  slug: string;
  name?: string;
}

export function setUserCookie(data: UserCookie) {
  const value = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getUserCookie(): UserCookie | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

export function clearUserCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
