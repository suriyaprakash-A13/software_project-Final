import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, AddMemberDto } from './dto/group.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { GroupOwnerGuard } from './guards/group-owner.guard';
import { GroupMemberGuard } from './guards/group-member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('groups')
@UseGuards(SessionAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * POST /groups
   * Create a new group
   */
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body(new ValidationPipe({ whitelist: true })) createGroupDto: CreateGroupDto,
  ) {
    return this.groupsService.create(userId, createGroupDto);
  }

  /**
   * GET /groups
   * Get all groups for current user (paginated)
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.groupsService.findAll(userId, page, limit, search);
  }

  /**
   * GET /groups/:id
   * Get group details with members
   */
  @Get(':id')
  @UseGuards(GroupMemberGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupsService.findOne(id, userId);
  }

  /**
   * PATCH /groups/:id
   * Update group (OWNER only)
   */
  @Patch(':id')
  @UseGuards(GroupOwnerGuard)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  /**
   * DELETE /groups/:id
   * Delete group (OWNER only)
   */
  @Delete(':id')
  @UseGuards(GroupOwnerGuard)
  async remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  /**
   * POST /groups/:id/members
   * Add member to group (OWNER only)
   */
  @Post(':id/members')
  @UseGuards(GroupOwnerGuard)
  async addMember(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) addMemberDto: AddMemberDto,
  ) {
    return this.groupsService.addMember(id, addMemberDto);
  }

  /**
   * DELETE /groups/:id/members/:userId
   * Remove member from group (OWNER only)
   */
  @Delete(':id/members/:userId')
  @UseGuards(GroupOwnerGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.groupsService.removeMember(id, userId);
  }
}
