import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (!authorization) return true;
    if (!authorization.startsWith('Bearer ')) throw new UnauthorizedException('Invalid authorization header');
    try {
      request.user = await this.jwtService.verifyAsync(authorization.slice(7));
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
