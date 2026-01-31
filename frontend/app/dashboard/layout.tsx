'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { setUser, clearUser, user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (isError) {
      clearUser();
      router.push('/login');
    }
  }, [data, isError, setUser, clearUser, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/30">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-white via-white to-primary-50/30 shadow-2xl border-r border-primary-100/50">
        <div className="flex h-16 items-center justify-center border-b border-primary-100/50 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
          <h1 className="text-2xl font-bold text-white">SmartSplit</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-accent-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
                <span className="font-semibold">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/groups"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-accent-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
                <span className="font-semibold">Groups</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/expenses"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-accent-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
                <span className="font-semibold">Expenses</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settlements"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-accent-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">💸</span>
                <span className="font-semibold">Settlements</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/analytics"
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-500 hover:to-accent-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">📈</span>
                <span className="font-semibold">Analytics</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-primary-100/50 glass-card shadow-lg">
          <div className="px-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-md">
              SS
            </div>
          </div>
          <div className="flex items-center gap-4 px-6">
            {user && (
              <>
                <span className="text-sm font-semibold text-gray-700">
                  {user.name}
                </span>
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-2 border-primary-300 shadow-md hover:scale-110 transition-transform duration-300"
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
