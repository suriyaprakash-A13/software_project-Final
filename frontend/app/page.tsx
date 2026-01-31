'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-600 via-accent-600 to-primary-800">
      <div className="text-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto shadow-2xl" />
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-white/20 mx-auto" />
        </div>
        <p className="mt-6 text-xl font-bold text-white animate-pulse">Loading SmartSplit...</p>
      </div>
    </div>
  );
}
