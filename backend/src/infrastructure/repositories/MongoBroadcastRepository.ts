import { Broadcast } from '../../core/domain/entities/Broadcast';
import { IBroadcastRepository } from '../../core/domain/repositories/IBroadcastRepository';
import { BroadcastModel } from '../db/models/BroadcastModel';

export class MongoBroadcastRepository implements IBroadcastRepository {
  async create(broadcast: Broadcast): Promise<Broadcast> {
    const doc = await BroadcastModel.create(broadcast);
    return this.mapToEntity(doc.toObject());
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<Broadcast[]> {
    let q = BroadcastModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: any): Broadcast {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as Broadcast;
  }
}
