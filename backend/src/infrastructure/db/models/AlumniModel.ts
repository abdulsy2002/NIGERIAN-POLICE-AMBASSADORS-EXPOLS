import mongoose, { Schema } from 'mongoose';
import { Alumni } from '../../../core/domain/entities/Alumni';

const AlumniSchema = new Schema<Alumni>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    identityNumber: { type: String, default: null },

    // Personal Info
    fullName: { type: String, default: '' },
    otherName: { type: String, default: '' },
    gender: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    nin: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    residentialAddress: { type: String, default: '' },
    passportPhoto: { type: String, default: '' },

    // Education Details
    schoolAttended: { type: String, default: '' },
    admissionNumber: { type: String, default: '' },
    yearOfAdmission: { type: Number, default: 0 },
    yearOfGraduation: { type: Number, default: 0 },
    houseHostel: { type: String, default: '' },
    positionsHeld: { type: String, default: '' },
    ssceCertificate: { type: String, default: '' },
    highestQualification: { type: String, default: '' },

    // Professional / Location
    currentOccupation: { type: String, default: '' },
    stateOfResidence: { type: String, default: '' },
    alumniMember: { type: String, default: '' },

    // National Base Fields
    stateBaseCode: {
      type: String,
      default: 'NAT',
      uppercase: true,
      trim: true,
    },
    stateBaseName: {
      type: String,
      default: 'National Base',
      trim: true,
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

export const AlumniModel = mongoose.models.AlumniUser || mongoose.model<Alumni>('AlumniUser', AlumniSchema);
