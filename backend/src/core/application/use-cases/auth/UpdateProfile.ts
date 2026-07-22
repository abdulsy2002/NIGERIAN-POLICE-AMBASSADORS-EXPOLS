import { IAlumniRepository } from '../../domain/repositories/IAlumniRepository';
import { IAmbassadorRepository } from '../../domain/repositories/IAmbassadorRepository';
import { ProfileUpdateRequestModel } from '../../../../infrastructure/db/models/ProfileUpdateRequestModel';

export class UpdateProfileUseCase {
  constructor(
    private alumniRepo: IAlumniRepository,
    private ambassadorRepo: IAmbassadorRepository
  ) {}

  async execute(userId: string, userType: string, payload: Record<string, any>) {
    // 1. Separate instant fields from pending fields
    const instantFields = [
      'passportPhoto',
      'phoneNumber',
      'residentialAddress',
      'occupation',
      'gender',
      'dateOfBirth',
      'nin',
      'linkedinWebsite'
    ];
    
    const pendingFields = [
      'fullName',
      'email',
      'schoolAttended',
      'stateBaseCode',
      'stateBaseName',
      'admissionNumber',
      'yearOfAdmission',
      'yearOfGraduation'
    ];

    const instantUpdates: Record<string, any> = {};
    const pendingUpdates: Record<string, any> = {};

    for (const [key, value] of Object.entries(payload)) {
      if (instantFields.includes(key)) {
        instantUpdates[key] = value;
      } else if (pendingFields.includes(key)) {
        pendingUpdates[key] = value;
      }
    }

    // 2. Fetch current user to get their name and email for the request
    let user: any = null;
    if (userType === 'alumni') {
      user = await this.alumniRepo.findById(userId);
    } else if (userType === 'ambassador') {
      user = await this.ambassadorRepo.findById(userId);
    }

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 3. Update instant fields directly
    if (Object.keys(instantUpdates).length > 0) {
      if (userType === 'alumni') {
        await this.alumniRepo.update(userId, instantUpdates);
      } else {
        await this.ambassadorRepo.update(userId, instantUpdates);
      }
    }

    let requestCreated = false;

    // 4. Create pending request for sensitive fields
    if (Object.keys(pendingUpdates).length > 0) {
      await ProfileUpdateRequestModel.create({
        userId,
        userType,
        userName: user.fullName,
        userEmail: user.email,
        requestedChanges: pendingUpdates,
        status: 'pending'
      });
      requestCreated = true;
    }

    return { 
      success: true, 
      message: requestCreated 
        ? 'Profile updated. Sensitive changes are pending admin approval.' 
        : 'Profile updated successfully.',
      hasPending: requestCreated
    };
  }
}
