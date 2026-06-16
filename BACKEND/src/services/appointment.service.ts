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

export const checkAndAutoUpdateMissedAppointments = async () => {
  try {
    const now = new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      status: AppointmentStatus.BOOKED,
      date: { $lte: todayEnd }
    });

    for (const app of bookedAppointments) {
      const match = app.slot.match(/^(\d{1,2}):(\d{2})/);
      if (match && match[1] && match[2]) {
        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const isPM = app.slot.toLowerCase().includes('pm') && hour < 12;
        const isAM = app.slot.toLowerCase().includes('am') && hour === 12;
        if (isPM) hour += 12;
        if (isAM) hour = 0;

        const appTime = new Date(app.date);
        appTime.setHours(hour, minute, 0, 0);

        if (appTime.getTime() < now.getTime()) {
          app.status = AppointmentStatus.PATIENT_MISSED;
          await app.save();
        }
      } else {
        const appDateOnly = new Date(app.date);
        appDateOnly.setHours(0, 0, 0, 0);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        if (appDateOnly.getTime() < todayStart.getTime()) {
          app.status = AppointmentStatus.PATIENT_MISSED;
          await app.save();
        }
      }
    }
  } catch (err) {
    console.error('Failed to run checkAndAutoUpdateMissedAppointments:', err);
  }
};

export const attachQueueDetails = async (appointments: any[]) => {
  const result = [];
  for (const app of appointments) {
    const appObj = typeof app.toObject === 'function' ? app.toObject() : app;
    if (appObj.status === 'waiting' && appObj.doctor) {
      const start = new Date(appObj.date);
      start.setHours(0,0,0,0);
      const end = new Date(appObj.date);
      end.setHours(23,59,59,999);
      
      const docId = appObj.doctor._id || appObj.doctor;
      const position = await Appointment.countDocuments({
        doctor: docId,
        status: AppointmentStatus.WAITING,
        date: { $gte: start, $lte: end },
        waitingSince: { $lt: appObj.waitingSince || new Date() }
      }) + 1;
      
      appObj.queuePosition = position;
      appObj.estimatedWaitTime = position * 10;
    }
    result.push(appObj);
  }
  return result;
};

export const getMyAppointments = async (userId: string, role: string, branchId?: string, status?: string) => {
  await checkAndAutoUpdateMissedAppointments();
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

  const processedAppointments = await attachQueueDetails(currentAppointments);

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
    const allResults = [...processedAppointments, ...historicalAppointments];
    return allResults.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  return processedAppointments;
};

export const updateAppointmentStatus = async (
  id: string, 
  userId: string, 
  role: string, 
  status: AppointmentStatus, 
  branchId?: string,
  medicalDetails?: { 
    diagnosis?: string; 
    prescription?: string; 
    notes?: string;
    prescriptions?: any[];
    consultationNotes?: any;
    reports?: any[];
    followUp?: any;
    dischargeSummary?: any;
    draftDiagnosis?: string;
    draftPrescription?: string;
    draftNotes?: string;
  }
) => {
  const existingApp = await Appointment.findById(id);
  if (!existingApp) throw new AppError('Appointment not found', 404);
  if (existingApp.medicalRecordLocked) {
    throw new AppError('This consultation has been approved and completed by the doctor and is locked for edits.', 403);
  }

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
    // Doctors can complete, start consultation, or mark follow up required
    const allowedStatuses = [
      AppointmentStatus.IN_CONSULTATION,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.FOLLOW_UP
    ];
    if (!allowedStatuses.includes(status)) {
      throw new AppError('Doctors are not authorized to set this status', 403);
    }
  } else if (role === 'admin' || role === 'receptionist') {
    // Receptionist/Admin allowed statuses: BOOKED, CHECKED_IN, WAITING, PATIENT_MISSED, CANCELLED
    const allowedStatuses = [
      AppointmentStatus.BOOKED,
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.WAITING,
      AppointmentStatus.PATIENT_MISSED,
      AppointmentStatus.CANCELLED
    ];
    if (!allowedStatuses.includes(status)) {
      throw new AppError('Administrative staff are not authorized to set this status', 403);
    }
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

  const mongoose = require('mongoose');
  const update: any = { status };
  
  if (status === AppointmentStatus.CHECKED_IN) {
    update.checkedInAt = new Date();
    update.checkInTime = new Date();
    if (existingApp.status === AppointmentStatus.WAITING) {
      update.queueNumber = null;
      update.waitingSince = null;
    }
  }
  if (status === AppointmentStatus.WAITING) {
    if (!existingApp.queueNumber) {
      const start = new Date(existingApp.date);
      start.setHours(0,0,0,0);
      const end = new Date(existingApp.date);
      end.setHours(23,59,59,999);
      const maxQueueApp = await Appointment.findOne({
        doctor: existingApp.doctor,
        date: { $gte: start, $lte: end },
        queueNumber: { $exists: true }
      }).sort('-queueNumber');
      update.queueNumber = maxQueueApp && maxQueueApp.queueNumber ? maxQueueApp.queueNumber + 1 : 1;
    }
    update.waitingSince = new Date();
  }
  if (status === AppointmentStatus.IN_CONSULTATION) {
    update.consultationStartedAt = new Date();
    update.calledAt = new Date();
    update.queueNumber = null;
    update.waitingSince = null;
  }
  if (status === AppointmentStatus.COMPLETED) {
    update.completedAt = new Date();
    update.consultationCompletedAt = new Date();
  }
  if (status === AppointmentStatus.FOLLOW_UP) {
    update.followUpDate = new Date(); 
  } 

  // Only doctors and admins can mark an appointment as completed or follow_up
  if ((status === AppointmentStatus.COMPLETED || status === AppointmentStatus.FOLLOW_UP) && role !== 'doctor' && role !== 'admin') {
    throw new AppError('Only doctors or clinic admins can finalize a consultation', 403);
  }
  
  // Handle draft details updates (without DRAFT_PREPARED status)
  const hasDraftData = (medicalDetails && (medicalDetails.draftDiagnosis || medicalDetails.draftPrescription || medicalDetails.draftNotes));
  
  if (hasDraftData) {
    if (medicalDetails?.draftDiagnosis) update.draftDiagnosis = medicalDetails.draftDiagnosis;
    if (medicalDetails?.draftPrescription) update.draftPrescription = medicalDetails.draftPrescription;
    if (medicalDetails?.draftNotes) update.draftNotes = medicalDetails.draftNotes;
    
    update.draftPreparedBy = new mongoose.Types.ObjectId(userId) as any;
    update.draftPreparedAt = new Date();

    // Draft updates are also allowed to suggest followUp or reports
    if (medicalDetails?.reports) update.reports = medicalDetails.reports;
    if (medicalDetails?.followUp) {
      update.followUp = medicalDetails.followUp;
      update.followUpDate = new Date(medicalDetails.followUp.date);
    }
  }

  // Handle final Consultation Completion or Prescription Approval by Doctor
  if (status === AppointmentStatus.COMPLETED || status === AppointmentStatus.FOLLOW_UP) {
    update.doctorApprovedBy = new mongoose.Types.ObjectId(userId) as any;
    update.doctorApprovedAt = new Date();
    update.medicalRecordLocked = true;

    // Transition drafts to final medical record fields if final ones not provided
    update.diagnosis = medicalDetails?.diagnosis || medicalDetails?.draftDiagnosis || existingApp.draftDiagnosis || existingApp.diagnosis;
    update.prescription = medicalDetails?.prescription || medicalDetails?.draftPrescription || existingApp.draftPrescription || existingApp.prescription;
    update.notes = medicalDetails?.notes || medicalDetails?.draftNotes || existingApp.draftNotes || existingApp.notes;

    if (medicalDetails?.prescriptions) {
      update.prescriptions = medicalDetails.prescriptions;
    } else if ((medicalDetails?.draftPrescription || existingApp.draftPrescription) && !existingApp.prescriptions?.length) {
      update.prescriptions = [{
        medicine: medicalDetails?.draftPrescription || existingApp.draftPrescription,
        dosage: 'As drafted',
        timing: 'As drafted',
        days: 1,
        notes: 'Draft approved'
      }];
    }

    if (medicalDetails?.consultationNotes) {
      update.consultationNotes = medicalDetails.consultationNotes;
    } else {
      update.consultationNotes = {
        symptoms: existingApp.consultationNotes?.symptoms || 'General Checkup',
        diagnosis: update.diagnosis,
        advice: update.notes
      };
    }
    
    if (medicalDetails?.reports) update.reports = medicalDetails.reports;
    if (medicalDetails?.followUp) {
      update.followUp = medicalDetails.followUp;
      update.followUpDate = new Date(medicalDetails.followUp.date);
    }
  } else {
    // Regular doctor final additions if not completing (e.g. PRESCRIPTION_ADDED)
    const hasMedicalData = medicalDetails && (
      medicalDetails.diagnosis || 
      medicalDetails.prescription || 
      medicalDetails.notes ||
      medicalDetails.prescriptions ||
      medicalDetails.consultationNotes ||
      medicalDetails.reports ||
      medicalDetails.followUp ||
      medicalDetails.dischargeSummary
    );

    if (hasMedicalData) {
      if (role !== 'doctor' && role !== 'admin') {
        throw new AppError('Only doctors can add diagnosis or prescriptions', 403);
      }
      if (medicalDetails.diagnosis) update.diagnosis = medicalDetails.diagnosis;
      if (medicalDetails.prescription) update.prescription = medicalDetails.prescription;
      if (medicalDetails.notes) update.notes = medicalDetails.notes;
      if (medicalDetails.prescriptions) update.prescriptions = medicalDetails.prescriptions;
      if (medicalDetails.consultationNotes) update.consultationNotes = medicalDetails.consultationNotes;
      if (medicalDetails.reports) update.reports = medicalDetails.reports;
      if (medicalDetails.followUp) {
        update.followUp = medicalDetails.followUp;
        update.followUpDate = new Date(medicalDetails.followUp.date);
      }
      if (medicalDetails.dischargeSummary) update.dischargeSummary = medicalDetails.dischargeSummary;
    }
  }

  const appointment = await Appointment.findOneAndUpdate(filter, update, { new: true })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  if (!appointment) {
    throw new AppError('Appointment not found or unauthorized', 404);
  }

  // If status is completed or follow_up, move to Patients collection and remove from Appointments
  if (status === AppointmentStatus.COMPLETED || status === AppointmentStatus.FOLLOW_UP) {
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
      status: status === AppointmentStatus.FOLLOW_UP ? 'follow_up' : 'completed',
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
      prescriptions: app.prescriptions,
      consultationNotes: app.consultationNotes,
      reports: app.reports,
      followUp: app.followUp,
      dischargeSummary: app.dischargeSummary,
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
    { date, slot, status: AppointmentStatus.BOOKED }, 
    { new: true }
  );
  
  if (!appointment) {
    throw new AppError('Appointment not found or unauthorized', 404);
  }
  return appointment;
};

export const callNextPatient = async (userId: string) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) throw new AppError('Doctor profile not found', 404);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Find the waiting patient with the lowest queueNumber for this doctor today
  const nextApp = await Appointment.findOne({
    doctor: doctor._id,
    status: AppointmentStatus.WAITING,
    date: { $gte: todayStart, $lte: todayEnd }
  }).sort('queueNumber');

  if (!nextApp) {
    throw new AppError('No patients waiting in the queue.', 404);
  }

  nextApp.status = AppointmentStatus.IN_CONSULTATION;
  nextApp.consultationStartedAt = new Date();
  nextApp.calledAt = new Date();
  (nextApp as any).queueNumber = undefined;
  (nextApp as any).waitingSince = undefined;
  
  await nextApp.save();
  return nextApp;
};
