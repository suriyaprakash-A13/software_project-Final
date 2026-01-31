import { apiClient } from './client';

export type ExpenseCategory =
  | 'FOOD'
  | 'TRANSPORTATION'
  | 'ACCOMMODATION'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'SHOPPING'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'OTHER';

export interface Expense {
  id: string;
  amount: string;
  description: string;
  category: ExpenseCategory;
  createdAt: string;
  payer: {
    id: string;
    name: string;
    avatar: string | null;
  };
  group?: {
    id: string;
    name: string;
  };
}

export interface CreateExpenseDto {
  amount: number;
  description: string;
  category: ExpenseCategory;
  payerId: string;
  groupId: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  description?: string;
  category?: ExpenseCategory;
}

export const expensesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    groupId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.get<{
      data: Expense[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/expenses', { params }),

  getById: (id: string) => apiClient.get<Expense>(`/expenses/${id}`),

  create: (data: CreateExpenseDto) => apiClient.post<Expense>('/expenses', data),

  update: (id: string, data: UpdateExpenseDto) =>
    apiClient.patch<Expense>(`/expenses/${id}`, data),

  delete: (id: string) => apiClient.delete(`/expenses/${id}`),

  getByGroup: (groupId: string, params?: { page?: number; limit?: number; category?: string }) =>
    apiClient.get<{
      data: Expense[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/groups/${groupId}/expenses`, { params }),
};
