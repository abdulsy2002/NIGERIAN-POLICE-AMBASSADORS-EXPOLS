import { AuditLog } from '../../core/domain/entities/AuditLog';
import { IAuditLogRepository } from '../../core/domain/repositories/IAuditLogRepository';
import { AuditLogModel } from '../db/models/AuditLogModel';

export class MongoAuditLogRepository implements IAuditLogRepository {
  async create(log: AuditLog): Promise<AuditLog> {
    const doc = await AuditLogModel.create(log);
    return this.mapToEntity(doc.toObject());
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<AuditLog[]> {
    let q = AuditLogModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: any): AuditLog {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as AuditLog;
  }
}
