
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to DB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }));

  const admins = await User.find({ role: 'admin' });
  console.log('Total Admins in DB:', admins.length);
  admins.forEach((u: any, i: number) => {
    console.log(`${i+1}. Name: ${u.name}, Status: ${u.status}, ClinicName: ${u.clinicName}, branchId: ${u.branchId}`);
  });

  const clinics = await Clinic.find({});
  console.log('\nTotal Clinics in DB:', clinics.length);
  clinics.forEach((c: any, i: number) => {
     console.log(`${i+1}. Name: ${c.clinicName}, Status: ${c.clinicStatus}, OwnerID: ${c.owner}`);
  });

  await mongoose.disconnect();
}

check();
