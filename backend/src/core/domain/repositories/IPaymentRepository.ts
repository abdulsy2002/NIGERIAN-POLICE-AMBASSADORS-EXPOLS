import { Payment } from '../entities/Payment';

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByReference(reference: string): Promise<Payment | null>;
  create(payment: Payment): Promise<Payment>;
  update(id: string, payment: Partial<Payment>): Promise<Payment | null>;
  updateByReference(reference: string, payment: Partial<Payment>): Promise<Payment | null>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<Payment[]>;
}
