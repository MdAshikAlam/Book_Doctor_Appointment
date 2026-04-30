import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/dashboard-stats', protect, restrictTo(UserRole.ADMIN, UserRole.SUPER_ADMIN), analyticsController.getDashboardStats);

export default router;
