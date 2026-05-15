const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment');
  const User = mongoose.model('User', new mongoose.Schema({ status: String, email: String }, { collection: 'users' }));
  
  const result = await User.findOneAndUpdate(
    { email: 'pawan@gmail.com' },
    { status: 'active' },
    { new: true }
  );
  
  console.log('UPDATED USER:', result);
  await mongoose.disconnect();
}

fix();
