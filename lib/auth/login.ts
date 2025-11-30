import { setSession, type UserSession } from './session';
import type { UserRole } from '@/types/canvas';

export async function loginWithEmail(email: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
  try {
    // Call backend API to authenticate with Canvas
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Login failed',
      };
    }

    const session: UserSession = {
      email: data.user.email,
      userId: data.user.id,
      role: data.user.role as UserRole,
      name: data.user.name,
    };

    setSession(session);

    return { success: true, session };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

// Get user ID from Canvas by email (simplified - in production use proper API)
export async function getUserIdByEmail(email: string): Promise<string | null> {
  // This would typically call your backend which queries Canvas
  // For now, return a mock ID based on email hash
  return '1'; // Placeholder
}

