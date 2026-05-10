
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function repair() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to DB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }));
  const Organization = mongoose.model('Organization', new mongoose.Schema({}, { strict: false }));

  // 1. Find Approved Admins without a branchId
  const approvedAdmins = await User.find({ role: 'admin', status: 'approved', branchId: { $exists: false } });
  console.log(`Found ${approvedAdmins.length} approved admins needing repair.`);

  for (const admin of approvedAdmins) {
    console.log(`Repairing Admin: ${admin.name} (${admin.email})`);
    
    // Check if they already own a clinic (like Pawan owns 'abc')
    let clinic = await Clinic.findOne({ owner: admin._id });
    
    if (clinic) {
      console.log(`Found existing clinic '${clinic.clinicName}' for ${admin.name}. Linking...`);
      admin.branchId = clinic._id;
      admin.branchIds = [clinic._id];
      admin.clinic = clinic._id;
      await admin.save();
    } else {
      console.log(`No clinic found for ${admin.name}. Creating one...`);
      
      // Create Organization first
      const org = await Organization.create({
        name: admin.clinicName || `${admin.name}'s Organization`,
        owner: admin._id,
        email: admin.email,
        phone: admin.phone || '0000000000'
      });

      // Create Clinic
      const newClinic = await Clinic.create({
        clinicName: admin.clinicName || `${admin.name}'s Clinic`,
        legalName: admin.clinicName || `${admin.name}'s Clinic`,
        ownerName: admin.name,
        ownerPhone: admin.phone || '0000000000',
        ownerEmail: admin.email,
        owner: admin._id,
        createdByAdminId: admin._id,
        city: admin.city || 'Unknown',
        state: admin.state || 'Unknown',
        address: admin.city || 'Main Street',
        pincode: '000000',
        phone: admin.phone || '0000000000',
        email: admin.email,
        openingTime: '09:00',
        closingTime: '21:00',
        registrationNumber: admin.governmentIdNumber || `REG-${admin._id.toString().slice(-6)}`,
        registrationProof: 'system-generated-proof',
        location: { type: 'Point', coordinates: [0, 0] },
        clinicStatus: 'approved'
      });

      admin.branchId = newClinic._id;
      admin.branchIds = [newClinic._id];
      admin.clinic = newClinic._id;
      admin.organization = org._id;
      await admin.save();
      console.log(`Created and linked new clinic: ${newClinic.clinicName}`);
    }
  }

  console.log('Repair complete.');
  await mongoose.disconnect();
}

repair();
