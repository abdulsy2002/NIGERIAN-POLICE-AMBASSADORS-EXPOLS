import { ContactMessage } from '../../core/domain/entities/ContactMessage';
import { IContactMessageRepository } from '../../core/domain/repositories/IContactMessageRepository';
import { ContactMessageModel } from '../db/models/ContactMessageModel';

export class MongoContactMessageRepository implements IContactMessageRepository {
  async create(message: ContactMessage): Promise<ContactMessage> {
    const doc = await ContactMessageModel.create(message);
    return this.mapToEntity(doc.toObject());
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<ContactMessage[]> {
    let q = ContactMessageModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async countDocuments(query: any): Promise<number> {
    return await ContactMessageModel.countDocuments(query);
  }

  private mapToEntity(doc: any): ContactMessage {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as ContactMessage;
  }
}
