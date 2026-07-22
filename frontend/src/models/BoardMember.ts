import mongoose, { Schema, Document } from 'mongoose';

export interface IBoardMember extends Document {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  isFeatured: boolean; // True for the Chairman (larger card)
  linkedin?: string;
  twitter?: string;
}

const BoardMemberSchema = new Schema<IBoardMember>(
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

export default mongoose.models.BoardMember || mongoose.model<IBoardMember>('BoardMember', BoardMemberSchema);