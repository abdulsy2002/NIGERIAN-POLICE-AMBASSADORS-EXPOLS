import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/security/JwtService';

const jwtService = new JwtService();

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    stateBaseCode?: string;
    fullName?: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): any {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwtService.verify(token);

  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

export function roleGuard(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}
