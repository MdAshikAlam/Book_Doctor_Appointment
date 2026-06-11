import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from '../src/models/User';
import Doctor from '../src/models/Doctor';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
async function run() {
  await mongoose.connect(MONGO_URI);
  const docs = await Doctor.find({}).populate('user');
  console.log('--- DOCTORS IN DB ---');
  for(const d of docs) {
    console.log({
      id: d._id,
      name: (d.user as any)?.name,
      email: (d.user as any)?.email,
      status: d.status,
      isVerified: d.isVerified
    });
  }
  process.exit(0);
}
run();
