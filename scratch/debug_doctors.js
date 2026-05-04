const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/Book_Doctor_Appointment');
  const doctors = await mongoose.connection.db.collection('doctors').find().toArray();
  console.log('Total Doctors:', doctors.length);
  doctors.slice(0, 5).forEach(d => {
    console.log('Doctor:', d.user, 'Clinic:', d.clinic, 'Branch:', d.branchId, 'Clinics:', d.clinics, 'Status:', d.status);
  });
  process.exit();
}

check();
