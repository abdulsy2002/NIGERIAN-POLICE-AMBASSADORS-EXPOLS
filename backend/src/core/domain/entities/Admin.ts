export interface Admin {
  id?: string;
  fullName: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'national_admin' | 'state_admin';
  stateBase?: string | null;
  mustChangePassword: boolean;
  failedLoginAttempts?: number;
  lockUntil?: Date;
  createdAt?: Date;
}
