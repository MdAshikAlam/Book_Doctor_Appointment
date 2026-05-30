import { Request, Response, NextFunction } from 'express';
import Contact from '../models/Contact';
import { sendEmail } from '../utils/email';
import config from '../config';

// POST /api/v1/contact
export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone, category, subject, message } = req.body;
    if (!fullName || !email || !phone || !category || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const contact = await Contact.create({
      fullName,
      email,
      phone,
      category,
      subject,
      message,
    });

    // Send thank‑you email to the user
    const thankYouSubject = 'Thank you for contacting BookMyDoctor';
    const thankYouText = `Hi ${fullName},\n\nThank you for reaching out regarding "${subject}". We have received your message and will get back to you shortly.\n\nBest regards,\nBookMyDoctor Team`;
    await sendEmail(email, thankYouSubject, thankYouText);

    res.status(201).json({ message: 'Contact request submitted successfully.', data: contact });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/contacts - admin only
export const getAllContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ total: contacts.length, data: contacts });
  } catch (error) {
    next(error);
  }
};
