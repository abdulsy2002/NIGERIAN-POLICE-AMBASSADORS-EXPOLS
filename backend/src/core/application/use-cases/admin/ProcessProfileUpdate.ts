import { IAlumniRepository } from '../../domain/repositories/IAlumniRepository';
import { IAmbassadorRepository } from '../../domain/repositories/IAmbassadorRepository';
import { ProfileUpdateRequestModel } from '../../../../infrastructure/db/models/ProfileUpdateRequestModel';

export class ProcessProfileUpdateUseCase {
  constructor(
    private alumniRepo: IAlumniRepository,
    private ambassadorRepo: IAmbassadorRepository
  ) {}

  async execute(requestId: string, adminEmail: string, action: 'approve' | 'reject') {
    const request = await ProfileUpdateRequestModel.findById(requestId);
    
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Request is already processed' };
    }

    if (action === 'approve') {
      const updates = request.requestedChanges;
      
      if (request.userType === 'alumni') {
        await this.alumniRepo.update(request.userId, updates);
      } else if (request.userType === 'ambassador') {
        await this.ambassadorRepo.update(request.userId, updates);
      }
      
      request.status = 'approved';
    } else {
      request.status = 'rejected';
    }

    request.reviewedBy = adminEmail;
    request.reviewedAt = new Date();
    await request.save();

    return { success: true, message: `Profile update request ${action}d successfully.` };
  }
}
