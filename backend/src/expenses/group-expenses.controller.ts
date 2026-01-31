import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { GroupMemberGuard } from '../groups/guards/group-member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('groups/:groupId/expenses')
@UseGuards(SessionAuthGuard, GroupMemberGuard)
export class GroupExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * GET /groups/:groupId/expenses
   * Get all expenses for a specific group
   */
  @Get()
  async findByGroup(
    @CurrentUser('id') userId: string,
    @Param('groupId') groupId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
  ) {
    return this.expensesService.findByGroup(userId, groupId, page, limit, category);
  }
}
