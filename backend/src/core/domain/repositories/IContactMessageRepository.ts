import { ContactMessage } from '../entities/ContactMessage';

export interface IContactMessageRepository {
  create(message: ContactMessage): Promise<ContactMessage>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<ContactMessage[]>;
  countDocuments(query: any): Promise<number>;
}
