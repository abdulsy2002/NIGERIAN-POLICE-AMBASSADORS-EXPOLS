import mongoose, { Schema } from 'mongoose';
import { AuditLog } from '../../../core/domain/entities/AuditLog';

const AuditLogSchema = new Schema<AuditLog>({
  adminEmail: { type: String, required: true },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'RATE_LIMIT_EXCEEDED',
      'ACCOUNT_LOCKED',
      'LOGOUT',
      'USER_APPROVED',
      'APPROVE_USER',
      'USER_DELETED',
      'SOFT_DELETE',
      'ALUMNI_REGISTER',
      'AMBASSADOR_REGISTER',
      'BROADCAST_SENT',
      'GALLERY_UPLOADED',
      'GALLERY_DELETED',
      'BOARD_MEMBER_ADDED',
      'BOARD_MEMBER_UPDATED',
      'BOARD_MEMBER_DELETED',
      'ADMIN_CREATED',
      'ADMIN_DELETED',
      'SETTINGS_UPDATED',
    ],
  },
  targetType: { type: String },
  targetId: { type: String },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<AuditLog>('AuditLog', AuditLogSchema);
