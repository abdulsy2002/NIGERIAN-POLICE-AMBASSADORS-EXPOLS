import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  adminEmail: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'RATE_LIMIT_EXCEEDED', // ✅ ADDED
      'ACCOUNT_LOCKED',      // ✅ ADDED
      'LOGOUT',
      'USER_APPROVED',
      'APPROVE_USER',  // ✅ ADD THIS
      'USER_DELETED',
      'SOFT_DELETE',   // ✅ ADD THIS
      'ALUMNI_REGISTER',      // ✅ ADD THIS
      'AMBASSADOR_REGISTER',  // ✅ ADD THIS
      'BROADCAST_SENT',
      'GALLERY_UPLOADED',
      'GALLERY_DELETED',
      'BOARD_MEMBER_ADDED',
      'BOARD_MEMBER_UPDATED',
      'BOARD_MEMBER_DELETED',
      'ADMIN_CREATED',
      'ADMIN_DELETED',
      'SETTINGS_UPDATED'
    ]
  },
  targetType: { type: String },
  targetId: { type: String },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);