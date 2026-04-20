import Appointment, { IAppointment, AppointmentStatus } from '../models/Appointment';
import Doctor from '../models/Doctor';
import { AppError } from '../middlewares/error';

export const bookAppointment = async (data: Partial<IAppointment>) => {
  const { doctor, date, slot } = data;
  if (!doctor || !date || !slot) {
    throw new AppError('Doctor, date and slot are required for booking', 400);
  }

  // Check if slot is available (Simple check for now)
  const existing = await Appointment.findOne({
    doctor,
    date,
    slot,
    status: { $ne: AppointmentStatus.CANCELLED },
  });

  if (existing) {
    throw new AppError('This slot is already booked', 400);
  }

  return await Appointment.create(data);
};

export const getMyAppointments = async (userId: string, role: string) => {
  const filter: any = {};
  if (role === 'patient') {
    filter.patient = userId;
  } else if (role === 'doctor') {
    filter.doctor = userId;
  }
  
  return await Appointment.find(filter)
    .populate('patient', 'name email')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name email avatar' }
    })
    .populate('clinic');
};

export const updateAppointmentStatus = async (id: string, userId: string, role: string, status: AppointmentStatus) => {
  const filter: any = { _id: id };
  if (role === 'doctor') {
    filter.doctor = userId;
  } else if (role === 'patient') {
    filter.patient = userId;
  }

  const appointment = await Appointment.findOneAndUpdate(filter, { status }, { new: true });
  if (!appointment) {
    throw new AppError('Appointment not found or unauthorized', 404);
  }
  return appointment;
};
