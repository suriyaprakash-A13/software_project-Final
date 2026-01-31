import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get monthly analytics for a group
   */
  async getMonthlyAnalytics(
    groupId: string,
    userId: string,
    year?: number,
    month?: number,
  ) {
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

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });

    if (!group) {
      throw new ForbiddenException('Group not found');
    }

    const currentYear = year || new Date().getFullYear();

    // Build date filter
    const startDate = new Date(currentYear, month ? month - 1 : 0, 1);
    const endDate = month
      ? new Date(currentYear, month, 0, 23, 59, 59, 999)
      : new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const expenses = await this.prisma.expense.findMany({
      where: {
        groupId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData: Record<
      number,
      { totalExpenses: number; count: number }
    > = {};

    expenses.forEach((expense) => {
      const expenseMonth = expense.createdAt.getMonth() + 1;
      if (!monthlyData[expenseMonth]) {
        monthlyData[expenseMonth] = { totalExpenses: 0, count: 0 };
      }
      monthlyData[expenseMonth].totalExpenses += Number(expense.amount);
      monthlyData[expenseMonth].count++;
    });

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const data = Object.entries(monthlyData).map(([monthNum, stats]) => ({
      month: parseInt(monthNum),
      monthName: monthNames[parseInt(monthNum) - 1],
      totalExpenses: stats.totalExpenses.toFixed(2),
      expenseCount: stats.count,
      averageExpense: (stats.totalExpenses / stats.count).toFixed(2),
    }));

    return {
      groupId: group.id,
      groupName: group.name,
      year: currentYear,
      data: data.sort((a, b) => a.month - b.month),
    };
  }

  /**
   * Get category-wise analytics for a group
   */
  async getCategoryAnalytics(
    groupId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
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

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });

    if (!group) {
      throw new ForbiddenException('Group not found');
    }

    // Default to current month if no dates provided
    const start =
      startDate ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const expenses = await this.prisma.expense.findMany({
      where: {
        groupId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    });

    // Group by category
    const categoryData: Record<
      string,
      { totalExpenses: number; count: number }
    > = {};

    let totalAmount = 0;

    expenses.forEach((expense) => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = { totalExpenses: 0, count: 0 };
      }
      const amount = Number(expense.amount);
      categoryData[expense.category].totalExpenses += amount;
      categoryData[expense.category].count++;
      totalAmount += amount;
    });

    const data = Object.entries(categoryData).map(([category, stats]) => ({
      category,
      totalExpenses: stats.totalExpenses.toFixed(2),
      expenseCount: stats.count,
      percentage: ((stats.totalExpenses / totalAmount) * 100).toFixed(1),
    }));

    return {
      groupId: group.id,
      groupName: group.name,
      dateRange: {
        startDate: start,
        endDate: end,
      },
      data: data.sort((a, b) => parseFloat(b.totalExpenses) - parseFloat(a.totalExpenses)),
      totalExpenses: totalAmount.toFixed(2),
    };
  }

  /**
   * Get user summary analytics across all groups
   */
  async getUserSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const start =
      startDate ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    // Get all groups user is member of
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      select: { groupId: true },
    });

    const groupIds = memberships.map((m) => m.groupId);

    if (groupIds.length === 0) {
      return {
        userId,
        userName: '',
        dateRange: { startDate: start, endDate: end },
        totalPaid: '0.00',
        totalOwed: '0.00',
        netBalance: '0.00',
        groupCount: 0,
        expenseCount: 0,
        topCategories: [],
      };
    }

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Get all expenses in user's groups
    const expenses = await this.prisma.expense.findMany({
      where: {
        groupId: { in: groupIds },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        amount: true,
        payerId: true,
        category: true,
        groupId: true,
      },
    });

    // Calculate statistics
    let totalPaid = 0;
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const amount = Number(expense.amount);

      if (expense.payerId === userId) {
        totalPaid += amount;
      }

      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      if (expense.payerId === userId) {
        categoryTotals[expense.category] += amount;
      }
    });

    // Top categories
    const topCategories = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        totalExpenses: total.toFixed(2),
        percentage: ((total / totalPaid) * 100).toFixed(1),
      }))
      .sort((a, b) => parseFloat(b.totalExpenses) - parseFloat(a.totalExpenses))
      .slice(0, 5);

    const expenseCount = expenses.filter((e) => e.payerId === userId).length;
    const uniqueGroups = new Set(expenses.map((e) => e.groupId));

    return {
      userId,
      userName: user?.name || '',
      dateRange: {
        startDate: start,
        endDate: end,
      },
      totalPaid: totalPaid.toFixed(2),
      totalOwed: '0.00', // Would need complex calculation across all groups
      netBalance: totalPaid.toFixed(2),
      groupCount: uniqueGroups.size,
      expenseCount,
      topCategories,
    };
  }
}
