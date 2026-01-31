import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto, AddMemberDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new group with current user as OWNER
   */
  async create(userId: string, createGroupDto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        ...createGroupDto,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return group;
  }

  /**
   * Get all groups for a user (paginated)
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 items per page

    const where = {
      memberships: {
        some: {
          userId,
        },
      },
      ...(search && {
        name: {
          contains: search,
        },
      }),
    };

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          memberships: {
            where: { userId },
            select: {
              role: true,
            },
          },
          _count: {
            select: {
              memberships: true,
            },
          },
        },
      }),
      this.prisma.group.count({ where }),
    ]);

    // Transform response
    const transformedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      memberCount: group._count.memberships,
      role: group.memberships[0]?.role || 'MEMBER',
    }));

    return {
      data: transformedGroups,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get group by ID with all members
   */
  async findOne(groupId: string, userId: string) {
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
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: [
            { role: 'asc' }, // OWNER first
            { joinedAt: 'asc' },
          ],
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Add the current user's role to the response
    return {
      ...group,
      role: membership.role,
    };
  }

  /**
   * Update group (OWNER only)
   */
  async update(groupId: string, updateGroupDto: UpdateGroupDto) {
    const group = await this.prisma.group.update({
      where: { id: groupId },
      data: updateGroupDto,
    });

    return group;
  }

  /**
   * Delete group (OWNER only)
   * Cascades to delete all memberships and expenses
   */
  async remove(groupId: string) {
    await this.prisma.group.delete({
      where: { id: groupId },
    });

    return { message: 'Group deleted successfully' };
  }

  /**
   * Add member to group (OWNER only)
   */
  async addMember(groupId: string, addMemberDto: AddMemberDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: addMemberDto.email },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    // Check if already a member
    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this group');
    }

    // Create membership
    const membership = await this.prisma.membership.create({
      data: {
        userId: user.id,
        groupId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return membership;
  }

  /**
   * Remove member from group (OWNER only)
   * Cannot remove owner
   */
  async removeMember(groupId: string, userIdToRemove: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: userIdToRemove,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this group');
    }

    if (membership.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove group owner');
    }

    await this.prisma.membership.delete({
      where: {
        userId_groupId: {
          userId: userIdToRemove,
          groupId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }
}
