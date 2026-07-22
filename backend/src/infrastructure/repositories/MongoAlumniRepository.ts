import { Alumni } from '../../core/domain/entities/Alumni';
import { IAlumniRepository } from '../../core/domain/repositories/IAlumniRepository';
import { AlumniModel } from '../db/models/AlumniModel';

export class MongoAlumniRepository implements IAlumniRepository {
  async findById(id: string): Promise<Alumni | null> {
    const doc = await AlumniModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<Alumni | null> {
    const doc = await AlumniModel.findOne({ email }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByIdentityNumber(identityNumber: string): Promise<Alumni | null> {
    const doc = await AlumniModel.findOne({ identityNumber }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(alumni: Alumni): Promise<Alumni> {
    const doc = await AlumniModel.create(alumni);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, alumni: Partial<Alumni>): Promise<Alumni | null> {
    const doc = await AlumniModel.findByIdAndUpdate(id, alumni, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async find(query: any, options?: { sort?: any; limit?: number; select?: string }): Promise<Alumni[]> {
    let q = AlumniModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    if (options?.select) q = q.select(options.select);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findOne(query: any): Promise<Alumni | null> {
    const doc = await AlumniModel.findOne(query).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async countDocuments(query: any): Promise<number> {
    return await AlumniModel.countDocuments(query);
  }

  private mapToEntity(doc: any): Alumni {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as Alumni;
  }
}
