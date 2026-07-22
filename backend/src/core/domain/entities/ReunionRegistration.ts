export interface ReunionRegistration {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  graduationYear: number;
  attendanceType: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentReference?: string;
  amountPaid?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
