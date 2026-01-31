'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api/groups';
import { settlementsApi } from '@/lib/api/settlements';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';

export default function SettlementsPage() {
  const [selectedGroup, setSelectedGroup] = useState('');
  const user = useAuthStore((state) => state.user);

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getAll({ limit: 100 }),
  });

  const { data: settlement, isLoading: settlementLoading } = useQuery({
    queryKey: ['settlement', selectedGroup],
    queryFn: () => settlementsApi.getGroupSettlement(selectedGroup),
    enabled: !!selectedGroup,
  });

  const { data: userBalance } = useQuery({
    queryKey: ['userBalance', selectedGroup, user?.id],
    queryFn: () =>
      settlementsApi.getUserBalance(selectedGroup, user?.id || ''),
    enabled: !!selectedGroup && !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settlements</h1>
        <p className="mt-2 text-gray-600">
          View optimized settlement transactions to balance debts
        </p>
      </div>

      {/* Group Selection */}
      <div className="rounded-lg bg-white p-4 shadow">
        <label className="block text-sm font-medium text-gray-700">
          Select Group
        </label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Choose a group to view settlements</option>
          {groupsData?.data.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <>
          {settlementLoading ? (
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto" />
            </div>
          ) : settlement ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow">
                  <p className="text-sm font-medium text-gray-600">Your Balance</p>
                  <p
                    className={`mt-2 text-3xl font-bold ${
                      (userBalance?.netBalance || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(userBalance?.netBalance || 0)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(userBalance?.netBalance || 0) >= 0
                      ? 'You are owed'
                      : 'You owe'}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {formatCurrency(userBalance?.totalPaid || 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                  <p className="text-sm font-medium text-gray-600">
                    Settlement Transactions
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {settlement.transactionCount}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Optimized from {settlement.netBalances.length} participants
                  </p>
                </div>
              </div>

              {/* Net Balances */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Net Balances
                </h2>
                <div className="space-y-3">
                  {settlement.netBalances.map((balance) => (
                    <div
                      key={balance.userId}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{balance.userName}</p>
                        <p className="text-sm text-gray-600">
                          {balance.balance >= 0 ? 'Should receive' : 'Should pay'}
                        </p>
                      </div>
                      <p
                        className={`text-xl font-bold ${
                          balance.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(Math.abs(balance.balance))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Transactions */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Optimized Transactions
                </h2>
                {settlement.settlements.length === 0 ? (
                  <p className="text-gray-600">All settled! No transactions needed.</p>
                ) : (
                  <div className="space-y-4">
                    {settlement.settlements.map((transaction, index) => (
                      <div
                        key={index}
                        className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="font-semibold text-gray-900">
                                {transaction.fromName}
                              </p>
                              <p className="text-xs text-gray-600">Pays</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-0.5 w-8 bg-primary-500"></div>
                              <span className="text-2xl">→</span>
                              <div className="h-0.5 w-8 bg-primary-500"></div>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-gray-900">
                                {transaction.toName}
                              </p>
                              <p className="text-xs text-gray-600">Receives</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-white px-4 py-2">
                            <p className="text-2xl font-bold text-primary-600">
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Algorithm Info */}
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <p className="font-semibold text-blue-900">
                      Smart Settlement Algorithm
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      This settlement plan uses an optimized greedy algorithm (O(n log n))
                      to minimize the number of transactions needed. Instead of everyone
                      paying everyone else, we calculate net balances and match creditors
                      with debtors efficiently.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
