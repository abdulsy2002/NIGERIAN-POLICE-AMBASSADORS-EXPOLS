import { Request, Response } from 'express';
import { LoginUserUseCase } from '../../core/application/use-cases/auth/LoginUser';
import { LoginAdminUseCase } from '../../core/application/use-cases/auth/LoginAdmin';
import { RegisterAlumniUseCase } from '../../core/application/use-cases/alumni/RegisterAlumni';
import { MongoAlumniRepository } from '../../infrastructure/repositories/MongoAlumniRepository';
import { MongoAmbassadorRepository } from '../../infrastructure/repositories/MongoAmbassadorRepository';
import { MongoAuditLogRepository } from '../../infrastructure/repositories/MongoAuditLogRepository';
import { MongoAdminRepository } from '../../infrastructure/repositories/MongoAdminRepository';
import { BcryptService } from '../../infrastructure/security/BcryptService';
import { JwtService } from '../../infrastructure/security/JwtService';
import { UpdateProfileUseCase } from '../../core/application/use-cases/auth/UpdateProfile';

const alumniRepo = new MongoAlumniRepository();
const ambassadorRepo = new MongoAmbassadorRepository();
const auditLogRepo = new MongoAuditLogRepository();
const adminRepo = new MongoAdminRepository();
const bcryptService = new BcryptService();
const jwtService = new JwtService();

const loginUserUseCase = new LoginUserUseCase(
  alumniRepo,
  ambassadorRepo,
  auditLogRepo,
  bcryptService,
  jwtService
);

const loginAdminUseCase = new LoginAdminUseCase(
  adminRepo,
  auditLogRepo,
  bcryptService,
  jwtService
);

const registerAlumniUseCase = new RegisterAlumniUseCase(
  alumniRepo,
  ambassadorRepo,
  bcryptService
);

const updateProfileUseCase = new UpdateProfileUseCase(
  alumniRepo,
  ambassadorRepo
);

export class AuthController {
  async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;
    const ip = req.ip || '127.0.0.1';

    try {
      const result = await loginUserUseCase.execute(email, password, ip);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async loginAdmin(req: Request, res: Response) {
    const { email, password } = req.body;
    const ip = req.ip || '127.0.0.1';

    try {
      const result = await loginAdminUseCase.execute(email, password, ip);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async registerAlumni(req: Request, res: Response) {
    try {
      const result = await registerAlumniUseCase.execute(req.body);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    const authRequest = req as any;
    if (!authRequest.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
      const { userId, role } = authRequest.user;
      let userData: any = null;
      if (role === 'alumni') {
        userData = await alumniRepo.findById(userId);
      } else if (role === 'ambassador') {
        userData = await ambassadorRepo.findById(userId);
      } else {
        userData = await adminRepo.findById(userId);
      }

      if (!userData) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Strip password
      const { password, ...safeUser } = userData;
      return res.status(200).json({ success: true, user: safeUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    const authRequest = req as any;
    if (!authRequest.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
      const { userId, role } = authRequest.user;
      const result = await updateProfileUseCase.execute(userId, role, req.body);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
