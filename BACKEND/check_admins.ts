import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
async function run() {
  await mongoose.connect(MONGO_URI);
  const usersColl = mongoose.connection.collection('users');
  const admins = await usersColl.find({ role: 'admin' }).toArray();
  for(const a of admins) {
    console.log('Admin:', a.email, 'branchId:', a.branchId, 'branchIds:', a.branchIds);
  }
  const staff = await usersColl.find({ role: 'receptionist' }).toArray();
  for(const s of staff) {
    console.log('Staff:', s.email, 'branchId:', s.branchId, 'branchIds:', s.branchIds);
  }
  process.exit(0);
}
run();
