import { apiClient } from './client';

export interface MonthlyAnalytics {
  groupId: string;
  groupName: string;
  year: number;
  data: Array<{
    month: number;
    monthName: string;
    totalExpenses: string;
    expenseCount: number;
    averageExpense: string;
  }>;
}

export interface CategoryAnalytics {
  groupId: string;
  groupName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  data: Array<{
    category: string;
    totalExpenses: string;
    expenseCount: number;
    percentage: string;
  }>;
  totalExpenses: string;
}

export interface UserSummary {
  userId: string;
  userName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalPaid: string;
  totalOwed: string;
  netBalance: string;
  groupCount: number;
  expenseCount: number;
  topCategories: Array<{
    category: string;
    totalExpenses: string;
    percentage: string;
  }>;
}

export const analyticsApi = {
  getMonthly: (groupId: string, params?: { year?: number; month?: number }) =>
    apiClient.get<MonthlyAnalytics>(`/analytics/groups/${groupId}/monthly`, { params }),

  getCategories: (groupId: string, params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<CategoryAnalytics>(`/analytics/groups/${groupId}/categories`, { params }),

  getUserSummary: (userId: string, params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<UserSummary>(`/analytics/users/${userId}/summary`, { params }),
};
