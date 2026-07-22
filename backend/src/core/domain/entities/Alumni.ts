export interface Alumni {
  id?: string;
  email: string;
  password?: string;
  isVerified: boolean;
  identityNumber?: string | null;

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
  deletedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}
