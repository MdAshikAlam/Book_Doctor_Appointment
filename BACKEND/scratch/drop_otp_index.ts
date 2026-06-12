import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';

async function run() {
  console.log('Connecting to database:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('No database connection');
    process.exit(1);
  }
  const collection = db.collection('otps');
  console.log('Checking indexes on otps...');
  try {
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    const hasTTLIndex = indexes.some(idx => idx.name === 'createdAt_1');
    if (hasTTLIndex) {
      console.log('Dropping TTL index createdAt_1...');
      await collection.dropIndex('createdAt_1');
      console.log('Dropped successfully.');
    } else {
      console.log('No TTL index createdAt_1 found.');
    }
  } catch (err) {
    console.error('Error dropping index:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
run();
