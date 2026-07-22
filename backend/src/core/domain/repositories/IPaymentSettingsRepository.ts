import { PaymentSettings } from '../entities/PaymentSettings';

export interface IPaymentSettingsRepository {
  getSettings(): Promise<PaymentSettings | null>;
  saveSettings(settings: PaymentSettings): Promise<PaymentSettings>;
}
