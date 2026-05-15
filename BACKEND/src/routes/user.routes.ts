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
router.get('/patients', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, 'sub_admin' as any), userController.getPatients);
router.patch('/patients/:id/status', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, 'sub_admin' as any), userController.updatePatientStatus);
router.get('/patients/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, 'sub_admin' as any), userController.getPatientById);
router.get('/hierarchy', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, 'sub_admin' as any), userController.getHierarchy);
router.get('/staff', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, 'sub_admin' as any), userController.getStaff);
router.post('/staff', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, 'sub_admin' as any), userController.createStaff);
router.patch('/staff/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), checkAdminOwnership, userController.updateStaff);
router.get('/admin-requests', restrictTo(UserRole.SUPER_ADMIN), userController.getPendingAdmins);
router.patch('/:id/status', restrictTo(UserRole.SUPER_ADMIN), userController.updateUserStatus);
router.delete('/:id', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN), checkAdminOwnership, userController.deleteUser);

// Super Admin Management Routes
router.patch('/:id/suspend', restrictTo(UserRole.SUPER_ADMIN), userController.suspendUser);
router.patch('/:id/reactivate', restrictTo(UserRole.SUPER_ADMIN), userController.reactivateUser);
router.post('/:id/reset-password', restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST), userController.resetUserPassword);
router.post('/transfer-data', restrictTo(UserRole.SUPER_ADMIN), userController.transferAdminData);
router.get('/activity-logs', restrictTo(UserRole.SUPER_ADMIN), userController.getActivityLogs);
router.get('/trash-bin', restrictTo(UserRole.SUPER_ADMIN), userController.getTrashBin);
router.post('/trash-bin/:adminId/restore', restrictTo(UserRole.SUPER_ADMIN), userController.restoreFromTrash);

export default router;
