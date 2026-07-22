import mongoose, { Document, Schema } from 'mongoose';

export interface IProfileUpdateRequest extends Document {
  userId: string;
  userType: 'alumni' | 'ambassador';
  userName: string;
  userEmail: string;
  requestedChanges: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileUpdateRequestSchema = new Schema({
  userId: { type: String, required: true },
  userType: { type: String, enum: ['alumni', 'ambassador'], required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  requestedChanges: { type: Object, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

export const ProfileUpdateRequestModel = mongoose.model<IProfileUpdateRequest>('ProfileUpdateRequest', ProfileUpdateRequestSchema);
