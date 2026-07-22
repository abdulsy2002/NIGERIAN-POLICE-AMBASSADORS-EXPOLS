import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();
const controller = new PaymentController();

router.post('/initialize', controller.initializePayment.bind(controller));
router.get('/verify/:reference', controller.verifyPayment.bind(controller));

export default router;
