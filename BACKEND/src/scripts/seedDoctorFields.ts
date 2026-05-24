import mongoose from 'mongoose';
import Doctor from '../models/Doctor';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const specialties = [
  'Cardiologist',
  'Dentist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'Gynecologist',
  'Pediatrician'
];

const names = [
  { name: 'Dr. Sarah Johnson', gender: 'female', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop' },
  { name: 'Dr. Michael Chen', gender: 'male', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&auto=format&fit=crop' },
  { name: 'Dr. Elena Rodriguez', gender: 'female', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=300&h=300&auto=format&fit=crop' },
  { name: 'Dr. Raj Patel', gender: 'male', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&h=300&auto=format&fit=crop' },
  { name: 'Dr. Lisa Wong', gender: 'female', avatar: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=300&h=300&auto=format&fit=crop' },
  { name: 'Dr. David Kim', gender: 'male', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&h=300&auto=format&fit=crop' },
  { name: 'Dr. Sophia Martinez', gender: 'female', avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=300&h=300&auto=format&fit=crop' }
];

const languageOptions = [
  ['English', 'Spanish'],
  ['English', 'Hindi'],
  ['English', 'Hindi', 'Bengali'],
  ['English', 'Tamil'],
  ['English', 'Spanish', 'French'],
  ['English', 'Mandarin'],
  ['English', 'Hindi', 'Punjabi']
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/book_doctor_appointment';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // 1. Fetch all doctors
    let doctors = await Doctor.find();
    console.log(`Found ${doctors.length} existing doctors in the database.`);

    if (doctors.length === 0) {
      console.log('No doctors found. Creating mock doctors...');

      // Let's find or create a clinic/branch so that doctors can belong to it.
      const Clinic = mongoose.model('Clinic');
      let clinic: any = await Clinic.findOne();
      if (!clinic) {
        clinic = await Clinic.create({
          name: 'Central Care Hospital',
          clinicType: 'Hospital',
          address: '123 Health Ave, Central District',
          district: 'New Delhi',
          state: 'Delhi',
          rating: 4.8,
          location: { type: 'Point', coordinates: [77.209, 28.613] }
        });
        console.log('Created a central clinic:', clinic.name);
      }

      for (let i = 0; i < names.length; i++) {
        const item = names[i]!;
        // Create user
        const email = `${item.name.toLowerCase().replace(/[^\w]/g, '')}@example.com`;
        let user: any = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: item.name.replace('Dr. ', ''),
            email,
            password: '$2a$10$abcdefghijklmnopqrstuvw', // dummy bcrypt hash
            role: 'doctor',
            gender: item.gender,
            avatar: item.avatar,
            phone: `+91999990000${i}`
          });
        }

        const spec = specialties[i % specialties.length]!;
        const slug = item.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

        // Create doctor profile
        const docData: any = {
          user: user._id,
          specialty: spec,
          experience: 5 + i * 3,
          qualifications: ['MBBS', 'MD - ' + spec],
          licenseNumber: `LIC-999000${i}`,
          medicalCouncil: 'Medical Council of India',
          bio: `Dr. ${user.name} is a highly dedicated ${spec} with years of experience treating various health issues.`,
          consultationFee: 400 + (i * 200),
          address: `${10 + i * 5} Medical Plaza, Connaught Place`,
          district: 'New Delhi',
          state: 'Delhi',
          rating: Number((4.2 + (i % 8) * 0.1).toFixed(1)),
          numReviews: 30 + i * 25,
          location: { type: 'Point', coordinates: [77.209 + (i * 0.005), 28.613 + (i * 0.003)] },
          branchId: clinic._id,
          clinic: clinic._id,
          status: 'verified',
          isVerified: true,
          videoConsultation: i % 2 === 0,
          emergencyConsultation: i % 3 === 0,
          insuranceAccepted: i % 4 !== 0,
          languages: languageOptions[i % languageOptions.length],
          slug,
          availability: [
            { day: 'Monday', slots: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00'] },
            { day: 'Tuesday', slots: ['09:00 - 10:00', '11:00 - 12:00'] },
            { day: 'Wednesday', slots: ['10:00 - 11:00', '15:00 - 16:00'] },
            { day: 'Thursday', slots: ['09:00 - 10:00', '14:00 - 15:00'] },
            { day: 'Friday', slots: ['10:00 - 11:00', '16:00 - 17:00'] },
            { day: 'Saturday', slots: ['09:00 - 12:00'] }
          ]
        };
        
        const doc = await Doctor.create(docData);

        // Add doctor to clinic
        await Clinic.findByIdAndUpdate(clinic._id, {
          $addToSet: { doctors: doc._id }
        });

        console.log(`Created doctor: ${item.name} (${spec})`);
      }
    } else {
      console.log('Seeding updates to existing doctors...');
      for (let i = 0; i < doctors.length; i++) {
        const doc = doctors[i]!;
        
        // Random values
        const updateData: any = {
          rating: doc.rating && doc.rating > 0 ? doc.rating : Number((4.1 + Math.random() * 0.8).toFixed(1)),
          numReviews: doc.numReviews && doc.numReviews > 0 ? doc.numReviews : Math.floor(Math.random() * 150) + 20,
          videoConsultation: doc.videoConsultation !== undefined ? doc.videoConsultation : Math.random() > 0.4,
          emergencyConsultation: doc.emergencyConsultation !== undefined ? doc.emergencyConsultation : Math.random() > 0.7,
          insuranceAccepted: doc.insuranceAccepted !== undefined ? doc.insuranceAccepted : Math.random() > 0.2,
          languages: doc.languages && doc.languages.length > 0 ? doc.languages : languageOptions[i % languageOptions.length],
          status: 'verified',
          isVerified: true
        };

        // If availability is empty, seed standard availability
        if (!doc.availability || doc.availability.length === 0) {
          updateData.availability = [
            { day: 'Monday', slots: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00'] },
            { day: 'Tuesday', slots: ['09:00 - 10:00', '11:00 - 12:00'] },
            { day: 'Wednesday', slots: ['10:00 - 11:00', '15:00 - 16:00'] },
            { day: 'Thursday', slots: ['09:00 - 10:00', '14:00 - 15:00'] },
            { day: 'Friday', slots: ['10:00 - 11:00', '16:00 - 17:00'] },
            { day: 'Saturday', slots: ['09:00 - 12:00'] }
          ];
        }

        await Doctor.findByIdAndUpdate(doc._id, updateData);
        
        // Ensure user has gender and avatar if missing
        if (doc.user) {
          const user = await User.findById(doc.user);
          if (user) {
            const userUpdate: any = {};
            if (!user.gender) {
              userUpdate.gender = i % 2 === 0 ? 'female' : 'male';
            }
            if (!user.avatar) {
              userUpdate.avatar = i % 2 === 0 
                ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&auto=format&fit=crop';
            }
            if (Object.keys(userUpdate).length > 0) {
              await User.findByIdAndUpdate(user._id, userUpdate);
            }
          }
        }
      }
      console.log('Successfully updated all existing doctors.');
    }

    console.log('Database seeding/migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seed();
