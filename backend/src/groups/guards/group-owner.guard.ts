import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to ensure only group OWNER can perform certain actions
 */
@Injectable()
export class GroupOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const groupId = request.params.id || request.params.groupId;

    if (!userId || !groupId) {
      throw new ForbiddenException('Invalid request');
    }

    // Check if user is the group owner
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Group not found or you are not a member');
    }

    if (membership.role !== 'OWNER') {
      throw new ForbiddenException('Only group owner can perform this action');
    }

    return true;
  }
}
