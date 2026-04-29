import mongoose from 'mongoose';
import Appointment, { AppointmentStatus } from '../models/Appointment';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-doctor-appointment';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for migration...');

    // Just to ensure models are registered
    console.log('Registered Models:', mongoose.modelNames());

    const completedAppointments = await Appointment.find({ status: AppointmentStatus.COMPLETED });

    console.log(`Found ${completedAppointments.length} existing completed appointments to migrate.`);

    for (const app of completedAppointments) {
      try {
        // Manually fetch doctor and then user without using .populate()
        let doctorName = 'Unknown Doctor';
        const doctorDoc = await Doctor.findById(app.doctor);
        if (doctorDoc && doctorDoc.user) {
          const userDoc = await User.findById(doctorDoc.user);
          if (userDoc) {
            doctorName = userDoc.name;
          }
        }

        await Patient.create({
          patientName: app.fullName,
          email: app.email,
          phone: app.phone,
          doctorName: doctorName,
          date: app.date,
          timeSlot: app.slot,
          reason: app.reason,
          location: `${app.city}, ${app.country}`,
          status: 'visited',
          patientId: app.patient,
          doctorId: app.doctor,
          aadhaar: app.aadhaar,
          dob: app.dob,
          gender: app.gender,
          address: app.address,
          city: app.city,
          country: app.country
        });

        await Appointment.findByIdAndDelete(app._id);
        console.log(`Migrated and deleted appointment: ${app._id}`);
      } catch (err) {
        console.error(`Failed to migrate appointment ${app._id}:`, err);
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
