import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Doctor from './src/models/Doctor';
import './src/models/User';
import './src/models/Clinic';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';

async function run() {
  await mongoose.connect(MONGO_URI);
  
  console.log('Testing Find and Populate...');
  console.time('find-populate');
  const docs = await Doctor.find()
    .populate('user')
    .populate('clinic')
    .populate('branchId');
  console.timeEnd('find-populate');
  console.log('Fetched doctors count:', docs.length);
  
  docs.forEach((d: any, index: number) => {
    console.log(`[Doctor ${index}] ID: ${d._id}, Name: ${d.user?.name}, Status: ${d.status}, isVerified: ${d.isVerified}, District: ${d.district}, State: ${d.state}`);
  });
  
  process.exit(0);
}
run();
