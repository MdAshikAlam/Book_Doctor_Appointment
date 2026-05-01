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

    // 1. Basic Stats
    const totalPatients = await Patient.countDocuments(patientQuery);
    const activeDoctors = await Doctor.countDocuments(doctorQuery);
    const appointmentsToday = await Appointment.countDocuments({
      ...appointmentQuery,
      date: { $gte: todayStart, $lte: todayEnd }
    });
    const totalAppointments = await Appointment.countDocuments(appointmentQuery);

    // 2. Weekly Appointments Chart Data
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

    // 3. Recent Appointments (Last 5)
    const recentAppointments = await Appointment.find(appointmentQuery)
      .populate('patient', 'name')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .sort('-createdAt')
      .limit(5);

    const formattedRecent = recentAppointments.map(apt => ({
      id: apt._id,
      patient: apt.fullName || (apt as any).patient?.name || 'Unknown',
      doctor: (apt as any).doctor?.user?.name ? `Dr. ${(apt as any).doctor.user.name}` : 'Unknown',
      time: apt.slot,
      date: format(new Date(apt.date), 'MMM dd, yyyy'),
      status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
    }));

    // 4. Construct Stats Cards based on permissions
    const stats = [];
    
    // Only show patients if not Receptionist (or if allowed)
    // User said "Receptionist -> only appointments", so I'll hide Patients for them.
    if (currentUser.role !== UserRole.RECEPTIONIST) {
      stats.push({ title: 'Total Patients', value: totalPatients.toLocaleString(), icon: 'Users', color: 'blue' });
    }

    // Only show doctors for Admin
    if (currentUser.role === UserRole.ADMIN) {
      stats.push({ title: 'Active Doctors', value: activeDoctors.toLocaleString(), icon: 'Stethoscope', color: 'green' });
    }

    // Appointments are shown to everyone
    stats.push({ title: 'Appointments Today', value: appointmentsToday.toLocaleString(), icon: 'CalendarCheck', color: 'purple' });
    stats.push({ title: 'Total Appointments', value: totalAppointments.toLocaleString(), icon: 'CalendarCheck', color: 'orange' });

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        appointmentChartData: weeklyStats,
        recentAppointments: formattedRecent
      }
    });
  } catch (error) {
    next(error);
  }
};
