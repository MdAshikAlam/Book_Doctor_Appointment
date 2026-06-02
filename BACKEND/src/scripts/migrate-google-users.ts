import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

async function migrate() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Database connected successfully.');

    // Find users who fit the criteria:
    // authProvider = "local"
    // passwordSet = false
    // emailVerified = true
    const query = {
      authProvider: 'local',
      passwordSet: false,
      emailVerified: true,
    };

    const countBefore = await User.countDocuments(query);
    console.log(`Found ${countBefore} users matching criteria for migration.`);

    if (countBefore === 0) {
      console.log('No users need migration.');
    } else {
      const result = await User.updateMany(query, {
        $set: { authProvider: 'google' }
      });
      console.log(`Successfully migrated ${result.modifiedCount} users to 'google' authProvider.`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

migrate();
