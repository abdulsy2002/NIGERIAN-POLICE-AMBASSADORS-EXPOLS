import mongoose from 'mongoose';

const AdminUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['super_admin', 'national_admin', 'state_admin']
  },
  stateBase: { 
    type: String,
    default: null // e.g., "Kano", "Lagos", "Abuja" - only for state_admins
  },
  mustChangePassword: { 
    type: Boolean, 
    default: true // Forces password change on first login
  },
  
  // Security & Lockout
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);