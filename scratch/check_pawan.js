const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Define a minimal User schema for checking
const UserSchema = new mongoose.Schema({
  email: String,
  status: String,
  role: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment');
  const user = await User.findOne({ email: 'pawan@gmail.com' });
  console.log('USER STATUS:', user ? { email: user.email, status: user.status, role: user.role } : 'NOT FOUND');
  await mongoose.disconnect();
}

check();
