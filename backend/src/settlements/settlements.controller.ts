import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('settlements')
@UseGuards(SessionAuthGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  /**
   * GET /settlements/groups/:groupId
   * Calculate optimal settlement for a group
   */
  @Get('groups/:groupId')
  async calculateGroupSettlement(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.settlementsService.calculateGroupSettlement(groupId, userId);
  }

  /**
   * GET /settlements/groups/:groupId/users/:userId/balance
   * Get user balance in a group
   */
  @Get('groups/:groupId/users/:userId/balance')
  async getUserBalance(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.settlementsService.getUserBalance(groupId, userId, currentUserId);
  }
}
