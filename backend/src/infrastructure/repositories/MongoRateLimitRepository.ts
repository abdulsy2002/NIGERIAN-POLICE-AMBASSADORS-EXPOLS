import { RateLimit } from '../../core/domain/entities/RateLimit';
import { IRateLimitRepository } from '../../core/domain/repositories/IRateLimitRepository';
import { RateLimitModel } from '../db/models/RateLimitModel';

export class MongoRateLimitRepository implements IRateLimitRepository {
  async findOne(ip: string, action: string): Promise<RateLimit | null> {
    const doc = await RateLimitModel.findOne({ ip, action }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(rateLimit: RateLimit): Promise<RateLimit> {
    const doc = await RateLimitModel.create(rateLimit);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, rateLimit: Partial<RateLimit>): Promise<RateLimit | null> {
    const doc = await RateLimitModel.findByIdAndUpdate(id, rateLimit, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async deleteExpired(now: Date): Promise<number> {
    const res = await RateLimitModel.deleteMany({ expiresAt: { $lt: now } });
    return res.deletedCount;
  }

  private mapToEntity(doc: any): RateLimit {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as RateLimit;
  }
}
