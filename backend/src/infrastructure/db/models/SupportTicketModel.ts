import mongoose, { Schema } from 'mongoose';
import { SupportTicket } from '../../../core/domain/entities/SupportTicket';

const SupportTicketSchema = new Schema<SupportTicket>({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType' },
  userType: {
    type: String,
    enum: ['alumni', 'ambassador', 'AlumniUser', 'AmbassadorUser'],
    required: true,
  },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  subject: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'membership', 'payment', 'id-card', 'general'],
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'urgent'],
  },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  status: {
    type: String,
    default: 'open',
    enum: ['open', 'in-progress', 'resolved', 'closed'],
  },
  responses: [{
    adminEmail: String,
    adminName: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
  }],
  assignedTo: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

export const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model<SupportTicket>('SupportTicket', SupportTicketSchema);
