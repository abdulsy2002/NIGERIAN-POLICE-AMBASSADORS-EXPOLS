import { Request, Response } from 'express';
import { ReunionSettingsModel } from '../../infrastructure/db/models/ReunionSettingsModel';
import { ReunionRegistrationModel } from '../../infrastructure/db/models/ReunionRegistrationModel';

export class ReunionController {
  async getSettings(_req: Request, res: Response): Promise<any> {
    try {
      let settings = await ReunionSettingsModel.findOne({}).lean();
      if (!settings) {
        // Create default settings if none exist
        const created = await ReunionSettingsModel.create({});
        settings = created.toObject();
      }
      return res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<any> {
    try {
      const updated = await ReunionSettingsModel.findOneAndUpdate({}, req.body, {
        upsert: true,
        new: true,
      }).lean();
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async submitRegistration(req: Request, res: Response): Promise<any> {
    try {
      const registration = await ReunionRegistrationModel.create(req.body);
      return res.status(201).json({ success: true, data: registration });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
