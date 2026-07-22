import mongoose, { Schema } from 'mongoose';
import { BoardMember } from '../../../core/domain/entities/BoardMember';

const BoardMemberSchema = new Schema<BoardMember>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    photoUrl: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  { timestamps: true }
);

export const BoardMemberModel = mongoose.models.BoardMember || mongoose.model<BoardMember>('BoardMember', BoardMemberSchema);
