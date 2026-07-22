import { Router } from 'express';
import { ReunionController } from '../controllers/ReunionController';

const router = Router();
const controller = new ReunionController();

router.get('/settings', controller.getSettings.bind(controller));
router.post('/settings', controller.updateSettings.bind(controller));
router.post('/register', controller.submitRegistration.bind(controller));

export default router;
