import { Admin } from '../entities/Admin';

export interface IAdminRepository {
  findById(id: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
  create(admin: Admin): Promise<Admin>;
  update(id: string, admin: Partial<Admin>): Promise<Admin | null>;
  delete(id: string): Promise<boolean>;
  find(query: any): Promise<Admin[]>;
  findOne(query: any): Promise<Admin | null>;
  countDocuments(query: any): Promise<number>;
}
