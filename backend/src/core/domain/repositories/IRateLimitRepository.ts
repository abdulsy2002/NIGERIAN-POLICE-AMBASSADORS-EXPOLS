import { RateLimit } from '../entities/RateLimit';

export interface IRateLimitRepository {
  findOne(ip: string, action: string): Promise<RateLimit | null>;
  create(rateLimit: RateLimit): Promise<RateLimit>;
  update(id: string, rateLimit: Partial<RateLimit>): Promise<RateLimit | null>;
  deleteExpired(now: Date): Promise<number>;
}
