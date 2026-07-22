import mongoose, { Schema, Document } from "mongoose";

export interface IAmbassadorUser extends Document {
  // Quick Registration Fields
  email: string;
  password: string;
  isApproved: boolean;
  identityNumber?: string;
  
  // Personal Information
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  state?: string;
  residentialAddress?: string;
  passportPhoto?: string;
  
  // Professional Details
  occupation?: string;
  organization?: string;
  position?: string;
  yearsOfExperience?: number;
  linkedinWebsite?: string;
  
  // Ambassador Role
  ambassadorType?: string;
  supportCommitment?: string;
  supportType?: string;
  whyAmbassador?: string;
  messageToStudents?: string;
  supportingDocument?: string;
  
  // ✅ National Base Fields
  stateBaseCode?: string;
  stateBaseName?: string;
  
  // Security & Lockout
  failedLoginAttempts?: number;
  lockUntil?: Date;

  // ✅ Password Reset Fields
  resetToken?: string;
  resetTokenExpiry?: Date;
  
  // Soft Delete
  isDeleted?: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const AmbassadorUserSchema: Schema = new Schema(
  {
    // Quick Registration
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    identityNumber: { type: String },
    
    // Personal Information (all optional for quick registration)
    fullName: { type: String, default: "Pending Completion" },
    gender: { type: String, default: "Not Specified" },
    dateOfBirth: { type: String, default: "1990-01-01" },
    phoneNumber: { type: String, default: "" },
    state: { type: String, default: "" },
    residentialAddress: { type: String, default: "" },
    passportPhoto: { type: String, default: "" },
    
    // Professional Details
    occupation: { type: String, default: "" },
    organization: { type: String, default: "" },
    position: { type: String, default: "" },
    yearsOfExperience: { type: Number, default: 0 },
    linkedinWebsite: { type: String, default: "" },
    
    // Ambassador Role
    ambassadorType: { type: String, default: "" },
    supportCommitment: { type: String, default: "" },
    supportType: { type: String, default: "" },
    whyAmbassador: { type: String, default: "" },
    messageToStudents: { type: String, default: "" },
    supportingDocument: { type: String, default: "" },

    // ✅ National Base Fields
    stateBaseCode: { 
      type: String, 
      default: "NAT",
      uppercase: true,
      trim: true 
    },
    stateBaseName: { 
      type: String, 
      default: "National Base",
      trim: true 
    },

    // Security & Lockout
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // ✅ Password Reset Fields
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

    // Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.AmbassadorUser || 
  mongoose.model<IAmbassadorUser>("AmbassadorUser", AmbassadorUserSchema);