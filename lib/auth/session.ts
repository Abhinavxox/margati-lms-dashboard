'use client';

export interface UserSession {
  email: string;
  userId: string;
  role: 'student' | 'teacher' | 'advisor';
  name: string;
}

const SESSION_KEY = 'canvas_user_session';

export function setSession(session: UserSession) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getSession(): UserSession | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
  return null;
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

