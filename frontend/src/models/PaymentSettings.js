import mongoose from 'mongoose';

const PaymentPurposeSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  amount: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const PaymentSettingsSchema = new mongoose.Schema({
  purposes: [PaymentPurposeSchema],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.PaymentSettings || mongoose.model('PaymentSettings', PaymentSettingsSchema);