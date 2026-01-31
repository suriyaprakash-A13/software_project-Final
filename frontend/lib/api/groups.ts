import { apiClient } from './client';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  memberCount: number;
  role: 'OWNER' | 'MEMBER';
}

export interface GroupDetail extends Omit<Group, 'memberCount' | 'role'> {
  memberships: Array<{
    id: string;
    role: 'OWNER' | 'MEMBER';
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }>;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  email: string;
}

export const groupsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<{
      data: Group[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/groups', { params }),

  getById: (id: string) => apiClient.get<GroupDetail>(`/groups/${id}`),

  create: (data: CreateGroupDto) => apiClient.post<GroupDetail>('/groups', data),

  update: (id: string, data: UpdateGroupDto) =>
    apiClient.patch<GroupDetail>(`/groups/${id}`, data),

  delete: (id: string) => apiClient.delete(`/groups/${id}`),

  addMember: (id: string, data: AddMemberDto) =>
    apiClient.post(`/groups/${id}/members`, data),

  removeMember: (id: string, userId: string) =>
    apiClient.delete(`/groups/${id}/members/${userId}`),
};
