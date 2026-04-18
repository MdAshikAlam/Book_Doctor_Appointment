import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';
import { AppointmentStatus } from '../models/Appointment';

const appointmentSchema = z.object({
  doctor: z.string(),
  clinic: z.string(),
  date: z.string().transform((str) => new Date(str)),
  slot: z.string(),
  reason: z.string(),
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
