'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';

export default function AnalyticsPage() {
  // For now, we'll only show user summary
  // Monthly and category analytics require a group to be selected
  // These would typically be shown on a group-specific page

  const { data: userSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['userSummary'],
    queryFn: () => analyticsApi.getUserSummary(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Your spending summary and insights
          </p>
        </div>
      </div>

      {/* User Summary Cards */}
      {summaryLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
        </div>
      ) : userSummary ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-600">Total Paid</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(userSummary.totalPaid)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-600">Net Balance</p>
            <p
              className={`mt-2 text-3xl font-bold ${
                parseFloat(userSummary.netBalance) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(userSummary.netBalance)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {userSummary.expenseCount}
            </p>
          </div>
        </div>
      ) : null}

      {/* Top Categories */}
      {userSummary && userSummary.topCategories && userSummary.topCategories.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Your Top Categories</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userSummary.topCategories.map((cat, index) => (
              <div
                key={cat.category}
                className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary-600">#{index + 1}</div>
                  <div className="text-sm text-gray-600">{cat.percentage}%</div>
                </div>
                <p className="mt-2 font-semibold text-gray-900">
                  {getCategoryLabel(cat.category)}
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {formatCurrency(cat.totalExpenses)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Group-Specific Analytics</h3>
            <p className="mt-1 text-sm text-blue-800">
              To view detailed monthly spending charts and category breakdowns, visit a specific group's page and navigate to its analytics section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
