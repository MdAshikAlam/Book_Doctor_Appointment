import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const filterStart = startOfDay(subDays(new Date(), 1));
  const filterEnd = endOfDay(subDays(new Date(), 1));

  console.log('Local timezone Yesterday date bounds:');
  console.log('filterStart:', filterStart.toISOString());
  console.log('filterEnd:', filterEnd.toISOString());

  const branchObjId = new mongoose.Types.ObjectId('69f7a90962bf2ca129d692f9');

  const activeCount = await mongoose.connection.collection('appointments').countDocuments({
    branchId: branchObjId,
    date: { $gte: filterStart, $lte: filterEnd }
  });
  console.log('Active Appointments count:', activeCount);

  const historicalCount = await mongoose.connection.collection('patients').countDocuments({
    branchId: branchObjId,
    date: { $gte: filterStart, $lte: filterEnd }
  });
  console.log('Historical Patients count:', historicalCount);

  const historicalApts = await mongoose.connection.collection('patients')
    .find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } })
    .toArray();
  
  console.log('Historical appointments found:', historicalApts.map(p => ({
    id: p._id,
    patientName: p.patientName,
    date: p.date,
    branchId: p.branchId
  })));

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
