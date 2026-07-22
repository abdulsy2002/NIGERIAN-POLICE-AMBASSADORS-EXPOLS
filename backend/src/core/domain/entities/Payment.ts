export interface Payment {
  id?: string;
  expolIdNumber: string;
  fullName: string;
  email: string;
  phone: string;
  purpose: 'reunion' | 'id-card' | 'membership' | 'donation' | 'other';
  customReason?: string | null;
  amount: number;
  currency?: string;
  paystackReference: string;
  paystackTransactionId?: string | null;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  paymentDate?: Date;
  notes?: string | null;
  createdAt?: Date;
}
