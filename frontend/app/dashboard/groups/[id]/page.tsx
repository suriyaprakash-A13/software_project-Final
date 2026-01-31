'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { groupsApi } from '@/lib/api/groups';
import { expensesApi } from '@/lib/api/expenses';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', params.id],
    queryFn: () => groupsApi.getById(params.id),
  });

  const { data: expensesData } = useQuery({
    queryKey: ['groupExpenses', params.id],
    queryFn: () => expensesApi.getByGroup(params.id, { limit: 5 }),
  });

  const addMemberMutation = useMutation({
    mutationFn: (email: string) =>
      groupsApi.addMember(params.id, { userEmail: email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', params.id] });
      setShowAddMemberModal(false);
      setMemberEmail('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => groupsApi.removeMember(params.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', params.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => groupsApi.delete(params.id),
    onSuccess: () => {
      router.push('/dashboard/groups');
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberEmail.trim()) {
      addMemberMutation.mutate(memberEmail.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const isOwner = group.role === 'OWNER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/groups"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            ← Back to Groups
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{group.name}</h1>
          <p className="mt-1 text-gray-600">
            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          {isOwner && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
            >
              Delete Group
            </button>
          )}
          <Link
            href={`/dashboard/expenses/new?groupId=${params.id}`}
            className="rounded-lg bg-primary-600 px-6 py-2 font-medium text-white hover:bg-primary-700"
          >
            Add Expense
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Total Expenses</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {expensesData?.pagination.total || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Your Role</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{group.role}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-600">Created</p>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatDate(group.createdAt)}
          </p>
        </div>
      </div>

      {/* Members */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Members</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              + Add Member
            </button>
          )}
        </div>
        <div className="space-y-3">
          {group.memberships.map((membership) => (
            <div
              key={membership.userId}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                {membership.user.avatar && (
                  <img
                    src={membership.user.avatar}
                    alt={membership.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{membership.user.name}</p>
                  <p className="text-sm text-gray-600">{membership.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    membership.role === 'OWNER'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {membership.role}
                </span>
                {isOwner && membership.role !== 'OWNER' && (
                  <button
                    onClick={() => removeMemberMutation.mutate(membership.userId)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
          <Link
            href={`/dashboard/expenses?groupId=${params.id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View All →
          </Link>
        </div>
        {expensesData?.data.length === 0 ? (
          <p className="text-gray-600">No expenses yet</p>
        ) : (
          <div className="space-y-3">
            {expensesData?.data.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">{expense.description}</p>
                  <p className="text-sm text-gray-600">
                    Paid by {expense.payer.name} · {formatDate(expense.createdAt)}
                  </p>
                </div>
                <p className="font-bold text-gray-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Add Member</h2>
            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member Email
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>
              {addMemberMutation.isError && (
                <p className="text-sm text-red-600">
                  Failed to add member. Make sure the email is registered.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setMemberEmail('');
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Delete Group?</h2>
            <p className="mt-2 text-gray-600">
              This will permanently delete the group and all its expenses. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
