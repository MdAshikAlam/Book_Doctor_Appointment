import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import User, { UserRole } from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    let patientQuery: any = {};
    let doctorQuery: any = { isVerified: true };
    let appointmentQuery: any = {};
    
    const branchId = (req as any).branchId || currentUser.branchId;
    
    if (branchId) {
      const branchObjectId = new mongoose.Types.ObjectId(branchId);
      patientQuery.branchId = branchObjectId;
      doctorQuery.branchId = branchObjectId;
      appointmentQuery.branchId = branchObjectId;
    } else if (currentUser.role !== 'super_admin' as any) {
       // If no branchId is found and user is not developer super_admin, 
       // return empty stats to enforce isolation
       return res.status(200).json({ status: 'success', data: { stats: [], appointmentChartData: [], recentAppointments: [] } });
    }

    if (currentUser.role === UserRole.DOCTOR) {
      const doctorProfile = await Doctor.findOne({ user: currentUser.id });
      const doctorId = doctorProfile?._id;
      patientQuery = { doctorId };
      appointmentQuery = { doctor: doctorId };
    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      const user = await User.findById(currentUser.id);
      const parentAdminId = user?.parentAdmin;
      const doctorsUnderAdmin = await Doctor.find({ 
        parentAdmin: parentAdminId as any 
      }).select('_id');
      const doctorIds = doctorsUnderAdmin.map(d => d._id);
      
      appointmentQuery = { doctor: { $in: doctorIds } };
      patientQuery = { doctorId: { $in: doctorIds } };
      doctorQuery = { _id: { $in: doctorIds } };
    } else if (currentUser.role === UserRole.ADMIN) {
      doctorQuery.parentAdmin = currentUser.id;
      const doctorsUnderAdmin = await Doctor.find({ parentAdmin: currentUser.id }).select('_id');
      const doctorIds = doctorsUnderAdmin.map(d => d._id);
      appointmentQuery = { doctor: { $in: doctorIds } };
      patientQuery = { doctorId: { $in: doctorIds } };
    }

    // 1. Basic Stats & Revenue - Run in parallel
    const [
      totalPatients,
      activeDoctors,
      appointmentsToday,
      totalAppointments,
      revenueAggregation,
      doctorPerformance,
      recentAppointments
    ] = await Promise.all([
      Patient.countDocuments(patientQuery),
      Doctor.countDocuments(doctorQuery),
      Appointment.countDocuments({
        ...appointmentQuery,
        date: { $gte: todayStart, $lte: todayEnd }
      }),
      Appointment.countDocuments(appointmentQuery),
      // Revenue aggregation
      Appointment.aggregate([
        { $match: { ...appointmentQuery, status: { $in: ['completed', 'visited'] } } },
        { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doctorInfo' } },
        { $unwind: '$doctorInfo' },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$doctorInfo.consultationFee' },
            revenueToday: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$date', todayStart] }, { $lte: ['$date', todayEnd] }] },
                  '$doctorInfo.consultationFee',
                  0
                ]
              }
            }
          }
        }
      ]),
      // Doctor Performance
      Appointment.aggregate([
        { $match: appointmentQuery },
        { 
          $group: { 
            _id: '$doctor', 
            count: { $sum: 1 },
            completed: { 
              $sum: { $cond: [{ $in: ['$status', ['completed', 'visited']] }, 1, 0] } 
            }
          } 
        },
        { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctorInfo' } },
        { $unwind: '$doctorInfo' },
        { $lookup: { from: 'users', localField: 'doctorInfo.user', foreignField: '_id', as: 'userInfo' } },
        { $unwind: '$userInfo' },
        {
          $project: {
            name: '$userInfo.name',
            specialty: '$doctorInfo.specialty',
            totalAppointments: '$count',
            completedAppointments: '$completed',
            revenue: { $multiply: ['$completed', '$doctorInfo.consultationFee'] }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]),
      // Recent Appointments
      Appointment.find(appointmentQuery)
        .populate('patient', 'name')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        })
        .sort('-createdAt')
        .limit(5)
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const revenueToday = revenueAggregation[0]?.revenueToday || 0;

    // 4. Weekly Appointments Chart Data - Optimized to use one aggregation if possible, but keeping Promise.all for simplicity for now
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    
    const weeklyStats = await Promise.all(last7Days.map(async (day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const count = await Appointment.countDocuments({
        ...appointmentQuery,
        date: { $gte: dayStart, $lte: dayEnd }
      });
      return {
        name: format(day, 'EEE'),
        appointments: count
      };
    }));

    const formattedRecent = recentAppointments.map(apt => ({
      id: apt._id,
      patient: apt.fullName || (apt as any).patient?.name || 'Unknown',
      doctor: (apt as any).doctor?.user?.name ? `Dr. ${(apt as any).doctor.user.name}` : 'Unknown',
      time: apt.slot,
      date: format(new Date(apt.date), 'MMM dd, yyyy'),
      status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
    }));

    // 6. Construct Stats Cards based on permissions
    const stats = [];
    
    if (currentUser.role !== UserRole.RECEPTIONIST) {
      stats.push({ title: 'Total Patients', value: totalPatients.toLocaleString(), icon: 'Users', color: 'blue' });
    }

    if (currentUser.role === UserRole.ADMIN) {
      stats.push({ title: 'Active Doctors', value: activeDoctors.toLocaleString(), icon: 'Stethoscope', color: 'green' });
      stats.push({ title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: 'IndianRupee', color: 'emerald', isCurrency: true });
    }

    stats.push({ title: 'Today\'s Revenue', value: `₹${revenueToday.toLocaleString()}`, icon: 'TrendingUp', color: 'indigo', isCurrency: true });
    stats.push({ title: 'Appointments Today', value: appointmentsToday.toLocaleString(), icon: 'CalendarCheck', color: 'purple' });

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        revenueData: {
          total: totalRevenue,
          today: revenueToday
        },
        doctorPerformance,
        appointmentChartData: weeklyStats,
        recentAppointments: formattedRecent
      }
    });
  } catch (error) {
    next(error);
  }
};

