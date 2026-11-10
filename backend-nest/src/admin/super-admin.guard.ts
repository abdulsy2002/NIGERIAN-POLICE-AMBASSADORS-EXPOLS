import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AdminRoleGuard } from './admin-role.guard';

@Injectable()
export class SuperAdminGuard extends AdminRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const authenticated = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user: { role: string } }>();
    if (request.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Super administrator access required');
    }
    return authenticated;
  }
}
