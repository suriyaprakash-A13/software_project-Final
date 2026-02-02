import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(SessionAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/groups/:groupId/monthly
   * Get monthly expense breakdown for a group
   */
  @Get('groups/:groupId/monthly')
  async getMonthlyAnalytics(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
    @Query('year', ParseIntPipe) year?: number,
    @Query('month', ParseIntPipe) month?: number,
  ) {
    return this.analyticsService.getMonthlyAnalytics(
      groupId,
      userId,
      year,
      month,
    );
  }

  /**
   * GET /analytics/groups/:groupId/categories
   * Get category-wise expense breakdown for a group
   */
  @Get('groups/:groupId/categories')
  async getCategoryAnalytics(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getCategoryAnalytics(
      groupId,
      userId,
      start,
      end,
    );
  }

  /**
   * GET /analytics/users/:userId/summary
   * Get user summary across all groups
   */
  @Get('users/:userId/summary')
  async getUserSummary(
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Users can only view their own analytics
    // Support 'me' as an alias for current user
    const targetUserId = userId === 'me' ? currentUserId : userId;
    
    if (targetUserId !== currentUserId) {
      // For security, only allow users to view their own analytics
      return this.analyticsService.getUserSummary(currentUserId, undefined, undefined);
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getUserSummary(targetUserId, start, end);
  }
}
