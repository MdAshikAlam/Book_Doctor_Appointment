import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public endpoint for submitting contact form
router.post('/', contactController.submitContact);

// Admin only endpoint to view all contacts
router.get('/admin/contacts', contactController.getAllContacts);

export default router;
