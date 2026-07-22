import mongoose, { Schema } from 'mongoose';
import { ContactMessage } from '../../../core/domain/entities/ContactMessage';

const ContactMessageSchema = new Schema<ContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: false },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const ContactMessageModel = mongoose.models.ContactMessage || 
  mongoose.model<ContactMessage>('ContactMessage', ContactMessageSchema);
