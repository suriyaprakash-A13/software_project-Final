'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { expensesApi } from '@/lib/api/expenses';
import { groupsApi } from '@/lib/api/groups';
import { formatCurrency, formatDate, getCategoryColor, getCategoryLabel } from '@/lib/utils';

export default function ExpensesPage() {
  const searchParams = useSearchParams();
  const [selectedGroup, setSelectedGroup] = useState(searchParams.get('groupId') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll({ limit: 100 }),
  });

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', selectedGroup, selectedCategory, page],
    queryFn: () =>
      expensesApi.getAll({
        groupId: selectedGroup || undefined,
        category: selectedCategory || undefined,
        page,
        limit: 20,
      }),
  });

  const categories = [
    'FOOD',
    'TRANSPORTATION',
    'ACCOMMODATION',
    'ENTERTAINMENT',
    'UTILITIES',
    'GROCERIES',
    'HEALTHCARE',
    'SHOPPING',
    'OTHER',
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Expenses 💰</h1>
          <p className="mt-3 text-lg text-gray-600 font-medium">Track and manage all expenses</p>
        </div>
        <Link
          href="/dashboard/expenses/new"
          className="btn-primary"
        >
          + Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl glass-card p-6 shadow-xl border border-primary-100/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary-500 focus:outline-none transition-all duration-300"
            >
              <option value="">All Groups</option>
              {groupsData?.data.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary-500 focus:outline-none transition-all duration-300"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
        </div>
      ) : expensesData?.data.length === 0 ? (
        <div className="rounded-2xl glass-card p-16 text-center shadow-xl border border-primary-100/50">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600 text-lg font-medium">No expenses found. Add your first expense!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {expensesData?.data.map((expense, index) => (
              <div key={expense.id} className="group rounded-2xl glass-card p-6 shadow-xl border border-primary-100/50 hover:shadow-2xl transition-all duration-300 hover:scale-102 animate-slide-up" style={{ animationDelay: `${0.2 + index * 0.05}s` }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      💰
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">
                          {expense.description}
                        </h3>
                        <span
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-md ${getCategoryColor(
                            expense.category
                          )}`}
                        >
                          {getCategoryLabel(expense.category)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm text-gray-600 font-medium flex-wrap">
                        <span className="text-primary-600 font-semibold">{expense.payer.name}</span>
                        {expense.group && (
                          <>
                            <span>·</span>
                            <span>{expense.group.name}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatDate(expense.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {expensesData && expensesData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border-2 border-primary-200 bg-white px-6 py-3 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-400 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Previous
              </button>
              <span className="flex items-center px-4 font-semibold text-gray-700">
                Page {page} of {expensesData.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= expensesData.pagination.totalPages}
                className="rounded-xl border-2 border-primary-200 bg-white px-6 py-3 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-400 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
