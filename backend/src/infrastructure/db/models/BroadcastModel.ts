import mongoose, { Schema } from 'mongoose';
import { Broadcast } from '../../../core/domain/entities/Broadcast';

const BroadcastSchema = new Schema<Broadcast>(
  {
    subject: { type: String, required: true },
    message: { type: String, required: true },
    sentTo: { type: String, required: true, default: 'all' },
    sentBy: { type: String, required: true },
    targetBaseCode: { type: String, default: null },
    targetBaseName: { type: String, default: null },
  },
  { timestamps: true }
);

export const BroadcastModel = mongoose.models.Broadcast || 
  mongoose.model<Broadcast>('Broadcast', BroadcastSchema);
