import mongoose, { Schema, Document } from 'mongoose';

export enum AppointmentStatus {
  REGISTERED = 'registered',
  WAITING = 'waiting',
  IN_CONSULTATION = 'in_consultation',
  COMPLETED = 'completed',
  ADMITTED = 'admitted',
  DISCHARGED = 'discharged',
  CANCELLED = 'cancelled',
  // Legacy support
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  VISITED = 'visited',
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
      default: AppointmentStatus.CONFIRMED,
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
    aadhaar: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    visitedBefore: { type: Boolean, default: false },
    isMovedToPatients: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
