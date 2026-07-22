import mongoose, { Schema, Document } from "mongoose";

export interface IAlumniUser extends Document {
  email: string;
  password?: string;
  isVerified: boolean;
  identityNumber?: string;
  
  // Personal Info
  fullName?: string;
  otherName?: string;
  gender?: string;
  dateOfBirth?: string;
  nin?: string;
  phoneNumber?: string;
  residentialAddress?: string;
  passportPhoto?: string;
  
  // Education Details
  schoolAttended?: string;
  admissionNumber?: string;
  yearOfAdmission?: number;
  yearOfGraduation?: number;
  houseHostel?: string;
  positionsHeld?: string;
  ssceCertificate?: string;
  highestQualification?: string;
  
  // Professional / Location
  currentOccupation?: string;
  stateOfResidence?: string;
  alumniMember?: string;

  // National Base Fields
  stateBaseCode?: string;
  stateBaseName?: string;
  
  // Security & Lockout
  failedLoginAttempts?: number;
  lockUntil?: Date;

  // Password Reset Fields
  resetToken?: string;
  resetTokenExpiry?: Date;
  
  // Soft Delete
  isDeleted?: boolean;
  deletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const AlumniUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    identityNumber: { type: String, default: null },
    
    // Personal Info
    fullName: { type: String, default: "" },
    otherName: { type: String, default: "" },
    gender: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    nin: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    residentialAddress: { type: String, default: "" },
    passportPhoto: { type: String, default: "" },
    
    // Education Details
    schoolAttended: { type: String, default: "" },
    admissionNumber: { type: String, default: "" },
    yearOfAdmission: { type: Number, default: 0 },
    yearOfGraduation: { type: Number, default: 0 },
    houseHostel: { type: String, default: "" },
    positionsHeld: { type: String, default: "" },
    ssceCertificate: { type: String, default: "" },
    highestQualification: { type: String, default: "" },
    
    // Professional / Location
    currentOccupation: { type: String, default: "" },
    stateOfResidence: { type: String, default: "" },
    alumniMember: { type: String, default: "" },

    // National Base Fields
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

    // Password Reset Fields
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

    // Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.AlumniUser || 
  mongoose.model<IAlumniUser>("AlumniUser", AlumniUserSchema);