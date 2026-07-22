export interface Ambassador {
  id?: string;
  email: string;
  password?: string;
  isApproved: boolean;
  identityNumber?: string | null;

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
  deletedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}
