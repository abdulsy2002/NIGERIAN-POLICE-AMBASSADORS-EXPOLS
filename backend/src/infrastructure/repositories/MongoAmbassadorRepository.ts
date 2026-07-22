import { Ambassador } from '../../core/domain/entities/Ambassador';
import { IAmbassadorRepository } from '../../core/domain/repositories/IAmbassadorRepository';
import { AmbassadorModel } from '../db/models/AmbassadorModel';

export class MongoAmbassadorRepository implements IAmbassadorRepository {
  async findById(id: string): Promise<Ambassador | null> {
    const doc = await AmbassadorModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<Ambassador | null> {
    const doc = await AmbassadorModel.findOne({ email }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByIdentityNumber(identityNumber: string): Promise<Ambassador | null> {
    const doc = await AmbassadorModel.findOne({ identityNumber }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(ambassador: Ambassador): Promise<Ambassador> {
    const doc = await AmbassadorModel.create(ambassador);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, ambassador: Partial<Ambassador>): Promise<Ambassador | null> {
    const doc = await AmbassadorModel.findByIdAndUpdate(id, ambassador, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async find(query: any, options?: { sort?: any; limit?: number; select?: string }): Promise<Ambassador[]> {
    let q = AmbassadorModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    if (options?.select) q = q.select(options.select);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findOne(query: any): Promise<Ambassador | null> {
    const doc = await AmbassadorModel.findOne(query).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async countDocuments(query: any): Promise<number> {
    return await AmbassadorModel.countDocuments(query);
  }

  private mapToEntity(doc: any): Ambassador {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as Ambassador;
  }
}
