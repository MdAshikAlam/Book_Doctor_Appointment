import { Router } from 'express';
import * as clinicController from '../controllers/clinic.controller';
import * as reviewController from '../controllers/review.controller';
import { protect, restrictTo, optionalProtect } from '../middlewares/auth';
import { branchHandler } from '../middlewares/branchHandler';
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
router.get('/', optionalProtect, branchHandler, clinicController.getClinics);
router.get('/pending', protect, restrictTo(UserRole.SUPER_ADMIN), clinicController.getPendingClinics);
router.patch('/:id/status', protect, restrictTo(UserRole.SUPER_ADMIN), clinicController.updateClinicStatus);
router.get('/:id', optionalProtect, branchHandler, clinicController.getClinic);

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
  branchHandler,
  restrictTo(UserRole.DOCTOR, UserRole.ADMIN),
  clinicController.createClinic
);

router.patch(
  '/:id',
  protect,
  branchHandler,
  restrictTo(UserRole.DOCTOR, UserRole.ADMIN),
  clinicController.updateClinic
);

router.patch(
  '/:id/verify',
  protect,
  branchHandler,
  restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  clinicController.verifyClinic
);

// Review Routes
router.post('/:clinicId/reviews', protect, reviewController.createReview);
router.get('/:clinicId/reviews', optionalProtect, reviewController.getClinicReviews);

export default router;
