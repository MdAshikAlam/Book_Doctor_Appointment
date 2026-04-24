const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from current directory (.env is in backend folder)
dotenv.config();

async function sync() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Use existing models if possible, or define temporary ones
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));

    const doctors = await User.find({ role: 'doctor' });
    console.log(`Found ${doctors.length} users with role doctor`);

    let createdCount = 0;
    for (const user of doctors) {
      const profile = await Doctor.findOne({ user: user._id });
      if (!profile) {
        console.log(`Creating profile for ${user.name || user.email}`);
        await Doctor.create({
          user: user._id,
          specialty: 'General',
          experience: 0,
          consultationFee: 0,
          location: { type: 'Point', coordinates: [0, 0] },
          createdBy: user.createdBy,
          parentAdmin: user.parentAdmin,
          parentSubAdmin: user.parentSubAdmin
        });
        createdCount++;
      }
    }

    console.log(`Sync complete. Created ${createdCount} missing profiles.`);
    process.exit(0);
  } catch (err) {
    console.error('Error during sync:', err);
    process.exit(1);
  }
}

sync();
