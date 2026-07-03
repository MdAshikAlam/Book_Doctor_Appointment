import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);
  
  const appointmentsCollection = mongoose.connection.collection('appointments');
  
  const inConsultationCount = await appointmentsCollection.countDocuments({ status: 'in_consultation' });
  console.log(`Found ${inConsultationCount} appointments in 'in_consultation' status.`);
  
  if (inConsultationCount > 0) {
    const result = await appointmentsCollection.deleteMany({ status: 'in_consultation' });
    console.log(`Successfully deleted ${result.deletedCount} appointments.`);
  } else {
    console.log('No appointments to delete.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
