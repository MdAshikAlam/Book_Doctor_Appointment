import Appointment, { IAppointment, AppointmentStatus } from '../models/Appointment';
import Doctor from '../models/Doctor';
import { AppError } from '../middlewares/error';

export const bookAppointment = async (data: Partial<IAppointment>) => {
  const { doctor: doctorId, date, slot, clinic } = data;
  if (!doctorId || !date || !slot) {
    throw new AppError('Doctor, date and slot are required for booking', 400);
  }

  // If clinic or branchId is missing, try to get them from the doctor
  if (!data.clinic || !data.branchId) {
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      if (!data.clinic && doctor.clinic) {
        data.clinic = doctor.clinic;
      }
      if (!data.branchId && doctor.branchId) {
        data.branchId = doctor.branchId;
      }
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
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Use UTC day to avoid timezone shifts for date-only strings
  const dateObj = new Date(date);
  const dayIndex = dateObj.getUTCDay();
  const bookingDayShort = shortDays[dayIndex];
  const bookingDayFull = fullDays[dayIndex];
  
  const isAvailableOnDay = checkDoctor.availability?.some(a => 
    (a.day === bookingDayShort || a.day === bookingDayFull) && a.slots.length > 0
  );
  
  if (!isAvailableOnDay) {
    throw new AppError(`Doctor is not available on this day (${bookingDayFull})`, 400);
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

export const getMyAppointments = async (userId: string, role: string, branchId?: string, status?: string) => {
  const filter: any = {};
  
  if (branchId) {
    filter.branchId = branchId;
  }

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (role === 'patient' || role === 'user') {
    filter.patient = userId;
  } else if (role === 'doctor') {
    const doctor = await Doctor.findOne({ user: userId });
    if (doctor) filter.doctor = doctor._id;
  }
  
  // 1. Fetch current appointments
  const currentAppointments = await Appointment.find(filter)
    .populate('patient', 'name email')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name email avatar' }
    })
    .populate('clinic')
    .sort('-date');

  // 2. Fetch historical records from Patients collection if applicable
  const skipHistory = status && !['all', 'completed', 'visited'].includes(status);
  
  if (!skipHistory) {
    const PatientModel = (await import('../models/Patient')).default;
    const historyFilter: any = {};
    
    if (branchId) historyFilter.branchId = branchId;
    
    if (role === 'patient' || role === 'user') {
      historyFilter.patientId = userId;
    } else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId });
      if (doctor) historyFilter.doctorId = doctor._id;
    } else if (role === 'admin' || role === 'receptionist') {
      // Branch filtering already handled above
    }

    const pastVisits = await PatientModel.find(historyFilter)
      .populate({
        path: 'doctorId',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .populate('clinic')
      .sort('-date');

    // 3. Map history to match appointment structure
    const historicalAppointments = pastVisits.map((p: any) => {
      const obj = p.toObject();
      return {
        ...obj,
        _id: obj._id,
        status: obj.status || 'completed',
        fullName: obj.patientName,
        slot: obj.timeSlot,
        doctor: obj.doctorId,
        clinic: obj.clinic,
        isHistorical: true
      };
    });

    // 4. Merge and sort
    const allResults = [...currentAppointments, ...historicalAppointments];
    return allResults.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  return currentAppointments;
};

export const updateAppointmentStatus = async (
  id: string, 
  userId: string, 
  role: string, 
  status: AppointmentStatus, 
  branchId?: string,
  medicalDetails?: { diagnosis?: string; prescription?: string; notes?: string }
) => {
  const filter: any = { _id: id };
  
  if (role === 'patient' || role === 'user') {
    filter.patient = userId;
    // Patients can only cancel their own appointments
    if (status !== AppointmentStatus.CANCELLED) {
      throw new AppError('Patients can only cancel their own appointments', 403);
    }
  } else if (role === 'doctor') {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);
    filter.doctor = doctor._id;
    // Doctors can only mark as completed or cancelled
    if (status !== AppointmentStatus.COMPLETED && status !== AppointmentStatus.CANCELLED) {
      throw new AppError('Doctors can only mark appointments as completed or cancelled', 403);
    }
  } else if (role === 'admin' || role === 'receptionist') {
    const app = await Appointment.findById(id).populate({
      path: 'doctor',
      select: 'parentAdmin parentReceptionist'
    });
    
    if (!app) throw new AppError('Appointment not found', 404);

    const isDirectOwner = (
      (role === 'admin' && (app.doctor as any).parentAdmin?.toString() === userId) ||
      (role === 'receptionist' && (app.doctor as any).parentReceptionist?.toString() === userId)
    );

    const isBranchStaff = branchId && app.branchId?.toString() === branchId;

    if (!isDirectOwner && !isBranchStaff) {
      throw new AppError('Unauthorized access to this appointment', 403);
    }
  }

  const update: any = { status };
  
  // Only doctors and admins can mark an appointment as completed
  if (status === AppointmentStatus.COMPLETED && role !== 'doctor' && role !== 'admin') {
    throw new AppError('Only doctors or clinic admins can mark an appointment as completed', 403);
  }
  
  const hasMedicalData = medicalDetails && (medicalDetails.diagnosis || medicalDetails.prescription || medicalDetails.notes);

  if (hasMedicalData) {
    // Only doctors (and admins for correction) can add diagnosis or prescriptions
    if (role !== 'doctor' && role !== 'admin') {
      throw new AppError('Only doctors can add diagnosis or prescriptions', 403);
    }
    if (medicalDetails.diagnosis) update.diagnosis = medicalDetails.diagnosis;
    if (medicalDetails.prescription) update.prescription = medicalDetails.prescription;
    if (medicalDetails.notes) update.notes = medicalDetails.notes;
  }

  const appointment = await Appointment.findOneAndUpdate(filter, update, { new: true })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  if (!appointment) {
    throw new AppError('Appointment not found or unauthorized', 404);
  }

  // If status is completed or visited, move to Patients collection and remove from Appointments
  if (status === AppointmentStatus.COMPLETED || status === AppointmentStatus.VISITED) {
    console.log('--- Migrating Appointment to Patient collection ---');
    console.log('Appointment ID:', appointment._id);
    
    const Patient = (await import('../models/Patient')).default;
    
    const app = appointment as any;
    const patientRecord = await Patient.create({
      patientName: app.fullName,
      email: app.email,
      phone: app.phone,
      doctorName: app.doctor?.user?.name || 'Unknown Doctor',
      date: app.date,
      timeSlot: app.slot,
      reason: app.reason,
      location: `${app.city}, ${app.country}`,
      status: status === AppointmentStatus.VISITED ? 'visited' : 'completed',
      patientStatus: 'Active',
      patientId: app.patient,
      doctorId: app.doctor?._id,
      clinic: app.clinic,
      branchId: app.branchId,
      aadhaar: app.aadhaar,
      dob: app.dob,
      gender: app.gender,
      address: app.address,
      city: app.city,
      country: app.country,
      diagnosis: app.diagnosis,
      prescription: app.prescription,
      notes: app.notes,
    } as any);

    console.log('Patient record created successfully:', (patientRecord as any)._id);

    // Option 1: Delete the appointment (as requested)
    await Appointment.findByIdAndDelete((appointment as any)._id);
    console.log('Appointment record deleted successfully:', (appointment as any)._id);
  }

  return appointment;
};

export const rescheduleAppointment = async (id: string, userId: string, role: string, date: Date, slot: string, branchId?: string) => {
  const filter: any = { _id: id };
  if (role === 'doctor') {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) throw new AppError('Doctor profile not found', 404);
    filter.doctor = doctor._id;
  } else if (role === 'admin' || role === 'receptionist') {
    const app = await Appointment.findById(id).populate('doctor');
    
    if (!app) throw new AppError('Appointment not found', 404);

    const isDirectOwner = (
      (role === 'admin' && (app.doctor as any).parentAdmin?.toString() === userId) ||
      (role === 'receptionist' && (app.doctor as any).parentReceptionist?.toString() === userId)
    );

    const isBranchStaff = branchId && app.branchId?.toString() === branchId;

    if (!isDirectOwner && !isBranchStaff) {
      throw new AppError('Unauthorized to reschedule this appointment', 403);
    }
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
