const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }), 'doctors');
  const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }), 'clinics');

  const pawan = await User.findOne({ email: 'pawan@gmail.com' });
  if (!pawan) {
    console.log('Pawan not found');
    return;
  }
  console.log('PAWAN ID:', pawan._id);

  // Find all clinics for Pawan
  const clinics = await Clinic.find({ owner: pawan._id });
  console.log('CLINICS FOUND:', clinics.length);
  clinics.forEach(c => console.log(` - ${c.clinicName} (${c._id})`));

  // Find all doctors linked to Pawan (via parentAdmin)
  const doctors = await Doctor.find({ parentAdmin: pawan._id });
  console.log('DOCTORS FOUND:', doctors.length);
  
  doctors.forEach(d => {
    console.log(` - ID: ${d._id}, branchId: ${d.branchId}, clinic: ${d.clinic}, clinics: ${d.clinics}`);
  });

  // Check for users with role doctor
  const doctorUsers = await User.find({ parentAdmin: pawan._id, role: 'doctor' });
  console.log('DOCTOR USERS FOUND:', doctorUsers.length);
  doctorUsers.forEach(u => {
    console.log(` - UserID: ${u._id}, branchId: ${u.branchId}, name: ${u.name}`);
  });

  await mongoose.disconnect();
}

check();
