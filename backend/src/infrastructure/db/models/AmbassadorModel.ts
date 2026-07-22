import mongoose, { Schema } from 'mongoose';
import { Ambassador } from '../../../core/domain/entities/Ambassador';

const AmbassadorSchema = new Schema<Ambassador>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    identityNumber: { type: String },

    // Personal Information
    fullName: { type: String, default: 'Pending Completion' },
    gender: { type: String, default: 'Not Specified' },
    dateOfBirth: { type: String, default: '1990-01-01' },
    phoneNumber: { type: String, default: '' },
    state: { type: String, default: '' },
    residentialAddress: { type: String, default: '' },
    passportPhoto: { type: String, default: '' },

    // Professional Details
    occupation: { type: String, default: '' },
    organization: { type: String, default: '' },
    position: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    linkedinWebsite: { type: String, default: '' },

    // Ambassador Role
    ambassadorType: { type: String, default: '' },
    supportCommitment: { type: String, default: '' },
    supportType: { type: String, default: '' },
    whyAmbassador: { type: String, default: '' },
    messageToStudents: { type: String, default: '' },
    supportingDocument: { type: String, default: '' },

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

export const AmbassadorModel = mongoose.models.AmbassadorUser || mongoose.model<Ambassador>('AmbassadorUser', AmbassadorSchema);
