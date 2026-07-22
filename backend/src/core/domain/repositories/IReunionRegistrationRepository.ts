import { ReunionRegistration } from '../entities/ReunionRegistration';

export interface IReunionRegistrationRepository {
  findById(id: string): Promise<ReunionRegistration | null>;
  findByEmail(email: string): Promise<ReunionRegistration[]>;
  create(registration: ReunionRegistration): Promise<ReunionRegistration>;
  update(id: string, registration: Partial<ReunionRegistration>): Promise<ReunionRegistration | null>;
  updateByReference(reference: string, registration: Partial<ReunionRegistration>): Promise<ReunionRegistration | null>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<ReunionRegistration[]>;
  countDocuments(query: any): Promise<number>;
}
