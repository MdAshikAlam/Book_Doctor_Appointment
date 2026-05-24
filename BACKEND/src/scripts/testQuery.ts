import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { getAllDoctors } from '../services/doctor.service';
import '../models/User';
import '../models/Clinic';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    console.log('Running getAllDoctors query...');
    console.time('getAllDoctorsTime');
    const doctors = await getAllDoctors({}, undefined, undefined);
    console.timeEnd('getAllDoctorsTime');

    console.log('Doctors count returned:', doctors.length);
    if (doctors.length > 0) {
      console.log('First doctor specialty:', doctors[0].specialty);
      console.log('First doctor name:', doctors[0].user?.name);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error running query:', err);
    process.exit(1);
  }
};

run();
