import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  stateBaseCode?: string;
  fullName?: string;
  mustChangePassword?: boolean;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn = '7d';

  constructor() {
    this.secret = process.env.JWT_SECRET || 'fallback-secret-npae-12345';
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ WARNING: JWT_SECRET is not defined. Using fallback secret.');
    }
  }

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch {
      return null;
    }
  }
}
