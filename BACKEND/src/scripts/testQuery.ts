import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Doctor from '../models/Doctor';
import Clinic from '../models/Clinic';
import '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
    await mongoose.connect(mongoUri);

    const doc: any = await Doctor.findOne({ specialty: /Cardio/i }).populate('user');
    console.log('Doctor branchId:', doc.branchId, 'Type:', typeof doc.branchId, 'Is ObjectId:', doc.branchId instanceof mongoose.Types.ObjectId);
    
    if (doc.branchId) {
      const clinic = await Clinic.findById(doc.branchId);
      console.log('Clinic found by branchId:', !!clinic);
      if (clinic) {
        console.log('Clinic Details:');
        console.log('ID:', clinic._id, 'Type:', typeof clinic._id);
        console.log('Name:', (clinic as any).clinicName);
        console.log('District:', (clinic as any).district || (clinic as any).city);
        console.log('State:', (clinic as any).state);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
