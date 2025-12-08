// Simple authentication system for admin panel
// In production, use a proper authentication system (NextAuth, etc.)

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Opusweb"; // Change this in production!

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function setAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('admin_authenticated', 'true');
  }
}

export function checkAdminSession(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  }
  return false;
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin_authenticated');
  }
}

