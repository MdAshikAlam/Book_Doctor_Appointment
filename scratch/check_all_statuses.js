const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkAll() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }), 'clinics');

  const users = await User.find({ role: { $ne: 'patient' } });
  console.log('--- STAFF STATUS REPORT ---');
  for (const u of users) {
    console.log(`Role: ${u.role.padEnd(12)} | Status: ${u.status.padEnd(10)} | Email: ${u.email}`);
  }

  const clinics = await Clinic.find({});
  console.log('\n--- CLINIC STATUS REPORT ---');
  for (const c of clinics) {
    console.log(`Clinic: ${c.clinicName.padEnd(20)} | Status: ${c.clinicStatus.padEnd(10)}`);
  }

  await mongoose.disconnect();
}

checkAll();
