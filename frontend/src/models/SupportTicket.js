import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
  // User info
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType' },
  userType: { 
    type: String, 
    enum: ['alumni', 'ambassador', 'AlumniUser', 'AmbassadorUser'], // ✅ Accept both formats
    required: true
  },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  
  // Ticket details
  subject: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['technical', 'membership', 'payment', 'id-card', 'general']
  },
  priority: { 
    type: String, 
    default: 'medium',
    enum: ['low', 'medium', 'high', 'urgent']
  },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  
  // Status tracking
  status: { 
    type: String, 
    default: 'open',
    enum: ['open', 'in-progress', 'resolved', 'closed']
  },
  
  // Admin responses
  responses: [{
    adminEmail: String,
    adminName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Assignment
  assignedTo: { type: String },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

export default mongoose.models.SupportTicket || 
  mongoose.model('SupportTicket', SupportTicketSchema);