
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function repair() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Clinic = mongoose.model('Clinic', new mongoose.Schema({}, { strict: false }));
  const Organization = mongoose.model('Organization', new mongoose.Schema({}, { strict: false }));

  const approvedAdmins = await User.find({ role: 'admin', status: 'approved' });
  console.log(`Found ${approvedAdmins.length} approved admins.`);

  for (const admin of approvedAdmins) {
    if (!admin.branchId) {
        console.log(`Repairing Admin: ${admin.name} (${admin.email})`);
        
        let clinic = await Clinic.findOne({ owner: admin._id });
        
        if (clinic) {
          console.log(`Found existing clinic '${clinic.clinicName}' for ${admin.name}. Linking...`);
          await User.updateOne({ _id: admin._id }, { 
            $set: { 
                branchId: clinic._id,
                branchIds: [clinic._id],
                clinic: clinic._id
            } 
          });
        } else {
          console.log(`No clinic found for ${admin.name}. Creating one...`);
          
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

          await User.updateOne({ _id: admin._id }, { 
            $set: { 
                branchId: newClinic._id,
                branchIds: [newClinic._id],
                clinic: newClinic._id
            } 
          });
          console.log(`Created and linked new clinic: ${newClinic.clinicName}`);
        }
    }
  }

  console.log('Repair complete.');
  await mongoose.disconnect();
}

repair();
