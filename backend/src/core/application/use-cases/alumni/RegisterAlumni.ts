import { IAlumniRepository } from '../../../domain/repositories/IAlumniRepository';
import { IAmbassadorRepository } from '../../../domain/repositories/IAmbassadorRepository';
import { BcryptService } from '../../../../infrastructure/security/BcryptService';
import { Alumni } from '../../../domain/entities/Alumni';

export class RegisterAlumniUseCase {
  constructor(
    private alumniRepo: IAlumniRepository,
    private ambassadorRepo: IAmbassadorRepository,
    private bcryptService: BcryptService
  ) {}

  async execute(data: any): Promise<{ success: boolean; message: string }> {
    const { email, password } = data;

    const existingAlumni = await this.alumniRepo.findByEmail(email);
    const existingAmbassador = await this.ambassadorRepo.findByEmail(email);

    if (existingAlumni) {
      return { success: false, message: 'Email already registered as Alumni.' };
    }

    if (existingAmbassador) {
      return {
        success: false,
        message: 'This email is already registered as an Ambassador. Please use a different email or login.',
      };
    }

    if (!password) {
      return { success: false, message: 'Password is required.' };
    }

    const hashedPassword = await this.bcryptService.hash(password);

    const alumni: Alumni = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      nin: data.nin,
      residentialAddress: data.residentialAddress,
      schoolAttended: data.schoolAttended,
      yearOfGraduation: parseInt(data.yearOfGraduation, 10),
      stateBaseName: data.stateBaseName,
      stateBaseCode: data.stateBaseCode,
      passportPhoto: data.passportPhoto,
      ssceCertificate: data.ssceCertificate,
      admissionNumber: data.admissionNumber,
      yearOfAdmission: data.yearOfAdmission ? parseInt(data.yearOfAdmission, 10) : undefined,
      houseHostel: data.houseHostel,
      positionsHeld: data.positionsHeld,
      highestQualification: data.highestQualification,
      currentOccupation: data.currentOccupation,
      stateOfResidence: data.stateOfResidence,
      alumniMember: data.alumniMember,
      password: hashedPassword,
      isVerified: false,
      identityNumber: null,
    };

    await this.alumniRepo.create(alumni);

    return { success: true, message: 'Registration successful.' };
  }
}
