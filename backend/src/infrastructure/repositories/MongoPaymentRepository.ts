import { Payment } from '../../core/domain/entities/Payment';
import { IPaymentRepository } from '../../core/domain/repositories/IPaymentRepository';
import { PaymentModel } from '../db/models/PaymentModel';

export class MongoPaymentRepository implements IPaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const doc = await PaymentModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByReference(reference: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({ paystackReference: reference }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(payment: Payment): Promise<Payment> {
    const doc = await PaymentModel.create(payment);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, payment: Partial<Payment>): Promise<Payment | null> {
    const doc = await PaymentModel.findByIdAndUpdate(id, payment, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async updateByReference(reference: string, payment: Partial<Payment>): Promise<Payment | null> {
    const doc = await PaymentModel.findOneAndUpdate({ paystackReference: reference }, payment, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<Payment[]> {
    let q = PaymentModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: any): Payment {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as Payment;
  }
}
