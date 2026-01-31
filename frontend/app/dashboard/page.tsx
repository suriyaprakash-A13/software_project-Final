'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { groupsApi } from '@/lib/api/groups';
import { expensesApi } from '@/lib/api/expenses';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll({ limit: 5 }),
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['recentExpenses'],
    queryFn: () => expensesApi.getAll({ limit: 5 }),
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-3 text-lg text-gray-600 font-medium">
          Here's your expense overview for today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group rounded-2xl glass-card p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up border border-primary-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Groups</p>
              <p className="mt-2 text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {groupsData?.pagination.total || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">Active groups</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl glass-card p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up border border-success-500/20" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total Expenses</p>
              <p className="mt-2 text-4xl font-extrabold bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent">
                {expensesData?.pagination.total || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">Tracked expenses</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-success-500 to-success-600 p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl glass-card p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up border border-warning-500/20" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Active This Month</p>
              <p className="mt-2 text-4xl font-extrabold bg-gradient-to-r from-warning-500 to-warning-600 bg-clip-text text-transparent">
                {groupsData?.data.length || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">Monthly activity</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-warning-500 to-warning-600 p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Groups */}
      <div className="rounded-2xl glass-card p-8 shadow-xl border border-primary-100/50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Your Groups</h2>
          <Link
            href="/dashboard/groups"
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-accent-600 transition-colors duration-300 group"
          >
            View All 
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
        {groupsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : groupsData?.data.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 font-medium">No groups yet. Create your first group!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupsData?.data.map((group) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className="group flex items-center justify-between rounded-xl border-2 border-transparent bg-gradient-to-r from-white to-primary-50/30 p-5 hover:border-primary-300 hover:shadow-lg transition-all duration-300 hover:scale-102"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{group.name}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {group.memberCount} members · <span className="text-primary-600">{group.role}</span>
                    </p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400 group-hover:text-primary-600 group-hover:translate-x-2 transition-all duration-300">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="rounded-2xl glass-card p-8 shadow-xl border border-primary-100/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Recent Expenses</h2>
          <Link
            href="/dashboard/expenses"
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-accent-600 transition-colors duration-300 group"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
        {expensesLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : expensesData?.data.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-gray-600 font-medium">No expenses yet. Add your first expense!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expensesData?.data.map((expense) => (
              <div
                key={expense.id}
                className="group flex items-center justify-between rounded-xl border-2 border-transparent bg-gradient-to-r from-white to-success-50/30 p-5 hover:border-success-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center text-white text-xl shadow-md">
                    💰
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{expense.description}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      <span className="text-primary-600">{expense.payer.name}</span> · {formatDate(expense.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-extrabold bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/groups/new"
          className="flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-gray-600 hover:border-primary-500 hover:text-primary-600"
        >
          <span className="text-2xl">+</span>
          <span className="font-medium">Create New Group</span>
        </Link>
        <Link
          href="/dashboard/expenses/new"
          className="flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-gray-600 hover:border-primary-500 hover:text-primary-600"
        >
          <span className="text-2xl">+</span>
          <span className="font-medium">Add Expense</span>
        </Link>
      </div>
    </div>
  );
}
