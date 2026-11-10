import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';
import { isStateBaseCode } from '../common/state-bases';

@Injectable()
export class AdminRoleGuard extends JwtAuthGuard implements CanActivate {
  constructor(jwtService: JwtService, private readonly prisma: PrismaService) {
    super(jwtService);
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.adminRoleValidated) return true;
    const authenticated = await super.canActivate(context);
    const account = await this.prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { role: true, stateBaseCode: true, stateBaseName: true },
    });
    if (!account || !['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'].includes(account.role)) {
      throw new ForbiddenException('Administrator access required');
    }
    if (account.role === 'STATE_ADMIN' && !isStateBaseCode(account.stateBaseCode)) {
      throw new ForbiddenException('State administrator account has no assigned state base');
    }
    request.user = {
      ...request.user,
      role: account.role,
      stateBaseCode: account.stateBaseCode || undefined,
      stateBaseName: account.stateBaseName || undefined,
    };
    request.adminRoleValidated = true;
    return authenticated;
  }
}
