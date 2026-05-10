import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

export interface IPatient extends Document {
  patientName: string;
  email: string;
  phone: string;
  doctorName: string;
  date: Date;
  timeSlot: string;
  reason: string;
  location: string;
  status: string;
  patientStatus: string;
  patientId?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  aadhaar?: string;
  dob?: Date;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  prescriptions?: any[];
  consultationNotes?: any;
  reports?: any[];
  followUp?: any;
  dischargeSummary?: any;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    patientName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    doctorName: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    reason: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, default: 'visited' },
    patientStatus: { type: String, default: 'Active' },
    patientId: { type: Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    aadhaar: { 
      type: String,
      set: (val: string) => val ? encrypt(val) : val,
      get: (val: string) => val ? decrypt(val) : val
    },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    diagnosis: { type: String },
    prescription: { type: String },
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
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

patientSchema.index({ branchId: 1 });

const Patient = mongoose.model<IPatient>('Patient', patientSchema);
export default Patient;

