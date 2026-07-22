import { SupportTicket } from '../../core/domain/entities/SupportTicket';
import { ISupportTicketRepository } from '../../core/domain/repositories/ISupportTicketRepository';
import { SupportTicketModel } from '../db/models/SupportTicketModel';

export class MongoSupportTicketRepository implements ISupportTicketRepository {
  async findById(id: string): Promise<SupportTicket | null> {
    const doc = await SupportTicketModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(ticket: SupportTicket): Promise<SupportTicket> {
    const doc = await SupportTicketModel.create(ticket);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, ticket: Partial<SupportTicket>): Promise<SupportTicket | null> {
    const doc = await SupportTicketModel.findByIdAndUpdate(id, ticket, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<SupportTicket[]> {
    let q = SupportTicketModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async countDocuments(query: any): Promise<number> {
    return await SupportTicketModel.countDocuments(query);
  }

  private mapToEntity(doc: any): SupportTicket {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as SupportTicket;
  }
}
