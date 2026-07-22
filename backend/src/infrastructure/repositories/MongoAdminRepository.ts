import { Admin } from '../../core/domain/entities/Admin';
import { IAdminRepository } from '../../core/domain/repositories/IAdminRepository';
import { AdminModel } from '../db/models/AdminModel';

export class MongoAdminRepository implements IAdminRepository {
  async findById(id: string): Promise<Admin | null> {
    const doc = await AdminModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const doc = await AdminModel.findOne({ email }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(admin: Admin): Promise<Admin> {
    const doc = await AdminModel.create(admin);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, admin: Partial<Admin>): Promise<Admin | null> {
    const doc = await AdminModel.findByIdAndUpdate(id, admin, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await AdminModel.findByIdAndDelete(id);
    return res !== null;
  }

  async find(query: any): Promise<Admin[]> {
    const docs = await AdminModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findOne(query: any): Promise<Admin | null> {
    const doc = await AdminModel.findOne(query).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async countDocuments(query: any): Promise<number> {
    return await AdminModel.countDocuments(query);
  }

  private mapToEntity(doc: any): Admin {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as Admin;
  }
}
