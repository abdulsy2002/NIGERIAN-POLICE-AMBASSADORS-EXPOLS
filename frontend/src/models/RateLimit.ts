import mongoose, { Schema, Document } from "mongoose";

export interface IRateLimit extends Document {
  ip: string;
  action: string; // e.g., 'login', 'register'
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema(
  {
    ip: { type: String, required: true },
    action: { type: String, required: true },
    count: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Composite index to look up by IP and Action quickly
RateLimitSchema.index({ ip: 1, action: 1 }, { unique: true });

// TTL index to automatically delete expired rate limit records from the database
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);
