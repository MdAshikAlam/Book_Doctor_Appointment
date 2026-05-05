import mongoose, { Schema, Document } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  VISITED = 'visited',
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
  prescription?: string;
  diagnosis?: string;
  notes?: string;
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
