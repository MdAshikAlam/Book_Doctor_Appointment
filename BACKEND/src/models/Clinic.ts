import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  address: string;
  phone: string;
  images: string[];
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  owner: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
}

const clinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    images: [{ type: String }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

clinicSchema.index({ location: '2dsphere' });

const Clinic = mongoose.model<IClinic>('Clinic', clinicSchema);
export default Clinic;
