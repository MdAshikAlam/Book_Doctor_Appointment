import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

export enum AppointmentStatus {
  BOOKED = 'booked',
  CHECKED_IN = 'checked_in',
  WAITING = 'waiting',
  IN_CONSULTATION = 'in_consultation',
  COMPLETED = 'completed',
  FOLLOW_UP = 'follow_up',
  PATIENT_MISSED = 'patient_missed',
  CANCELLED = 'cancelled'
}

export interface IPrescription {
  medicine: string;
  dosage: string;
  timing: string;
  days: number;
  notes?: string;
}

export interface IConsultationNotes {
  symptoms?: string;
  diagnosis?: string;
  observations?: string;
  advice?: string;
}

export interface IMedicalReport {
  reportName: string;
  reportType: string;
  reportUrl: string;
  uploadedAt: Date;
}

export interface IFollowUp {
  date: Date;
  notes?: string;
}

export interface IDischargeSummary {
  summary: string;
  finalAdvice: string;
  medicines: string;
  nextVisitRecommendation?: string;
  dischargedAt: Date;
}

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  date: Date;
  slot: string;
  status: AppointmentStatus;
  reason: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  prescription?: string; // Legacy
  diagnosis?: string; // Legacy
  notes?: string; // Legacy
  prescriptions?: IPrescription[];
  consultationNotes?: IConsultationNotes;
  reports?: IMedicalReport[];
  followUp?: IFollowUp;
  dischargeSummary?: IDischargeSummary;
  // Patient details from form
  fullName: string;
  email: string;
  phone: string;
  aadhaar: string;
  dob: Date;
  gender: string;
  address: string;
  country: string;
  city: string;
  visitedBefore: boolean;
  isMovedToPatients?: boolean;
  checkedInAt?: Date;
  completedAt?: Date;
  prescriptionAddedAt?: Date;
  followUpDate?: Date;
  missedReason?: string;
  tokenNumber?: string;
  draftDiagnosis?: string;
  draftPrescription?: string;
  draftNotes?: string;
  draftPreparedBy?: mongoose.Types.ObjectId;
  draftPreparedAt?: Date;
  doctorApprovedBy?: mongoose.Types.ObjectId;
  doctorApprovedAt?: Date;
  medicalRecordLocked?: boolean;
  queueNumber?: number;
  waitingSince?: Date;
  calledAt?: Date;
  consultationStartedAt?: Date;
  consultationCompletedAt?: Date;
  checkInTime?: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    date: { type: Date, required: true },
    slot: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.BOOKED,
    },
    reason: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    prescription: { type: String },
    diagnosis: { type: String },
    notes: { type: String },
    prescriptions: [{
      medicine: String,
      dosage: String,
      timing: String,
      days: Number,
      notes: String
    }],
    consultationNotes: {
      symptoms: String,
      diagnosis: String,
      observations: String,
      advice: String
    },
    reports: [{
      reportName: String,
      reportType: String,
      reportUrl: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    followUp: {
      date: Date,
      notes: String
    },
    dischargeSummary: {
      summary: String,
      finalAdvice: String,
      medicines: String,
      nextVisitRecommendation: String,
      dischargedAt: Date
    },
    // Patient details from form
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    aadhaar: { 
      type: String, 
      required: true,
      set: (val: string) => val ? encrypt(val) : val,
      get: (val: string) => val ? decrypt(val) : val
    },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    visitedBefore: { type: Boolean, default: false },
    isMovedToPatients: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    completedAt: { type: Date },
    prescriptionAddedAt: { type: Date },
    followUpDate: { type: Date },
    missedReason: { type: String },
    tokenNumber: { type: String },
    draftDiagnosis: { type: String },
    draftPrescription: { type: String },
    draftNotes: { type: String },
    draftPreparedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    draftPreparedAt: { type: Date },
    doctorApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorApprovedAt: { type: Date },
    medicalRecordLocked: { type: Boolean, default: false },
    queueNumber: { type: Number },
    waitingSince: { type: Date },
    calledAt: { type: Date },
    consultationStartedAt: { type: Date },
    consultationCompletedAt: { type: Date },
    checkInTime: { type: Date }
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

appointmentSchema.index({ branchId: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;

