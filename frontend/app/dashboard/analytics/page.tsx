'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';
import { formatCurrency, getCategoryColor, getCategoryLabel } from '@/lib/utils';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthlyAnalytics', selectedYear],
    queryFn: () => analyticsApi.getMonthly({ year: selectedYear }),
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['categoryAnalytics'],
    queryFn: () => analyticsApi.getCategories({}),
  });

  const { data: userSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['userSummary'],
    queryFn: analyticsApi.getUserSummary,
  });

  const categoryColors: Record<string, string> = {
    FOOD: '#FF6384',
    TRANSPORTATION: '#36A2EB',
    ACCOMMODATION: '#FFCE56',
    ENTERTAINMENT: '#4BC0C0',
    UTILITIES: '#9966FF',
    GROCERIES: '#FF9F40',
    HEALTHCARE: '#FF6384',
    SHOPPING: '#C9CBCF',
    OTHER: '#4BC0C0',
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Visualize your spending patterns and trends
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* User Summary Cards */}
      {summaryLoading ? (
        <div className="text-center">
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
                userSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
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

      {/* Monthly Spending Chart */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Monthly Spending - {selectedYear}
        </h2>
        {monthlyLoading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : monthlyData && monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="total" fill="#8b5cf6" name="Total Amount" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-80 items-center justify-center text-gray-600">
            No data available for {selectedYear}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Category Breakdown
          </h2>
          {categoryLoading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : categoryData && categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${getCategoryLabel(entry.category)} (${entry.percentage}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.category] || '#999'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-80 items-center justify-center text-gray-600">
              No category data available
            </div>
          )}
        </div>

        {/* Category List */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Category Details
          </h2>
          {categoryLoading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : categoryData && categoryData.length > 0 ? (
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: categoryColors[cat.category] || '#999' }}
                    ></div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getCategoryLabel(cat.category)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cat.count} expense{cat.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(cat.total)}
                    </p>
                    <p className="text-sm text-gray-600">{cat.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center text-gray-600">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Top Categories */}
      {userSummary && userSummary.topCategories.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Your Top Categories</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {userSummary.topCategories.map((cat, index) => (
              <div
                key={cat.category}
                className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4 text-center"
              >
                <div className="text-3xl font-bold text-primary-600">#{index + 1}</div>
                <p className="mt-2 font-semibold text-gray-900">
                  {getCategoryLabel(cat.category)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {formatCurrency(cat.total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
