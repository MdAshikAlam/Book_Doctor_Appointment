import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Doctor from '../models/Doctor';
import User from '../models/User';
import Clinic from '../models/Clinic';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const doctorsCount = await Doctor.countDocuments({});
    console.log('Doctors count:', doctorsCount);

    const usersCount = await User.countDocuments({});
    console.log('Users count:', usersCount);

    const clinicsCount = await Clinic.countDocuments({});
    console.log('Clinics count:', clinicsCount);

    process.exit(0);
  } catch (err) {
    console.error('Error running test:', err);
    process.exit(1);
  }
};

run();
