import { BoardMember } from '../entities/BoardMember';

export interface IBoardMemberRepository {
  findById(id: string): Promise<BoardMember | null>;
  create(member: BoardMember): Promise<BoardMember>;
  update(id: string, member: Partial<BoardMember>): Promise<BoardMember | null>;
  delete(id: string): Promise<boolean>;
  find(query: any, options?: { sort?: any; limit?: number }): Promise<BoardMember[]>;
}
