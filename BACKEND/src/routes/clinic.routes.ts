import { Router } from 'express';
import * as clinicController from '../controllers/clinic.controller';
import { protect, restrictTo, optionalProtect } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clinics
 *   description: Clinic management
 */

/**
 * @swagger
 * /clinics:
 *   get:
 *     summary: Get all clinics
 *     tags: [Clinics]
 *     responses:
 *       200:
 *         description: List of clinics
 */
router.get('/', optionalProtect, clinicController.getClinics);
router.get('/:id', optionalProtect, clinicController.getClinic);

/**
 * @swagger
 * /clinics:
 *   post:
 *     summary: Create a new clinic
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Clinic'
 *     responses:
 *       201:
 *         description: Clinic created
 */
router.post(
  '/',
  protect,
  restrictTo(UserRole.DOCTOR, UserRole.ADMIN),
  clinicController.createClinic
);

router.patch(
  '/:id',
  protect,
  restrictTo(UserRole.DOCTOR, UserRole.ADMIN),
  clinicController.updateClinic
);

router.patch(
  '/:id/verify',
  protect,
  restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  clinicController.verifyClinic
);

export default router;
