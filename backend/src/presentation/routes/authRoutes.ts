import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.loginUser.bind(controller));
router.post('/admin/login', controller.loginAdmin.bind(controller));
router.post('/alumni/register', controller.registerAlumni.bind(controller));
router.get('/me', authMiddleware as any, controller.getCurrentUser.bind(controller));
router.put('/me', authMiddleware as any, controller.updateProfile.bind(controller));

export default router;
