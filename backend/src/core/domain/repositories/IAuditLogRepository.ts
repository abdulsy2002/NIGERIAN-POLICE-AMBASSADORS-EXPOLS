import { AuditLog } from '../entities/AuditLog';

export interface IAuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<AuditLog[]>;
}
