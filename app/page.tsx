'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only access localStorage on client side
    const userSession = getSession();
    setSession(userSession);
    setIsLoading(false);

    if (userSession) {
      // Redirect to appropriate dashboard based on role
      router.push(`/dashboard/${userSession.role}`);
    } else {
      // Redirect to sign in
      router.push('/signin');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

