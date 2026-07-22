import { ReunionSettings } from '../entities/ReunionSettings';

export interface IReunionSettingsRepository {
  getSettings(): Promise<ReunionSettings | null>;
  saveSettings(settings: ReunionSettings): Promise<ReunionSettings>;
}
