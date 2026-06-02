import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

async function updateIndexes() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Database connected.');

    const db = mongoose.connection.db!;
    const collection = db.collection('users');

    console.log('Checking existing indexes on users collection...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    // Check if email_1 index exists and drop it
    const hasEmailIndex = indexes.some(idx => idx.name === 'email_1');
    if (hasEmailIndex) {
      console.log('Dropping unique index email_1...');
      await collection.dropIndex('email_1');
      console.log('Dropped email_1 successfully.');
    } else {
      console.log('No email_1 index found.');
    }

    // Check if new compound index email_1_role_1 already exists
    const hasCompoundIndex = indexes.some(idx => idx.name === 'email_1_role_1');
    if (!hasCompoundIndex) {
      console.log('Creating compound unique index { email: 1, role: 1 }...');
      await collection.createIndex({ email: 1, role: 1 }, { unique: true });
      console.log('Compound unique index created successfully.');
    } else {
      console.log('Compound unique index already exists.');
    }

  } catch (error) {
    console.error('Error updating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

updateIndexes();
