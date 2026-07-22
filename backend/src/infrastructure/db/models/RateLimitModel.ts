import mongoose, { Schema } from 'mongoose';
import { RateLimit } from '../../../core/domain/entities/RateLimit';

const RateLimitSchema = new Schema<RateLimit>(
  {
    ip: { type: String, required: true },
    action: { type: String, required: true },
    count: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

RateLimitSchema.index({ ip: 1, action: 1 }, { unique: true });
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitModel = mongoose.models.RateLimit || mongoose.model<RateLimit>('RateLimit', RateLimitSchema);
