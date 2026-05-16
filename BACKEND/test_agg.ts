import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as doctorService from './src/services/doctor.service';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';

async function run() {
  await mongoose.connect(MONGO_URI);
  
  // Fake what an admin would send
  // We know the branchId is 69f7a90962bf2ca129d692f9
  const branchId = '69f7a90962bf2ca129d692f9';
  
  console.log('Fetching doctors for branch:', branchId);
  try {
    const doctors = await doctorService.getAllDoctors({ isDashboard: 'true', status: 'all' }, undefined, branchId);
    console.log(`Found ${doctors.length} doctors`);
    console.log(JSON.stringify(doctors.map(d => d._id), null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
