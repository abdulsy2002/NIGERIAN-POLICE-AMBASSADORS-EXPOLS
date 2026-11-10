import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AdminRoleGuard } from './admin-role.guard';

@Injectable()
export class NationalAdminGuard extends AdminRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const authenticated = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user: { role: string } }>();
    if (request.user.role === 'STATE_ADMIN') {
      throw new ForbiddenException('This operation is available to national administrators only');
    }
    return authenticated;
  }
}
