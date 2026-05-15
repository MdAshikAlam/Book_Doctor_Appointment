const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function resumeAll() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }), 'clinics');

  console.log('--- RESUMING EVERYONE ---');
  
  // 1. Resume all Users (except patients)
  const userResult = await User.updateMany(
    { role: { $ne: 'patient' }, status: 'suspended' },
    { $set: { status: 'active' } }
  );
  console.log(`Users reactivated: ${userResult.modifiedCount}`);

  // 2. Resume all Clinics
  const clinicResult = await Clinic.updateMany(
    { clinicStatus: 'suspended' },
    { $set: { clinicStatus: 'approved' } }
  );
  console.log(`Clinics reactivated: ${clinicResult.modifiedCount}`);

  await mongoose.disconnect();
}

resumeAll();
