import mongoose, { Schema, Document } from 'mongoose';

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
    aadhaar: { type: String },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

const Patient = mongoose.model<IPatient>('Patient', patientSchema);
export default Patient;
