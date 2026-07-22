import { BoardMember } from '../../core/domain/entities/BoardMember';
import { IBoardMemberRepository } from '../../core/domain/repositories/IBoardMemberRepository';
import { BoardMemberModel } from '../db/models/BoardMemberModel';

export class MongoBoardMemberRepository implements IBoardMemberRepository {
  async findById(id: string): Promise<BoardMember | null> {
    const doc = await BoardMemberModel.findById(id).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async create(member: BoardMember): Promise<BoardMember> {
    const doc = await BoardMemberModel.create(member);
    return this.mapToEntity(doc.toObject());
  }

  async update(id: string, member: Partial<BoardMember>): Promise<BoardMember | null> {
    const doc = await BoardMemberModel.findByIdAndUpdate(id, member, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await BoardMemberModel.findByIdAndDelete(id);
    return res !== null;
  }

  async find(query: any, options?: { sort?: any; limit?: number }): Promise<BoardMember[]> {
    let q = BoardMemberModel.find(query);
    if (options?.sort) q = q.sort(options.sort);
    if (options?.limit) q = q.limit(options.limit);
    const docs = await q.lean();
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: any): BoardMember {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as BoardMember;
  }
}
