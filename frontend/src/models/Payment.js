import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  // User Information
  expolIdNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Payment Details
  purpose: { 
    type: String, 
    required: true,
    enum: ['reunion', 'id-card', 'membership', 'donation', 'other']
  },
  customReason: { type: String }, // For "Other" purpose
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  
  // Paystack Reference
  paystackReference: { type: String, required: true, unique: true },
  paystackTransactionId: { type: String },
  
  // Status
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'success', 'failed', 'abandoned']
  },
  
  // Metadata
  paymentDate: { type: Date, default: Date.now },
  notes: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);