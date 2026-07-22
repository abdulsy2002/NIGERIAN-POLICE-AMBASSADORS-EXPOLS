import { ReunionSettings } from '../../core/domain/entities/ReunionSettings';
import { IReunionSettingsRepository } from '../../core/domain/repositories/IReunionSettingsRepository';
import { ReunionSettingsModel } from '../db/models/ReunionSettingsModel';

export class MongoReunionSettingsRepository implements IReunionSettingsRepository {
  async getSettings(): Promise<ReunionSettings | null> {
    const doc = await ReunionSettingsModel.findOne({}).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async saveSettings(settings: ReunionSettings): Promise<ReunionSettings> {
    const doc = await ReunionSettingsModel.findOneAndUpdate(
      {},
      { ...settings, updatedAt: new Date() },
      { upsert: true, new: true }
    ).lean();
    return this.mapToEntity(doc);
  }

  private mapToEntity(doc: any): ReunionSettings {
    const { _id, __v, ...rest } = doc;
    return { id: _id.toString(), ...rest } as ReunionSettings;
  }
}
