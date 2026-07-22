export interface RateLimit {
  id?: string;
  ip: string;
  action: string;
  count: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
