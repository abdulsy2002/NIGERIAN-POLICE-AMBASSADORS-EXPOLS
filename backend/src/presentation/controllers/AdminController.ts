import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApproveUserUseCase } from '../../core/application/use-cases/admin/ApproveUser';
import { MongoAlumniRepository } from '../../infrastructure/repositories/MongoAlumniRepository';
import { MongoAmbassadorRepository } from '../../infrastructure/repositories/MongoAmbassadorRepository';
import { MongoAuditLogRepository } from '../../infrastructure/repositories/MongoAuditLogRepository';
import { MongoBoardMemberRepository } from '../../infrastructure/repositories/MongoBoardMemberRepository';
import { ResendEmailService } from '../../infrastructure/services/ResendEmailService';
import { ProcessProfileUpdateUseCase } from '../../core/application/use-cases/admin/ProcessProfileUpdate';
import { ProfileUpdateRequestModel } from '../../infrastructure/db/models/ProfileUpdateRequestModel';

const alumniRepo = new MongoAlumniRepository();
const ambassadorRepo = new MongoAmbassadorRepository();
const auditLogRepo = new MongoAuditLogRepository();
const boardMemberRepo = new MongoBoardMemberRepository();
const emailService = new ResendEmailService();

const approveUserUseCase = new ApproveUserUseCase(
  alumniRepo,
  ambassadorRepo,
  auditLogRepo,
  emailService
);

const processProfileUpdateUseCase = new ProcessProfileUpdateUseCase(
  alumniRepo,
  ambassadorRepo
);

export class AdminController {
  async approveUser(req: AuthenticatedRequest, res: Response) {
    const { userId, userType } = req.body;
    const adminEmail = req.user?.email || 'unknown_admin';

    if (!userId || !userType) {
      return res.status(400).json({ success: false, message: 'Missing userId or userType' });
    }

    try {
      const result = await approveUserUseCase.execute(userId, userType, adminEmail);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAlumni(_req: AuthenticatedRequest, res: Response) {
    try {
      const alumni = await alumniRepo.find({ isDeleted: { $ne: true } }, { sort: { createdAt: -1 } });
      return res.status(200).json({ success: true, data: alumni });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAmbassadors(_req: AuthenticatedRequest, res: Response) {
    try {
      const ambassadors = await ambassadorRepo.find({ isDeleted: { $ne: true } }, { sort: { createdAt: -1 } });
      return res.status(200).json({ success: true, data: ambassadors });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAuditLogs(_req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await auditLogRepo.find({}, { sort: { timestamp: -1 }, limit: 200 });
      return res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ===== BOARD MEMBERS =====
  async getBoardMembers(_req: AuthenticatedRequest, res: Response) {
    try {
      const members = await boardMemberRepo.find({}, { sort: { isFeatured: -1, createdAt: -1 } });
      return res.status(200).json({ success: true, data: members });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createBoardMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, role, bio, photoUrl, isFeatured, linkedin, twitter } = req.body;
      if (!name || !role || !bio || !photoUrl) {
        return res.status(400).json({ success: false, message: 'name, role, bio, and photoUrl are required' });
      }
      const member = await boardMemberRepo.create({ name, role, bio, photoUrl, isFeatured: !!isFeatured, linkedin, twitter });
      return res.status(201).json({ success: true, data: member });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateBoardMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const member = await boardMemberRepo.update(id, updates);
      if (!member) return res.status(404).json({ success: false, message: 'Board member not found' });
      return res.status(200).json({ success: true, data: member });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteBoardMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await boardMemberRepo.delete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Board member not found' });
      return res.status(200).json({ success: true, message: 'Board member deleted' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getProfileRequests(req: AuthenticatedRequest, res: Response) {
    try {
      // Get pending requests, sorted by oldest first
      const requests = await ProfileUpdateRequestModel.find({ status: 'pending' }).sort({ createdAt: 1 }).lean();
      return res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async processProfileRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'approve' or 'reject'
      
      if (!req.user?.email) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ success: false, error: 'Invalid action. Must be approve or reject.' });
      }

      const result = await processProfileUpdateUseCase.execute(id, req.user.email, action);
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
