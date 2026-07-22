import { SupportTicket } from '../entities/SupportTicket';

export interface ISupportTicketRepository {
  findById(id: string): Promise<SupportTicket | null>;
  create(ticket: SupportTicket): Promise<SupportTicket>;
  update(id: string, ticket: Partial<SupportTicket>): Promise<SupportTicket | null>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<SupportTicket[]>;
  countDocuments(query: any): Promise<number>;
}
