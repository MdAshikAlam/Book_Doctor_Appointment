import mongoose, { Document, Schema } from 'mongoose';

export interface ContactDocument extends Document {
  fullName: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema<ContactDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'contacts' }
);

export default mongoose.model<ContactDocument>('Contact', ContactSchema);
