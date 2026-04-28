import { Router } from 'express';
import * as doctorController from '../controllers/doctor.controller';
import { protect, restrictTo, optionalProtect, checkDoctorOwnership } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor profile and search
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get('/', optionalProtect, doctorController.getDoctors);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor details
 */
router.get('/:id', doctorController.getDoctor);

/**
 * @swagger
 * /doctors/profile:
 *   post:
 *     summary: Create or update doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       201:
 *         description: Profile created/updated
 */
router.get(
  '/me',
  protect,
  restrictTo(UserRole.DOCTOR),
  doctorController.getMyProfile
);

router.post(
  '/profile',
  protect,
  restrictTo(UserRole.DOCTOR),
  doctorController.createMyProfile
);

router.post(
  '/',
  protect,
  restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN),
  doctorController.adminCreateDoctor
);

router.patch(
  '/:id',
  protect,
  restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN),
  checkDoctorOwnership,
  doctorController.adminUpdateDoctor
);

router.delete(
  '/:id',
  protect,
  restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN),
  checkDoctorOwnership,
  doctorController.deleteDoctor
);

router.post(
  '/:id/availability/generate',
  protect,
  restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN),
  checkDoctorOwnership,
  doctorController.generateAvailability
);

router.post(
  '/:id/leave',
  protect,
  restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN),
  checkDoctorOwnership,
  doctorController.addLeave
);

export default router;
