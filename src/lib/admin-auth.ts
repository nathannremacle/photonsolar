// Client-side only. For API routes use @/lib/admin-auth-server (uses Node.js fs/crypto).

/** Set admin session in sessionStorage (UI state only; real auth is cookie). */
export function setAdminSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admin_authenticated", "true");
  }
}

/** Check if admin session is set in sessionStorage. */
export function checkAdminSession(): boolean {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("admin_authenticated") === "true";
  }
  return false;
}

/** Clear admin session from sessionStorage. */
export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("admin_authenticated");
  }
}
