import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, roleGuard } from '../middleware/auth';

const router = Router();
const controller = new AdminController();

// Public: get board members (used on the leadership page without auth)
router.get('/board-members', controller.getBoardMembers.bind(controller));

// Gate remaining admin routes to admin roles
router.use(authMiddleware as any);
router.use(roleGuard(['super_admin', 'national_admin', 'state_admin']) as any);

router.post('/approve', controller.approveUser.bind(controller));
router.get('/alumni', controller.getAlumni.bind(controller));
router.get('/ambassadors', controller.getAmbassadors.bind(controller));
router.get('/audit-logs', controller.getAuditLogs.bind(controller));

// Board member management (admin only)
router.post('/board-members', controller.createBoardMember.bind(controller));
router.put('/board-members/:id', controller.updateBoardMember.bind(controller));
router.delete('/board-members/:id', controller.deleteBoardMember.bind(controller));

// Profile Update Requests
router.get('/profile-requests', controller.getProfileRequests.bind(controller));
router.post('/profile-requests/:id/process', controller.processProfileRequest.bind(controller));

export default router;

