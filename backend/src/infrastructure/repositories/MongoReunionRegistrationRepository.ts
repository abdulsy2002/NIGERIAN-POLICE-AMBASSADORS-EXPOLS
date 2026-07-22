import { ReunionRegistration } from '../../core/domain/entities/ReunionRegistration';
import { IReunionRegistrationRepository } from '../../core/domain/repositories/IReunionRegistrationRepository';
import { ReunionRegistrationModel } from '../db/models/ReunionRegistrationModel';

export class MongoReunionRegistrationRepository implements IReunionRegistrationRepository {
  async findById(id: string): Promise<ReunionRegistration | null> {
    const doc = await ReunionRegistrationModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<ReunionRegistration[]> {
    const docs = await ReunionRegistrationModel.find({ email }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async create(registration: ReunionRegistration): Promise<ReunionRegistration> {
    const doc = await ReunionRegistrationModel.create(registration);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, registration: Partial<ReunionRegistration>): Promise<ReunionRegistration | null> {
    const doc = await ReunionRegistrationModel.findByIdAndUpdate(id, registration, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async updateByReference(reference: string, registration: Partial<ReunionRegistration>): Promise<ReunionRegistration | null> {
    const doc = await ReunionRegistrationModel.findOneAndUpdate({ paymentReference: reference }, registration, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<ReunionRegistration[]> {
    let q = ReunionRegistrationModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async countDocuments(query: any): Promise<number> {
    return await ReunionRegistrationModel.countDocuments(query);
  }

  private mapToEntity(doc: any): ReunionRegistration {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as ReunionRegistration;
  }
}
