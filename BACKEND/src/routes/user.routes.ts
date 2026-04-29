import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo, checkAdminOwnership } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

router.get('/me', userController.getMe);
router.get('/patients', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), userController.getPatients);
router.patch('/patients/:id/status', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), userController.updatePatientStatus);
router.get('/patients/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR), userController.getPatientById);
router.get('/hierarchy', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.getHierarchy);
router.get('/staff', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN), userController.getStaff);
router.post('/staff', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN), userController.createStaff);
router.patch('/staff/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN), checkAdminOwnership, userController.updateStaff);
router.delete('/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN), checkAdminOwnership, userController.deleteUser);

export default router;
