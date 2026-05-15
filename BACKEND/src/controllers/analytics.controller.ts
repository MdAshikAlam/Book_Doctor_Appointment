import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import User, { UserRole } from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Clinic from '../models/Clinic';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    
    // Time Ranges
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    let resultData: any = {};

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // 1. Super Admin: Global System Stats
      const [
        totalClinics, totalAdmins, totalDoctors, totalPatients,
        totalAppointments, appointmentsToday, pendingClinics, 
        pendingAdmins, pendingDoctors, revenueAgg
      ] = await Promise.all([
        Clinic.countDocuments({ isDeleted: false }),
        User.countDocuments({ role: UserRole.ADMIN, isDeleted: { $ne: true } }),
        Doctor.countDocuments({ isVerified: true }),
        Patient.countDocuments({ isDeleted: false }),
        Appointment.countDocuments({}),
        Appointment.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
        Clinic.countDocuments({ clinicStatus: 'pending' }),
        User.countDocuments({ role: UserRole.ADMIN, status: 'pending' }),
        Doctor.countDocuments({ status: 'submitted' }),
        Appointment.aggregate([
          { $match: { status: { $in: ['completed', 'visited'] } } },
          { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doc' } },
          { $unwind: '$doc' },
          { $group: { _id: null, total: { $sum: '$doc.consultationFee' } } }
        ])
      ]);

      const weeklyStats = await Promise.all(last7Days.map(async (day) => {
        const count = await Appointment.countDocuments({ date: { $gte: startOfDay(day), $lte: endOfDay(day) } });
        return { name: format(day, 'EEE'), appointments: count };
      }));

      const branchPerformance = await Clinic.aggregate([
        { $match: { isDeleted: false } },
        { $lookup: { from: 'appointments', localField: '_id', foreignField: 'branchId', as: 'apts' } },
        {
          $project: {
            name: '$clinicName',
            appointmentCount: { $size: '$apts' },
            revenue: { $sum: 0 } // Simplified for now
          }
        },
        { $sort: { appointmentCount: -1 } },
        { $limit: 5 }
      ]);

      resultData = {
        stats: [
          { title: 'Total Clinics', value: totalClinics.toLocaleString(), icon: 'Home', color: 'blue' },
          { title: 'Total Admins', value: totalAdmins.toLocaleString(), icon: 'ShieldCheck', color: 'indigo' },
          { title: 'Total Doctors', value: totalDoctors.toLocaleString(), icon: 'Stethoscope', color: 'green' },
          { title: 'Total Patients', value: totalPatients.toLocaleString(), icon: 'Users', color: 'orange' },
          { title: 'Total Appointments', value: totalAppointments.toLocaleString(), icon: 'CalendarCheck', color: 'purple' },
          { title: 'Today\'s Bookings', value: appointmentsToday.toLocaleString(), icon: 'TrendingUp', color: 'emerald' },
          { title: 'Pending Requests', value: (pendingClinics + pendingAdmins + pendingDoctors).toString(), icon: 'AlertCircle', color: 'rose' },
          { title: 'Total Revenue', value: `₹${(revenueAgg[0]?.total || 0).toLocaleString()}`, icon: 'IndianRupee', color: 'emerald', isCurrency: true }
        ],
        appointmentChartData: weeklyStats,
        branchPerformance,
        recentActivity: [
          { id: 1, text: 'New Clinic "City Health" registered', time: '2 hours ago', type: 'registration' },
          { id: 2, text: 'Dr. Khanna profile approved', time: '4 hours ago', type: 'approval' },
          { id: 3, text: 'System backup completed', time: 'Yesterday', type: 'system' }
        ]
      };

    } else if (currentUser.role === UserRole.ADMIN) {
      // 2. Admin: Branch/Hospital Stats
      const branchId = (req as any).branchId || currentUser.branchId;
      if (!branchId) throw new AppError('Branch context required for Admin', 400);

      const branchObjId = new mongoose.Types.ObjectId(branchId);
      const [
        totalDoctors, totalPatients, todayApts, completedApts,
        pendingApts, revenueToday, upcomingApts
      ] = await Promise.all([
        Doctor.countDocuments({ branchId: branchObjId }),
        Patient.countDocuments({ branchId: branchObjId }),
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: todayStart, $lte: todayEnd } }),
        Appointment.countDocuments({ branchId: branchObjId, status: { $in: ['completed', 'visited'] } }),
        Appointment.countDocuments({ branchId: branchObjId, status: 'booked' }),
        Appointment.aggregate([
          { $match: { branchId: branchObjId, date: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['completed', 'visited'] } } },
          { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doc' } },
          { $unwind: '$doc' },
          { $group: { _id: null, total: { $sum: '$doc.consultationFee' } } }
        ]),
        Appointment.find({ branchId: branchObjId, date: { $gte: todayStart }, status: 'booked' })
          .populate('patient', 'name')
          .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
          .sort('date')
          .limit(5)
      ]);

      resultData = {
        stats: [
          { title: 'Branch Doctors', value: totalDoctors.toLocaleString(), icon: 'Stethoscope', color: 'blue' },
          { title: 'Branch Patients', value: totalPatients.toLocaleString(), icon: 'Users', color: 'orange' },
          { title: 'Today\'s Apps', value: todayApts.toLocaleString(), icon: 'CalendarCheck', color: 'purple' },
          { title: 'Completed Visits', value: completedApts.toLocaleString(), icon: 'CheckCircle2', color: 'green' },
          { title: 'Pending Apps', value: pendingApts.toLocaleString(), icon: 'Clock', color: 'amber' },
          { title: 'Today Revenue', value: `₹${(revenueToday[0]?.total || 0).toLocaleString()}`, icon: 'IndianRupee', color: 'emerald', isCurrency: true }
        ],
        upcomingAppointments: upcomingApts.map(apt => ({
          id: apt._id,
          patient: (apt as any).patient?.name || apt.fullName,
          doctor: (apt as any).doctor?.user?.name,
          time: apt.slot,
          status: apt.status
        }))
      };

    } else if (currentUser.role === UserRole.DOCTOR) {
      // 3. Doctor Dashboard
      const doctorProfile = await Doctor.findOne({ user: currentUser.id });
      if (!doctorProfile) throw new AppError('Doctor profile not found', 404);

      const [
        todayPatients, upcoming, completed, pending, schedule
      ] = await Promise.all([
        Appointment.countDocuments({ doctor: doctorProfile._id, date: { $gte: todayStart, $lte: todayEnd } }),
        Appointment.countDocuments({ doctor: doctorProfile._id, date: { $gte: todayEnd }, status: 'booked' }),
        Appointment.countDocuments({ doctor: doctorProfile._id, status: { $in: ['completed', 'visited'] } }),
        Appointment.countDocuments({ doctor: doctorProfile._id, status: 'booked', date: { $lte: todayEnd } }),
        Appointment.find({ doctor: doctorProfile._id, date: { $gte: todayStart, $lte: todayEnd } })
          .populate('patient', 'name phone')
          .sort('slot')
      ]);

      resultData = {
        stats: [
          { title: 'Today\'s Patients', value: todayPatients.toLocaleString(), icon: 'Users', color: 'blue' },
          { title: 'Upcoming Apps', value: upcoming.toLocaleString(), icon: 'CalendarCheck', color: 'indigo' },
          { title: 'Total Consulted', value: completed.toLocaleString(), icon: 'CheckCircle2', color: 'green' },
          { title: 'Pending Today', value: pending.toLocaleString(), icon: 'Clock', color: 'amber' }
        ],
        schedule: schedule.map(apt => ({
          id: apt._id,
          patientName: (apt as any).patient?.name || apt.fullName,
          timeSlot: apt.slot,
          type: apt.appointmentType || 'Consultation',
          status: apt.status
        }))
      };

    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      // 4. Receptionist Dashboard
      const branchId = (req as any).branchId || currentUser.branchId;
      const branchObjId = branchId ? new mongoose.Types.ObjectId(branchId) : null;

      const [
        todayReg, todayApts, walkIns, pendingCheckins, queue
      ] = await Promise.all([
        Patient.countDocuments({ branchId: branchObjId, createdAt: { $gte: todayStart, $lte: todayEnd } }),
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: todayStart, $lte: todayEnd } }),
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: todayStart, $lte: todayEnd }, appointmentType: 'Walk-in' }),
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: todayStart, $lte: todayEnd }, status: 'booked' }),
        Appointment.find({ branchId: branchObjId, date: { $gte: todayStart, $lte: todayEnd } })
          .populate('patient', 'name')
          .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
          .sort('slot')
      ]);

      resultData = {
        stats: [
          { title: 'New Registrations', value: todayReg.toLocaleString(), icon: 'UserPlus', color: 'blue' },
          { title: 'Today\'s Total', value: todayApts.toLocaleString(), icon: 'CalendarCheck', color: 'purple' },
          { title: 'Walk-in Patients', value: walkIns.toLocaleString(), icon: 'Walking', color: 'indigo' },
          { title: 'Pending Check-ins', value: pendingCheckins.toLocaleString(), icon: 'Clock', color: 'amber' }
        ],
        queue: queue.map(apt => ({
          id: apt._id,
          patientName: (apt as any).patient?.name || apt.fullName,
          doctorName: (apt as any).doctor?.user?.name,
          time: apt.slot,
          status: apt.status
        }))
      };
    }

    res.status(200).json({
      status: 'success',
      data: resultData
    });
  } catch (error) {
    next(error);
  }
};


export const getNotificationCounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const lastViewed = user.lastViewedNotifications || {
      adminRequests: new Date(0),
      clinicVerification: new Date(0),
      doctorVerification: new Date(0)
    };

    // 1. Admin Requests (Pending users with role admin)
    const [adminPending, adminNew] = await Promise.all([
      User.countDocuments({ role: UserRole.ADMIN, status: 'pending' }),
      User.countDocuments({ 
        role: UserRole.ADMIN, 
        status: 'pending', 
        createdAt: { $gt: lastViewed.adminRequests || new Date(0) } 
      })
    ]);

    // 2. Clinic Verification (Pending clinics)
    const [clinicPending, clinicNew] = await Promise.all([
      Clinic.countDocuments({ clinicStatus: 'pending' }),
      Clinic.countDocuments({ 
        clinicStatus: 'pending', 
        createdAt: { $gt: lastViewed.clinicVerification || new Date(0) } 
      })
    ]);

    // 3. Doctor Verification (Submitted doctors)
    const [doctorPending, doctorNew] = await Promise.all([
      Doctor.countDocuments({ status: 'submitted' }),
      Doctor.countDocuments({ 
        status: 'submitted', 
        createdAt: { $gt: lastViewed.doctorVerification || new Date(0) } 
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        adminRequests: { total: adminPending, new: adminNew },
        clinicVerification: { total: clinicPending, new: clinicNew },
        doctorVerification: { total: doctorPending, new: doctorNew }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsViewed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.body;
    const userId = (req as any).user.id;

    if (!['adminRequests', 'clinicVerification', 'doctorVerification'].includes(category)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid category' });
    }

    const updateField = `lastViewedNotifications.${category}`;
    await User.findByIdAndUpdate(userId, {
      $set: { [updateField]: new Date() }
    });

    res.status(200).json({
      status: 'success',
      message: `Notifications for ${category} marked as viewed`
    });
  } catch (error) {
    next(error);
  }
};
