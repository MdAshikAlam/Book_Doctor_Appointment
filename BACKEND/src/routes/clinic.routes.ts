import { Router } from 'express';
import * as clinicController from '../controllers/clinic.controller';
import { protect, restrictTo } from '../middlewares/auth';
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
router.get('/', clinicController.getClinics);

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

export default router;
