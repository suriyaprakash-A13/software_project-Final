'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { groupsApi } from '@/lib/api/groups';

export default function GroupsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['groups', search, page],
    queryFn: () => groupsApi.getAll({ search, page, limit: 12 }),
  });

  const createMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowCreateModal(false);
      setNewGroupName('');
      router.push(`/dashboard/groups/${newGroup.id}`);
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createMutation.mutate({ name: newGroupName.trim() });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Groups 👥</h1>
          <p className="mt-3 text-lg text-gray-600 font-medium">Manage your expense groups</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Create Group
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl glass-card p-6 shadow-xl border border-primary-100/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <input
          type="text"
          placeholder="🔍 Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-200 px-6 py-3 text-lg focus:border-primary-500 focus:outline-none transition-all duration-300"
        />
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="rounded-2xl glass-card p-16 text-center shadow-xl border border-primary-100/50">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-600 text-lg font-medium">No groups found. Create your first group!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((group, index) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className="group rounded-2xl border-2 border-transparent glass-card p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-primary-300 animate-slide-up"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                      <p className="mt-1 text-sm text-gray-600 font-medium">
                        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-md ${
                      group.role === 'OWNER'
                        ? 'bg-gradient-to-r from-warning-500 to-warning-600 text-white'
                        : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    }`}
                  >
                    {group.role}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 items-center mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border-2 border-primary-200 bg-white px-6 py-3 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-400 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Previous
              </button>
              <span className="flex items-center px-4 font-semibold text-gray-700">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
                className="rounded-xl border-2 border-primary-200 bg-white px-6 py-3 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-400 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-card p-8 shadow-2xl animate-scale-in m-4 border border-primary-200">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Create New Group 🎉</h2>
            <form onSubmit={handleCreateGroup} className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Roommates, Vacation Trip..."
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary-500 focus:outline-none transition-all duration-300"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewGroupName('');
                  }}
                  className="flex-1 rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
