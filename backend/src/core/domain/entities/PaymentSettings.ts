export interface PaymentPurpose {
  value: string;
  label: string;
  amount: number;
  enabled: boolean;
  order: number;
}

export interface PaymentSettings {
  id?: string;
  purposes: PaymentPurpose[];
  updatedAt?: Date;
}
