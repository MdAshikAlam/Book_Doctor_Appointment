import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Patient from './src/models/Patient';
import Appointment from './src/models/Appointment';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');

  const userCount = await User.countDocuments({});
  const patientCount = await Patient.countDocuments({});
  const appointmentCount = await Appointment.countDocuments({});

  console.log(`Total Users in User collection: ${userCount}`);
  console.log(`Total Patients in Patient collection: ${patientCount}`);
  console.log(`Total Appointments in Appointment collection: ${appointmentCount}`);

  console.log('\n--- Patients in User Collection (role: patient) ---');
  const patientUsers = await User.find({ role: 'patient' });
  patientUsers.forEach(u => {
    console.log({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: (u as any).createdAt });
  });

  console.log('\n--- Patients in Patient Collection ---');
  const clinicalPatients = await Patient.find({});
  clinicalPatients.forEach(p => {
    console.log({ id: p._id, patientName: p.patientName, email: p.email, patientId: p.patientId, createdAt: p.createdAt });
  });

  console.log('\n--- Appointments ---');
  const appointments = await Appointment.find({});
  appointments.forEach(a => {
    console.log({ id: a._id, patient: a.patient, fullName: a.fullName, email: a.email, status: a.status });
  });

  await mongoose.disconnect();
}

run();
