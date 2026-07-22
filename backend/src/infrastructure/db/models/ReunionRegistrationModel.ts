import mongoose, { Schema } from 'mongoose';
import { ReunionRegistration } from '../../../core/domain/entities/ReunionRegistration';

const ReunionRegistrationSchema = new Schema<ReunionRegistration>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    school: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    attendanceType: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentReference: { type: String },
    amountPaid: { type: Number },
  },
  { timestamps: true }
);

export const ReunionRegistrationModel = mongoose.models.ReunionRegistration || 
  mongoose.model<ReunionRegistration>('ReunionRegistration', ReunionRegistrationSchema);
