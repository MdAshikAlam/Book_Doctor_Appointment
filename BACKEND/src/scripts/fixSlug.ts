import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Clinic from '../models/Clinic';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI!;
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const c = await Clinic.findOne({ slug: 'abc' });
    if (c) {
      c.set('slug', 'nehar-clinics');
      await c.save();
      console.log('Updated successfully');
    } else {
      console.log('Clinic not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
