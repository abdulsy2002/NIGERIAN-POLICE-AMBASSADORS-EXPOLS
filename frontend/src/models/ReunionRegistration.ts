import mongoose, { Schema, Document } from "mongoose";

export interface IReunionRegistration extends Document {
  fullName: string;
  email: string;
  phone: string;
  school: string;
  graduationYear: number;
  attendanceType: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentReference?: string;
  amountPaid?: number;
  createdAt: Date;
}

const ReunionRegistrationSchema: Schema = new Schema(
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

export default mongoose.models.ReunionRegistration || 
  mongoose.model<IReunionRegistration>("ReunionRegistration", ReunionRegistrationSchema);