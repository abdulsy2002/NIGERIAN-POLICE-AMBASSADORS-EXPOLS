import mongoose, { Schema } from 'mongoose';
import { Admin } from '../../../core/domain/entities/Admin';

const AdminSchema = new Schema<Admin>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['super_admin', 'national_admin', 'state_admin'],
  },
  stateBase: {
    type: String,
    default: null,
  },
  mustChangePassword: {
    type: Boolean,
    default: true,
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const AdminModel = mongoose.models.AdminUser || mongoose.model<Admin>('AdminUser', AdminSchema);
