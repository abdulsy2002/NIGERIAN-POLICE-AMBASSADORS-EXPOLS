import AuditLog from '@/models/AuditLog';
import { headers } from 'next/headers';

export async function createAuditLog(data: {
  adminEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
}) {
  try {
    // Next.js 15+ requires awaiting the headers() function
    const headersList = await headers(); 
    const ip = headersList.get('x-forwarded-for') || 'unknown-ip';

    await AuditLog.create({
      ...data,
      details: { ...data.details, ipAddress: ip }
    });
  } catch (error) {
    // Log error silently so it doesn't crash the main action
    console.error('❌ Audit Log Failed:', error);
  }
}