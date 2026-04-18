import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

router.get('/staff', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.getStaff);
router.post('/staff', restrictTo(UserRole.SUPER_ADMIN), userController.createStaff);
router.patch('/staff/:id', restrictTo(UserRole.SUPER_ADMIN), userController.updateStaff);
router.delete('/:id', restrictTo(UserRole.SUPER_ADMIN), userController.deleteUser);

export default router;
