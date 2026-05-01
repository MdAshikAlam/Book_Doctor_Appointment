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

  // Check if doctor is on leave
  const checkDoctor = await Doctor.findById(doctorId);
  if (!checkDoctor) throw new AppError('Doctor not found', 404);

  // 1. Check Day of Week Availability
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bookingDayName = days[new Date(date).getDay()];
  const isAvailableOnDay = checkDoctor.availability?.some(a => a.day === bookingDayName && a.slots.length > 0);
  
  if (!isAvailableOnDay) {
    throw new AppError(`Doctor is not available on this day (${bookingDayName})`, 400);
  }

  // 2. Check Leaves
  if (checkDoctor.leaves && checkDoctor.leaves.length > 0) {
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Normalize booking date
    
    const isOnLeave = checkDoctor.leaves.some(leave => {
      const start = new Date(leave.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(leave.endDate);
      end.setHours(23, 59, 59, 999);
      return bookingDate >= start && bookingDate <= end;
    });
    
    if (isOnLeave) {
      throw new AppError('The doctor is on leave on this date. Please select another date.', 400);
    }
  }

  if (existing) {
    throw new AppError('This slot is already booked', 400);
  }

  return await Appointment.create(data);
};

export const getMyAppointments = async (userId: string, role: string, branchId?: string) => {
  const filter: any = {};
  
  if (branchId) {
    filter.branchId = branchId;
  }

  if (role === 'patient') {
    filter.patient = userId;
  } else if (role === 'doctor') {
    // Find doctor profile for this user
    const doctor = await Doctor.findOne({ user: userId });
    if (doctor) filter.doctor = doctor._id;
  } else if (role === 'admin' || role === 'receptionist') {
    // Admins and Receptionists only see appointments within their branch
    // branchId is already added to filter if provided from controller
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
  if (role === 'patient' || role === 'user') {
    filter.patient = userId;
  } else if (role === 'doctor') {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);
    filter.doctor = doctor._id;
  } else if (role === 'admin' || role === 'receptionist') {
    const app = await Appointment.findById(id).populate({
      path: 'doctor',
      select: 'parentAdmin parentReceptionist'
    });
    
    const isOwner = app && (
      (role === 'admin' && (app.doctor as any).parentAdmin?.toString() === userId) ||
      (role === 'receptionist' && (app.doctor as any).parentReceptionist?.toString() === userId)
    );

    if (!isOwner) {
      throw new AppError('Unauthorized access to this appointment', 403);
    }
  }

  const appointment = await Appointment.findOneAndUpdate(filter, { status }, { new: true })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  if (!appointment) {
    throw new AppError('Appointment not found or unauthorized', 404);
  }

  // If status is completed, move to Patients collection and remove from Appointments
  if (status === AppointmentStatus.COMPLETED) {
    console.log('--- Migrating Appointment to Patient collection ---');
    console.log('Appointment ID:', appointment._id);
    console.log('Doctor Data:', appointment.doctor);
    
    const Patient = (await import('../models/Patient')).default;
    
    const patientRecord = await Patient.create({
      patientName: appointment.fullName,
      email: appointment.email,
      phone: appointment.phone,
      doctorName: (appointment.doctor as any).user?.name || 'Unknown Doctor',
      date: appointment.date,
      timeSlot: appointment.slot,
      reason: appointment.reason,
      location: `${appointment.city}, ${appointment.country}`,
      status: 'visited',
      patientStatus: 'Active',
      patientId: appointment.patient,
      doctorId: appointment.doctor._id,
      clinic: appointment.clinic,
      branchId: (appointment as any).branchId,
      aadhaar: appointment.aadhaar,
      dob: appointment.dob,
      gender: appointment.gender,
      address: appointment.address,
      city: appointment.city,
      country: appointment.country
    } as any);

    console.log('Patient record created successfully:', patientRecord._id);

    // Option 1: Delete the appointment (as requested)
    await Appointment.findByIdAndDelete((appointment as any)._id);
    console.log('Appointment record deleted successfully:', (appointment as any)._id);
  }

  return appointment;
};

export const rescheduleAppointment = async (id: string, userId: string, role: string, date: Date, slot: string) => {
  const filter: any = { _id: id };
  if (role === 'doctor') {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);
    filter.doctor = doctor._id;
  } else if (role === 'admin' || role === 'receptionist') {
    // Similar ownership check
    const app = await Appointment.findById(id).populate('doctor');
    const isOwner = app && (
      (role === 'admin' && (app.doctor as any).parentAdmin?.toString() === userId) ||
      (role === 'receptionist' && (app.doctor as any).parentReceptionist?.toString() === userId)
    );
    if (!isOwner) throw new AppError('Unauthorized', 403);
  }

  const appointment = await Appointment.findOneAndUpdate(
    filter, 
    { date, slot, status: AppointmentStatus.CONFIRMED }, 
    { new: true }
  );
  
  if (!appointment) {
    throw new AppError('Appointment not found or unauthorized', 404);
  }
  return appointment;
};
