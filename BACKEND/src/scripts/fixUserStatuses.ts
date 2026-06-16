import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Doctor from '../models/Doctor';
import User from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI!;
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    // Find all doctors that are verified
    const verifiedDoctors = await Doctor.find({ status: 'verified' });
    console.log(`Found ${verifiedDoctors.length} verified doctors.`);

    let updatedCount = 0;
    for (const doctor of verifiedDoctors) {
      if (doctor.user) {
        const user = await User.findById(doctor.user);
        if (user && user.status === 'pending') {
          user.status = 'active';
          await user.save();
          console.log(`Updated User ${user.email} (doctor: ${doctor._id}) status from pending to active.`);
          updatedCount++;
        }
      }
    }

    console.log(`Finished updating ${updatedCount} user accounts.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
