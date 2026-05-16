import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
async function run() {
  await mongoose.connect(MONGO_URI);
  const docs = await mongoose.connection.collection('doctors').find({}).toArray();
  console.log('Docs count:', docs.length);
  for(const d of docs) {
    console.log(d._id, 'clinic:', d.clinic, 'branchId:', d.branchId, 'createdBy:', d.createdBy, 'parentAdmin:', d.parentAdmin);
  }
  process.exit(0);
}
run();
