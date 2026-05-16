import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
async function run() {
  await mongoose.connect(MONGO_URI);
  const docs = await mongoose.connection.collection('doctors').find({}).toArray();
  const usersColl = mongoose.connection.collection('users');
  for(const d of docs) {
    const u = await usersColl.findOne({_id: d.user});
    console.log('Doctor', d._id, 'User', d.user, 'Found:', !!u);
  }
  process.exit(0);
}
run();
