import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function activateAllStaff() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    const result = await User.updateMany(
      { 
        role: { $in: ['doctor', 'receptionist'] }
      },
      { 
        $set: { 
          status: 'active',
          emailVerified: true,
          isEmailVerified: true
        } 
      }
    );
    
    console.log(`Successfully activated ${result.modifiedCount} users in the database.`);
    
    // Also update any doctor profiles to 'verified' so they show up
    const Doctor = (await import('../src/models/Doctor')).default;
    const docResult = await Doctor.updateMany(
      { status: { $ne: 'verified' } },
      { $set: { status: 'verified' } }
    );
    console.log(`Successfully verified ${docResult.modifiedCount} doctor profiles in the database.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

activateAllStaff();
