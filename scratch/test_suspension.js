const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  // Create a test user
  const email = 'test_suspend@example.com';
  await User.deleteOne({ email });
  const user = await User.create({
    name: 'Test Suspend',
    email,
    password: 'password123',
    role: 'doctor',
    status: 'active'
  });
  console.log('CREATED USER:', user.status);

  // Suspend
  await User.findByIdAndUpdate(user._id, { status: 'suspended' });
  let updated = await User.findById(user._id);
  console.log('SUSPENDED STATUS:', updated.status);

  // Reactivate
  await User.findByIdAndUpdate(user._id, { status: 'active' });
  updated = await User.findById(user._id);
  console.log('REACTIVATED STATUS:', updated.status);

  await User.deleteOne({ email });
  await mongoose.disconnect();
}

test();
