import { Ambassador } from '../entities/Ambassador';

export interface IAmbassadorRepository {
  findById(id: string): Promise<Ambassador | null>;
  findByEmail(email: string): Promise<Ambassador | null>;
  findByIdentityNumber(identityNumber: string): Promise<Ambassador | null>;
  create(ambassador: Ambassador): Promise<Ambassador>;
  update(id: string, ambassador: Partial<Ambassador>): Promise<Ambassador | null>;
  find(query: any, options?: { sort?: any; limit?: number; select?: string }): Promise<Ambassador[]>;
  findOne(query: any): Promise<Ambassador | null>;
  countDocuments(query: any): Promise<number>;
}
