import Appointment, { IAppointment, AppointmentStatus } from '../models/Appointment';
import Doctor from '../models/Doctor';
import { AppError } from '../middlewares/error';

export const bookAppointment = async (data: Partial<IAppointment>) => {
  const { doctor: doctorId, date, slot, clinic } = data;
  if (!doctorId || !date || !slot) {
    throw new AppError('Doctor, date and slot are required for booking', 400);
  }

  // If clinic is missing, try to get it from the doctor
  if (!clinic) {
    const doctor = await Doctor.findById(doctorId);
    if (doctor && doctor.clinic) {
      data.clinic = doctor.clinic;
    }
  }

  // Check if slot is available (Simple check for now)
  const existing = await Appointment.findOne({
    doctor: doctorId,
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
    // Find doctor profile for this user
    const doctor = await Doctor.findOne({ user: userId });
    if (doctor) filter.doctor = doctor._id;
  } else if (role === 'admin' || role === 'sub_admin') {
    // Find doctors in this admin's hierarchy
    // We need to look at the User role and parents
    const User = (await import('../models/User')).default;
    const usersInHierarchy = await User.find({
      $or: [
        { parentAdmin: userId },
        { parentSubAdmin: userId }
      ],
      role: 'doctor'
    }).select('_id');
    
    const doctors = await Doctor.find({ user: { $in: usersInHierarchy.map(u => u._id) } }).select('_id');
    filter.doctor = { $in: doctors.map(d => d._id) };
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
  } else if (role === 'admin' || role === 'sub_admin') {
    // Verify the appointment belongs to a doctor created by this admin
    const app = await Appointment.findById(id).populate('doctor');
    if (!app || (app.doctor as any).createdBy?.toString() !== userId) {
      throw new AppError('Unauthorized access to this appointment', 403);
    }
  }

  const appointment = await Appointment.findOneAndUpdate(filter, { status }, { new: true });
  if (!appointment) {
    throw new AppError('Appointment not found or unauthorized', 404);
  }
  return appointment;
};
