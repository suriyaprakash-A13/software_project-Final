import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new expense
   */
  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    // Verify user is a member of the group
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: createExpenseDto.groupId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Verify payer is a member of the group
    const payerMembership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: createExpenseDto.payerId,
          groupId: createExpenseDto.groupId,
        },
      },
    });

    if (!payerMembership) {
      throw new BadRequestException('Payer is not a member of this group');
    }

    // Create expense
    const expense = await this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        createdBy: userId,
      },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return expense;
  }

  /**
   * Get all expenses for user across all groups (paginated)
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      groupId?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    // Build where clause
    const where: any = {
      group: {
        memberships: {
          some: { userId },
        },
      },
    };

    if (filters?.groupId) {
      where.groupId = filters.groupId;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          payer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get expenses for a specific group (paginated)
   */
  async findByGroup(
    userId: string,
    groupId: string,
    page: number = 1,
    limit: number = 20,
    category?: string,
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

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: any = {
      groupId,
      ...(category && { category }),
    };

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          payer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get expense by ID
   */
  async findOne(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Verify user is a member of the group
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: expense.groupId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return expense;
  }

  /**
   * Update expense (only creator can update)
   */
  async update(
    expenseId: string,
    userId: string,
    updateExpenseDto: UpdateExpenseDto,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Only creator can update
    if (expense.createdBy !== userId) {
      throw new ForbiddenException('You can only update expenses you created');
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id: expenseId },
      data: updateExpenseDto,
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedExpense;
  }

  /**
   * Delete expense (only creator can delete)
   */
  async remove(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Only creator can delete
    if (expense.createdBy !== userId) {
      throw new ForbiddenException('You can only delete expenses you created');
    }

    await this.prisma.expense.delete({
      where: { id: expenseId },
    });

    return { message: 'Expense deleted successfully' };
  }
}
