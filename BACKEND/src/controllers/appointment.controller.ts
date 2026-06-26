import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';
import { AppointmentStatus } from '../models/Appointment';
import { AppError } from '../middlewares/error';

const appointmentSchema = z.object({
  doctor: z.string(),
  clinic: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  slot: z.string(),
  reason: z.string().optional().default('General Checkup'),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  aadhaar: z.string(),
  dob: z.string().transform((str) => new Date(str)),
  gender: z.string(),
  address: z.string(),
  country: z.string(),
  city: z.string(),
  visitedBefore: z.boolean().optional().default(false),
});

export const bookAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, id: userId } = (req as any).user;
    
    // Restriction: Doctors cannot book appointments
    if (role === 'doctor') {
      throw new AppError('Doctors are not authorized to book appointments', 403);
    }

    const validatedData = appointmentSchema.parse(req.body);
    const branchId = (req as any).branchId || (req as any).user.branchId;

    const bookingData: any = {
      ...validatedData,
      doctor: validatedData.doctor as any,
      clinic: validatedData.clinic as any,
      branchId: branchId,
    };

    // If receptionist is booking, they can specify a patient ID
    if (role === 'admin' || role === 'receptionist') {
      bookingData.patient = req.body.patient || userId;
    } else {
      // Regular patient booking their own appointment
      bookingData.patient = userId;
    }

    const appointment = await appointmentService.bookAppointment(bookingData);

    res.status(201).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId, role } = (req as any).user;
    const branchId = (req as any).branchId;
    const { status } = req.query;
    const appointments = await appointmentService.getMyAppointments(userId, role, branchId, status as string);
    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, diagnosis, prescription, notes, prescriptions, consultationNotes, reports, followUp, dischargeSummary, draftDiagnosis, draftPrescription, draftNotes } = req.body;
    const branchId = (req as any).branchId || (req as any).user.branchId;
    
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      status as AppointmentStatus,
      branchId,
      { diagnosis, prescription, notes, prescriptions, consultationNotes, reports, followUp, dischargeSummary, draftDiagnosis, draftPrescription, draftNotes }
    );

    res.status(200).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

const rescheduleSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  slot: z.string(),
});

export const rescheduleAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    
    // Restriction: Doctors cannot reschedule appointments
    if (role === 'doctor') {
      throw new AppError('Doctors cannot reschedule appointments. Please contact the reception.', 403);
    }

    const { date, slot } = rescheduleSchema.parse(req.body);
    const branchId = (req as any).branchId || (req as any).user.branchId;
    const appointment = await appointmentService.rescheduleAppointment(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      date,
      slot,
      branchId
    );

    res.status(200).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

export const callNextPatient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    if (role === 'doctor') {
      throw new AppError('Doctors are not authorized to manage the queue.', 403);
    }
    const appointment = await appointmentService.callNextPatient(req.user!.id);
    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};
