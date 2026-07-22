export interface AuditLog {
  id?: string;
  adminEmail: string;
  action:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'RATE_LIMIT_EXCEEDED'
    | 'ACCOUNT_LOCKED'
    | 'LOGOUT'
    | 'USER_APPROVED'
    | 'APPROVE_USER'
    | 'USER_DELETED'
    | 'SOFT_DELETE'
    | 'ALUMNI_REGISTER'
    | 'AMBASSADOR_REGISTER'
    | 'BROADCAST_SENT'
    | 'GALLERY_UPLOADED'
    | 'GALLERY_DELETED'
    | 'BOARD_MEMBER_ADDED'
    | 'BOARD_MEMBER_UPDATED'
    | 'BOARD_MEMBER_DELETED'
    | 'ADMIN_CREATED'
    | 'ADMIN_DELETED'
    | 'SETTINGS_UPDATED';
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, any> | null;
  timestamp?: Date;
}
