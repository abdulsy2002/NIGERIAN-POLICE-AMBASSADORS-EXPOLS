import { PaymentSettings } from '../../core/domain/entities/PaymentSettings';
import { IPaymentSettingsRepository } from '../../core/domain/repositories/IPaymentSettingsRepository';
import { PaymentSettingsModel } from '../db/models/PaymentSettingsModel';

export class MongoPaymentSettingsRepository implements IPaymentSettingsRepository {
  async getSettings(): Promise<PaymentSettings | null> {
    const doc = await PaymentSettingsModel.findOne({}).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async saveSettings(settings: PaymentSettings): Promise<PaymentSettings> {
    const doc = await PaymentSettingsModel.findOneAndUpdate(
      {},
      { ...settings, updatedAt: new Date() },
      { upsert: true, new: true }
    ).lean();
    return this.mapToEntity(doc);
  }

  private mapToEntity(doc: any): PaymentSettings {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as PaymentSettings;
  }
}
