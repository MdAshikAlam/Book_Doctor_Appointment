import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    logo: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);
export default Organization;
