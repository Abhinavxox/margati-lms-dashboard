'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '@/lib/auth/session';
import { User, LogOut } from 'lucide-react';

export default function DashboardHeader() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Only access localStorage on client side
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/signin');
  };

  if (!session) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Canvas Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="w-5 h-5" />
              <span className="font-medium">{session.name}</span>
              <span className="text-gray-500">({session.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

