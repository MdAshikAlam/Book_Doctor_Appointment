import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Doctor from '../src/models/Doctor';
import { geocodeAddress } from '../src/utils/geocoder';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function syncCoordinates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const doctors = await Doctor.find({});
    console.log(`Checking ${doctors.length} doctors...`);

    for (const doc of doctors) {
      console.log(`Geocoding ${doc.city}, ${doc.country} for doctor ${doc._id}...`);
      try {
        const { lat, lng } = await geocodeAddress('', doc.city, doc.country);
        
        doc.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        
        await doc.save();
        console.log(`✅ Updated ${doc.city} to [${lng}, ${lat}]`);
      } catch (err: any) {
        console.error(`❌ Failed to geocode ${doc.city}: ${err.message}`);
      }
    }

    console.log('Sync complete.');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

syncCoordinates();
