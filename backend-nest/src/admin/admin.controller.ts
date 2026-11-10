import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from './admin-role.guard';
import { AdminService } from './admin.service';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { NationalAdminGuard } from './national-admin.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { getPagination } from '../common/pagination';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('summary')
  getSummary(@Req() request: AuthenticatedRequest) {
    return this.adminService.getSummary(request.user);
  }

  @Get('alumni')
  getAlumni(
    @Req() request: AuthenticatedRequest,
    @Query('stateBaseCode') stateBaseCode?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getAlumni(request.user, stateBaseCode, getPagination(page, pageSize));
  }

  @Get('ambassadors')
  getAmbassadors(
    @Req() request: AuthenticatedRequest,
    @Query('stateBaseCode') stateBaseCode?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getAmbassadors(request.user, stateBaseCode, getPagination(page, pageSize));
  }

  @Get('reunion-registrations')
  getReunionRegistrations(
    @Req() request: AuthenticatedRequest,
    @Query('stateBaseCode') stateBaseCode?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getReunionRegistrations(request.user, stateBaseCode, getPagination(page, pageSize));
  }

  @Get('alumni/:id')
  getAlumniDetails(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.adminService.getMemberDetails(id, 'ALUMNI', request.user);
  }

  @Get('ambassadors/:id')
  getAmbassadorDetails(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.adminService.getMemberDetails(id, 'AMBASSADOR', request.user);
  }

  @Get('broadcasts')
  getBroadcasts(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getBroadcasts(request.user, getPagination(page, pageSize));
  }

  @Post('broadcasts')
  createBroadcast(@Body() body: { subject: string; message: string; sentTo?: string; targetBaseCode?: string; targetBaseName?: string }, @Req() request: AuthenticatedRequest) {
    return this.adminService.createBroadcast(body, request.user);
  }

  @Post('approve')
  approveUser(@Body() body: { userId: string; userType: 'alumni' | 'ambassador' }, @Req() request: AuthenticatedRequest) {
    return this.adminService.approveUser(body.userId, body.userType, request.user);
  }

  @Get('profile-requests')
  getProfileUpdateRequests(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getProfileUpdateRequests(request.user, getPagination(page, pageSize));
  }

  @Patch('profile-requests/:id')
  processProfileUpdateRequest(@Param('id') id: string, @Body() body: { action: 'approve' | 'reject' }, @Req() request: AuthenticatedRequest) {
    return this.adminService.processProfileUpdateRequest(id, body.action, request.user);
  }

  @Delete('alumni/:id')
  deleteAlumni(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.adminService.deleteAlumni(id, request.user);
  }

  @Delete('ambassadors/:id')
  deleteAmbassador(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.adminService.deleteAmbassador(id, request.user);
  }

  @Get('board-members')
  @UseGuards(NationalAdminGuard)
  getBoardMembers() {
    return this.adminService.getBoardMembers();
  }

  @Post('board-members')
  @UseGuards(NationalAdminGuard)
  createBoardMember(@Body() body: { name: string; role: string; bio: string; photoUrl: string; isFeatured?: boolean; linkedin?: string; twitter?: string }, @Req() request: AuthenticatedRequest) {
    return this.adminService.createBoardMember(body, request.user.email, request.user.sub);
  }

  @Put('board-members/:id')
  @UseGuards(NationalAdminGuard)
  updateBoardMember(@Param('id') id: string, @Body() body: Partial<{ name: string; role: string; bio: string; photoUrl: string; isFeatured: boolean; linkedin: string; twitter: string }>, @Req() request: AuthenticatedRequest) {
    return this.adminService.updateBoardMember(id, body, request.user.email, request.user.sub);
  }

  @Delete('board-members/:id')
  @UseGuards(NationalAdminGuard)
  deleteBoardMember(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.adminService.deleteBoardMember(id, request.user.email, request.user.sub);
  }

  @Get('admins')
  @UseGuards(SuperAdminGuard)
  getAdmins() {
    return this.adminService.getAdmins();
  }

  @Post('admins')
  @UseGuards(SuperAdminGuard)
  createAdmin(@Body() body: { fullName: string; email: string; password: string; role: 'NATIONAL_ADMIN' | 'STATE_ADMIN'; stateBase?: string; stateBaseCode?: string; stateBaseName?: string }, @Req() request: AuthenticatedRequest) {
    return this.adminService.createAdmin(body, request.user);
  }

  @Delete('admins/:id')
  @UseGuards(SuperAdminGuard)
  deleteAdmin(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.adminService.deleteAdmin(id, request.user);
  }

  @Get('audit-logs')
  @UseGuards(NationalAdminGuard)
  getAuditLogs(@Query('limit') limit?: string, @Req() request?: AuthenticatedRequest) {
    return this.adminService.getAuditLogs(limit === undefined ? 100 : Number(limit), request?.user);
  }
}
