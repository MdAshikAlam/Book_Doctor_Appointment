const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function repair() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }), 'doctors');
  const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }), 'clinics');

  const pawanId = new mongoose.Types.ObjectId('69f65bd5cc909a17663b6c32');
  const clinicId = new mongoose.Types.ObjectId('69f7a90962bf2ca129d692f9');

  console.log('REPAIRING DOCTORS FOR PAWAN...');

  // 1. Repair Doctor Profiles
  const doctorResult = await Doctor.updateMany(
    { parentAdmin: pawanId, $or: [{ branchId: { $exists: false } }, { branchId: null }, { clinic: { $exists: false } }, { clinic: null }] },
    { $set: { branchId: clinicId, clinic: clinicId, clinics: [clinicId] } }
  );
  console.log('DOCTOR PROFILES UPDATED:', doctorResult.modifiedCount);

  // 2. Repair Doctor Users
  const userResult = await User.updateMany(
    { parentAdmin: pawanId, role: 'doctor', $or: [{ branchId: { $exists: false } }, { branchId: null }] },
    { $set: { branchId: clinicId } }
  );
  console.log('DOCTOR USERS UPDATED:', userResult.modifiedCount);

  // 3. Ensure doctors are in the clinic's doctors array
  const doctors = await Doctor.find({ parentAdmin: pawanId });
  const doctorIds = doctors.map(d => d._id);
  
  await Clinic.findByIdAndUpdate(clinicId, {
    $addToSet: { doctors: { $each: doctorIds } }
  });
  console.log('CLINIC DOCTORS ARRAY UPDATED');

  await mongoose.disconnect();
}

repair();
