export interface TicketResponse {
  adminEmail: string;
  adminName: string;
  message: string;
  createdAt?: Date;
}

export interface SupportTicket {
  id?: string;
  userId?: string;
  userType: 'alumni' | 'ambassador' | 'AlumniUser' | 'AmbassadorUser';
  userEmail: string;
  userName: string;
  subject: string;
  category: 'technical' | 'membership' | 'payment' | 'id-card' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  attachments?: string[];
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  responses?: TicketResponse[];
  assignedTo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date | null;
}
