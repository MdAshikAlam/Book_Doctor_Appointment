import { Request, Response, NextFunction } from 'express';
import Appointment from '../models/Appointment';
import User, { UserRole } from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // 1. Basic Stats
    const totalPatients = await Patient.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ isVerified: true });
    const appointmentsToday = await Appointment.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd }
    });
    const totalAppointments = await Appointment.countDocuments();

    // 2. Weekly Appointments Chart Data
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    
    const weeklyStats = await Promise.all(last7Days.map(async (day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const count = await Appointment.countDocuments({
        date: { $gte: dayStart, $lte: dayEnd }
      });
      return {
        name: format(day, 'EEE'),
        appointments: count
      };
    }));

    // 3. Recent Appointments (Last 5)
    const recentAppointments = await Appointment.find()
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

    res.status(200).json({
      status: 'success',
      data: {
        stats: [
          { title: 'Total Patients', value: totalPatients.toLocaleString(), icon: 'Users', color: 'blue' },
          { title: 'Active Doctors', value: activeDoctors.toLocaleString(), icon: 'Stethoscope', color: 'green' },
          { title: 'Appointments Today', value: appointmentsToday.toLocaleString(), icon: 'CalendarCheck', color: 'purple' },
          { title: 'Total Appointments', value: totalAppointments.toLocaleString(), icon: 'CalendarCheck', color: 'orange' },
        ],
        appointmentChartData: weeklyStats,
        recentAppointments: formattedRecent
      }
    });
  } catch (error) {
    next(error);
  }
};
