const mongoose = require('mongoose');

// Define a minimal User schema for checking
const UserSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true },
  role: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function check() {
  try {
    const MONGODB_URI = 'mongodb://mdashikalam:277236As@ac-meojmre-shard-00-00.gjtary8.mongodb.net:27017,ac-meojmre-shard-00-01.gjtary8.mongodb.net:27017,ac-meojmre-shard-00-02.gjtary8.mongodb.net:27017/bookmydoctor?ssl=true&replicaSet=atlas-w5olkc-shard-0&authSource=admin&appName=Cluster0&retryWrites=true';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    const user = await User.findOne({ email: 'admin@bookmydoctor.com' });
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:', user.email);
      console.log('Role:', user.role);
      console.log('Pass Hash Length:', user.password?.length);
      console.log('Pass Hash Start:', user.password?.substring(0, 10));
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
