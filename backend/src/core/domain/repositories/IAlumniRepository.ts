import { Alumni } from '../entities/Alumni';

export interface IAlumniRepository {
  findById(id: string): Promise<Alumni | null>;
  findByEmail(email: string): Promise<Alumni | null>;
  findByIdentityNumber(identityNumber: string): Promise<Alumni | null>;
  create(alumni: Alumni): Promise<Alumni>;
  update(id: string, alumni: Partial<Alumni>): Promise<Alumni | null>;
  find(query: any, options?: { sort?: any; limit?: number; select?: string }): Promise<Alumni[]>;
  findOne(query: any): Promise<Alumni | null>;
  countDocuments(query: any): Promise<number>;
}
