import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { protect } from '../middlewares/auth';
import { branchHandler } from '../middlewares/branchHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

router.use(protect);
router.use(branchHandler);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor
 *               - clinic
 *               - date
 *               - slot
 *               - reason
 *             properties:
 *               doctor:
 *                 type: string
 *               clinic:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               slot:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', appointmentController.bookAppointment);

/**
 * @swagger
 * /appointments/my:
 *   get:
 *     summary: Get my appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/my', appointmentController.getMyAppointments);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/:id/status', appointmentController.updateStatus);
router.patch('/:id/reschedule', appointmentController.rescheduleAppointment);

export default router;
