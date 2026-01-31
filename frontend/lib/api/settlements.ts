import { apiClient } from './client';

export interface SettlementTransaction {
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: string;
}

export interface Settlement {
  groupId: string;
  groupName: string;
  calculatedAt: string;
  totalExpenses: string;
  netBalances: Array<{
    userId: string;
    userName: string;
    netBalance: string;
    totalPaid: string;
    totalShare: string;
  }>;
  settlements: SettlementTransaction[];
  transactionCount: number;
}

export interface UserBalance {
  userId: string;
  userName: string;
  groupId: string;
  groupName: string;
  netBalance: string;
  totalPaid: string;
  totalShare: string;
  expenseCount: number;
}

export const settlementsApi = {
  getGroupSettlement: (groupId: string) =>
    apiClient.get<Settlement>(`/settlements/groups/${groupId}`),

  getUserBalance: (groupId: string, userId: string) =>
    apiClient.get<UserBalance>(`/settlements/groups/${groupId}/users/${userId}/balance`),
};
