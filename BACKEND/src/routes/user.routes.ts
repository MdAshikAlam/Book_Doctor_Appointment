import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo, checkAdminOwnership } from '../middlewares/auth';
import { branchHandler } from '../middlewares/branchHandler';
import { UserRole } from '../models/User';

const router = Router();

router.use(protect);
router.use(branchHandler);

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
router.get('/staff', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.getStaff);
router.post('/staff', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.createStaff);
router.patch('/staff/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), checkAdminOwnership, userController.updateStaff);
router.get('/admin-requests', restrictTo(UserRole.SUPER_ADMIN), userController.getPendingAdmins);
router.patch('/:id/status', restrictTo(UserRole.SUPER_ADMIN), userController.updateUserStatus);
router.delete('/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), checkAdminOwnership, userController.deleteUser);

export default router;
