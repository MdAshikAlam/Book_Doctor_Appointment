import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);
  
  console.log('\n--- ACTIVE APPOINTMENTS ---');
  const appointments = await mongoose.connection.collection('appointments').find({}).toArray();
  console.log(`Found ${appointments.length} active appointments.`);
  appointments.forEach(apt => {
    console.log({
      id: apt._id,
      patientName: apt.fullName || apt.patientName,
      date: apt.date,
      slot: apt.slot,
      status: apt.status,
      branchId: apt.branchId,
      clinic: apt.clinic
    });
  });

  console.log('\n--- COMPLETED PATIENTS (HISTORICAL VISITS) ---');
  const patients = await mongoose.connection.collection('patients').find({}).toArray();
  console.log(`Found ${patients.length} patient records.`);
  patients.forEach(pat => {
    console.log({
      id: pat._id,
      patientName: pat.patientName,
      date: pat.date,
      timeSlot: pat.timeSlot,
      status: pat.status,
      branchId: pat.branchId,
      clinic: pat.clinic
    });
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
