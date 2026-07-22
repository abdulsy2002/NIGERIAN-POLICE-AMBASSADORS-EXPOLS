import mongoose, { Schema, Document } from "mongoose";

export interface IBroadcast extends Document {
  subject: string;
  message: string;
  sentTo: string;
  sentBy: string;
  createdAt: Date;
}

const BroadcastSchema: Schema = new Schema(
  {
    subject: { type: String, required: true },
    message: { type: String, required: true },
    sentTo: { type: String, required: true, default: 'all' },
    sentBy: { type: String, required: true },
    // ✅ NEW: Base-specific targeting
    targetBaseCode: { type: String, default: null },
    targetBaseName: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Broadcast || 
  mongoose.model<IBroadcast>("Broadcast", BroadcastSchema);