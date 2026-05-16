import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';

async function checkDoctors() {
  await mongoose.connect(MONGO_URI);
  
  const Doctor = mongoose.connection.collection('doctors');
  const doctors = await Doctor.find({}).toArray();
  
  console.log(`Found ${doctors.length} doctors`);
  for (const doc of doctors) {
    console.log(`Doctor ID: ${doc._id}`);
    console.log(`  Clinic: ${doc.clinic}`);
    console.log(`  BranchId: ${doc.branchId}`);
    console.log(`  CreatedBy: ${doc.createdBy}`);
    console.log(`  ParentAdmin: ${doc.parentAdmin}`);
    console.log('---');
  }
  
  process.exit(0);
}

checkDoctors();
