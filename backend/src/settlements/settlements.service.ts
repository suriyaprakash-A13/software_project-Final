import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateSettlementPlan,
  calculateNetBalances,
} from './algorithms/optimize-settlements';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate settlement for a group
   * Returns optimized settlement transactions
   */
  async calculateGroupSettlement(groupId: string, userId: string) {
    // Verify user is a member
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Fetch group with members
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new ForbiddenException('Group not found');
    }

    // Fetch all expenses for the group
    const expenses = await this.prisma.expense.findMany({
      where: { groupId },
      select: {
        id: true,
        amount: true,
        payerId: true,
      },
    });

    // Convert Decimal to number for calculation
    const expensesData = expenses.map((expense) => ({
      id: expense.id,
      amount: Number(expense.amount),
      payerId: expense.payerId,
    }));

    // Generate settlement plan
    const settlementPlan = generateSettlementPlan(
      expensesData,
      group.memberships,
    );

    // Calculate additional stats per user
    const userStats = settlementPlan.netBalances.map((balance) => {
      const totalPaid = expensesData
        .filter((exp) => exp.payerId === balance.userId)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const memberCount = group.memberships.length;
      const totalShare =
        expensesData.reduce((sum, exp) => sum + exp.amount, 0) / memberCount;

      return {
        userId: balance.userId,
        userName: balance.userName,
        netBalance: balance.amount.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        totalShare: totalShare.toFixed(2),
      };
    });

    return {
      groupId: group.id,
      groupName: group.name,
      calculatedAt: new Date().toISOString(),
      totalExpenses: settlementPlan.totalExpenses,
      netBalances: userStats,
      settlements: settlementPlan.settlements,
      transactionCount: settlementPlan.transactionCount,
    };
  }

  /**
   * Get user balance in a specific group
   */
  async getUserBalance(groupId: string, targetUserId: string, currentUserId: string) {
    // Verify current user is a member
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: currentUserId,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Fetch group and expenses
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new ForbiddenException('Group not found');
    }

    const expenses = await this.prisma.expense.findMany({
      where: { groupId },
      select: {
        id: true,
        amount: true,
        payerId: true,
      },
    });

    // Convert and calculate
    const expensesData = expenses.map((expense) => ({
      id: expense.id,
      amount: Number(expense.amount),
      payerId: expense.payerId,
    }));

    const netBalances = calculateNetBalances(expensesData, group.memberships);

    const userBalance = netBalances.find((b) => b.userId === targetUserId);

    if (!userBalance) {
      throw new ForbiddenException('User not found in group');
    }

    const totalPaid = expensesData
      .filter((exp) => exp.payerId === targetUserId)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const memberCount = group.memberships.length;
    const totalShare =
      expensesData.reduce((sum, exp) => sum + exp.amount, 0) / memberCount;

    const expenseCount = expensesData.filter(
      (exp) => exp.payerId === targetUserId,
    ).length;

    return {
      userId: userBalance.userId,
      userName: userBalance.userName,
      groupId: group.id,
      groupName: group.name,
      netBalance: userBalance.amount.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalShare: totalShare.toFixed(2),
      expenseCount,
    };
  }
}
