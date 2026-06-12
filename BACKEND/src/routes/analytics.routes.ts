import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/dashboard-stats', protect, restrictTo(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST), analyticsController.getDashboardStats);
router.get('/notifications', protect, restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR), analyticsController.getNotificationCounts);
router.post('/mark-notified', protect, restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR), analyticsController.markNotificationsViewed);


export default router;
