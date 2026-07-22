import mongoose, { Schema } from 'mongoose';
import { Payment } from '../../../core/domain/entities/Payment';

const PaymentSchema = new Schema<Payment>({
  expolIdNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  purpose: {
    type: String,
    required: true,
    enum: ['reunion', 'id-card', 'membership', 'donation', 'other'],
  },
  customReason: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  paystackReference: { type: String, required: true, unique: true },
  paystackTransactionId: { type: String },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'success', 'failed', 'abandoned'],
  },
  paymentDate: { type: Date, default: Date.now },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const PaymentModel = mongoose.models.Payment || mongoose.model<Payment>('Payment', PaymentSchema);
