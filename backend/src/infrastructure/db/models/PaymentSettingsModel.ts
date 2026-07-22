import mongoose, { Schema } from 'mongoose';
import { PaymentSettings } from '../../../core/domain/entities/PaymentSettings';

const PaymentPurposeSchema = new Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  amount: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const PaymentSettingsSchema = new Schema<PaymentSettings>({
  purposes: [PaymentPurposeSchema],
  updatedAt: { type: Date, default: Date.now },
});

export const PaymentSettingsModel = mongoose.models.PaymentSettings || mongoose.model<PaymentSettings>('PaymentSettings', PaymentSettingsSchema);
