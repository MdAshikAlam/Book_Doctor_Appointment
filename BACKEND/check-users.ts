import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './src/models/User';

dotenv.config({ path: path.join(__dirname, './.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent 5 users in DB:');
    users.forEach(u => {
      console.log({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        authProvider: u.authProvider,
        googleId: u.googleId,
        status: u.status,
        createdAt: (u as any).createdAt
      });
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
