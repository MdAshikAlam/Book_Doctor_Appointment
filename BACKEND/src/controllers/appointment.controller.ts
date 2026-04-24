import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';
import { AppointmentStatus } from '../models/Appointment';

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

export const bookAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = appointmentSchema.parse(req.body);
    const appointment = await appointmentService.bookAppointment({
      ...validatedData,
      patient: req.user!.id as any,
      doctor: validatedData.doctor as any,
      clinic: validatedData.clinic as any,
    });

    res.status(201).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentService.getMyAppointments(req.user!.id, req.user!.role);
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
    const { status } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      status as AppointmentStatus
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
    const { date, slot } = rescheduleSchema.parse(req.body);
    const appointment = await appointmentService.rescheduleAppointment(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      date,
      slot
    );

    res.status(200).json({
      status: 'success',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};
