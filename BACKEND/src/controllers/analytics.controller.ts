import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import User, { UserRole } from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Clinic from '../models/Clinic';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { AppError } from '../middlewares/error';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    const range = (req.query.range as string) || 'today';
    const dateQuery = req.query.date as string;
    
    let filterStart = startOfDay(new Date());
    let filterEnd = endOfDay(new Date());
    let dateLabel = 'Today';

    if (dateQuery) {
      const parsedDate = new Date(dateQuery);
      if (!isNaN(parsedDate.getTime())) {
        filterStart = startOfDay(parsedDate);
        filterEnd = endOfDay(parsedDate);
        dateLabel = format(parsedDate, 'MMM d, yyyy');
      }
    } else if (range === 'yesterday') {
      filterStart = startOfDay(subDays(new Date(), 1));
      filterEnd = endOfDay(subDays(new Date(), 1));
      dateLabel = 'Yesterday';
    } else if (range === 'week') {
      filterStart = startOfDay(subDays(new Date(), 6));
      filterEnd = endOfDay(new Date());
      dateLabel = 'Last 1 Week';
    } else if (range === 'month') {
      filterStart = startOfDay(subDays(new Date(), 29));
      filterEnd = endOfDay(new Date());
      dateLabel = 'Last Month';
    } else if (range === 'year') {
      filterStart = startOfDay(subDays(new Date(), 365));
      filterEnd = endOfDay(new Date());
      dateLabel = 'Last 1 Year';
    }

    // Role-specific branch / doctor scoping context
    const branchId = (req as any).branchId || currentUser.branchId;
    const branchObjId = branchId ? new mongoose.Types.ObjectId(branchId) : null;

    let doctorProfileId: mongoose.Types.ObjectId | null = null;
    if (currentUser.role === UserRole.DOCTOR) {
      const doctorProfile = await Doctor.findOne({ user: currentUser.id });
      if (!doctorProfile) throw new AppError('Doctor profile not found', 404);
      doctorProfileId = doctorProfile._id as mongoose.Types.ObjectId;
    }

    // Dynamic Chart Trend generation based on selected interval
    let chartData: any[] = [];
    if (dateQuery || range === 'today' || range === 'yesterday') {
      const getSlotHour = (slotStr?: string): number => {
        if (!slotStr) return 9;
        const match = slotStr.match(/^(\d{1,2}):(\d{2})/);
        if (match && match[1]) {
          const hour = parseInt(match[1], 10);
          const isPM = slotStr.toLowerCase().includes('pm') && hour < 12;
          const isAM = slotStr.toLowerCase().includes('am') && hour === 12;
          let parsedHour = hour;
          if (isPM) parsedHour += 12;
          if (isAM) parsedHour = 0;
          return parsedHour;
        }
        return 9;
      };

      const getIntervalLabel = (hour: number): string => {
        if (hour >= 6 && hour <= 9) return '9AM';
        if (hour >= 10 && hour <= 12) return '12PM';
        if (hour >= 13 && hour <= 15) return '3PM';
        if (hour >= 16 && hour <= 18) return '6PM';
        if (hour >= 19 && hour <= 21) return '9PM';
        return '12PM';
      };

      let activeList: any[] = [];
      let historicalList: any[] = [];

      if (currentUser.role === UserRole.SUPER_ADMIN) {
        activeList = await Appointment.find({ date: { $gte: filterStart, $lte: filterEnd } });
        historicalList = await Patient.find({ date: { $gte: filterStart, $lte: filterEnd } });
      } else if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.RECEPTIONIST) {
        activeList = await Appointment.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } });
        historicalList = await Patient.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } });
      } else if (currentUser.role === UserRole.DOCTOR) {
        activeList = await Appointment.find({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } });
        historicalList = await Patient.find({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } });
      }

      const intervalCounts: { [key: string]: number } = {
        '9AM': 0,
        '12PM': 0,
        '3PM': 0,
        '6PM': 0,
        '9PM': 0
      };

      activeList.forEach(apt => {
        const hr = getSlotHour(apt.slot);
        const label = getIntervalLabel(hr);
        intervalCounts[label] = (intervalCounts[label] || 0) + 1;
      });

      historicalList.forEach(p => {
        const hr = getSlotHour(p.timeSlot);
        const label = getIntervalLabel(hr);
        intervalCounts[label] = (intervalCounts[label] || 0) + 1;
      });

      chartData = [
        { name: '9AM', appointments: intervalCounts['9AM'] },
        { name: '12PM', appointments: intervalCounts['12PM'] },
        { name: '3PM', appointments: intervalCounts['3PM'] },
        { name: '6PM', appointments: intervalCounts['6PM'] },
        { name: '9PM', appointments: intervalCounts['9PM'] }
      ];
    } else if (range === 'week') {
      const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
      chartData = await Promise.all(last7Days.map(async (day) => {
        let count = 0;
        if (currentUser.role === UserRole.SUPER_ADMIN) {
          const active = await Appointment.countDocuments({ date: { $gte: startOfDay(day), $lte: endOfDay(day) } });
          const historical = await Patient.countDocuments({ date: { $gte: startOfDay(day), $lte: endOfDay(day) } });
          count = active + historical;
        } else if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.RECEPTIONIST) {
          const active = await Appointment.countDocuments({ branchId: branchObjId, date: { $gte: startOfDay(day), $lte: endOfDay(day) } });
          const historical = await Patient.countDocuments({ branchId: branchObjId, date: { $gte: startOfDay(day), $lte: endOfDay(day) } });
          count = active + historical;
        } else if (currentUser.role === UserRole.DOCTOR) {
          const active = await Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: startOfDay(day), $lte: endOfDay(day) } });
          const historical = await Patient.countDocuments({ doctorId: doctorProfileId, date: { $gte: startOfDay(day), $lte: endOfDay(day) } });
          count = active + historical;
        }
        return { name: format(day, 'EEE'), appointments: count };
      }));
    } else if (range === 'month') {
      chartData = await Promise.all(Array.from({ length: 4 }, (_, i) => {
        const end = subDays(new Date(), i * 7);
        const start = subDays(new Date(), (i + 1) * 7 - 1);
        
        const fetchCount = async () => {
          if (currentUser.role === UserRole.SUPER_ADMIN) {
            const active = await Appointment.countDocuments({ date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            const historical = await Patient.countDocuments({ date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            return active + historical;
          } else if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.RECEPTIONIST) {
            const active = await Appointment.countDocuments({ branchId: branchObjId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            const historical = await Patient.countDocuments({ branchId: branchObjId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            return active + historical;
          } else if (currentUser.role === UserRole.DOCTOR) {
            const active = await Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            const historical = await Patient.countDocuments({ doctorId: doctorProfileId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            return active + historical;
          }
          return 0;
        };

        return fetchCount().then(count => {
          return { name: `Wk ${4 - i}`, appointments: count };
        });
      }));
      chartData.reverse();
    } else if (range === 'year') {
      chartData = await Promise.all(Array.from({ length: 12 }, (_, i) => {
        const date = subDays(new Date(), (11 - i) * 30);
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const fetchCount = async () => {
          if (currentUser.role === UserRole.SUPER_ADMIN) {
            const active = await Appointment.countDocuments({ date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            const historical = await Patient.countDocuments({ date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            return active + historical;
          } else if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.RECEPTIONIST) {
            const active = await Appointment.countDocuments({ branchId: branchObjId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            const historical = await Patient.countDocuments({ branchId: branchObjId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            return active + historical;
          } else if (currentUser.role === UserRole.DOCTOR) {
            const active = await Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            const historical = await Patient.countDocuments({ doctorId: doctorProfileId, date: { $gte: startOfDay(start), $lte: endOfDay(end) } });
            return active + historical;
          }
          return 0;
        };

        return fetchCount().then(count => {
          return { name: format(start, 'MMM'), appointments: count };
        });
      }));
    }
    
    let resultData: any = {};

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // 1. Super Admin: Global System Stats
      const [
        totalClinics, totalAdmins, totalDoctors, totalPatients,
        activeAppointmentsCount, historicalAppointmentsCount,
        appointmentsTodayActive, appointmentsTodayHistorical,
        pendingClinics, pendingAdmins, pendingDoctors,
        revenueAggActive, revenueAggHistorical
      ] = await Promise.all([
        Clinic.countDocuments({ isDeleted: false }),
        User.countDocuments({ role: UserRole.ADMIN, isDeleted: { $ne: true } }),
        Doctor.countDocuments({ isVerified: true }),
        Patient.countDocuments({ isDeleted: false }),
        Appointment.countDocuments({}),
        Patient.countDocuments({}),
        Appointment.countDocuments({ date: { $gte: filterStart, $lte: filterEnd } }),
        Patient.countDocuments({ date: { $gte: filterStart, $lte: filterEnd } }),
        Clinic.countDocuments({ clinicStatus: 'pending' }),
        User.countDocuments({ role: UserRole.ADMIN, status: 'pending' }),
        Doctor.countDocuments({ status: 'submitted' }),
        Appointment.aggregate([
          { $match: { status: { $in: ['completed', 'visited'] }, date: { $gte: filterStart, $lte: filterEnd } } },
          { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doc' } },
          { $unwind: '$doc' },
          { $group: { _id: null, total: { $sum: '$doc.consultationFee' } } }
        ]),
        Patient.aggregate([
          { $match: { status: { $in: ['completed', 'visited'] }, date: { $gte: filterStart, $lte: filterEnd } } },
          { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doc' } },
          { $unwind: '$doc' },
          { $group: { _id: null, total: { $sum: '$doc.consultationFee' } } }
        ])
      ]);

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

      const totalRevenue = (revenueAggActive[0]?.total || 0) + (revenueAggHistorical[0]?.total || 0);

      resultData = {
        stats: [
          { title: 'Total Clinics', value: totalClinics.toLocaleString(), icon: 'Users', color: 'blue' },
          { title: 'Total Admins', value: totalAdmins.toLocaleString(), icon: 'ShieldCheck', color: 'indigo' },
          { title: 'Total Doctors', value: totalDoctors.toLocaleString(), icon: 'Stethoscope', color: 'green' },
          { title: 'Total Patients', value: totalPatients.toLocaleString(), icon: 'Users', color: 'orange' },
          { title: 'Total Appointments', value: (activeAppointmentsCount + historicalAppointmentsCount).toLocaleString(), icon: 'CalendarCheck', color: 'purple' },
          { title: `${dateLabel} Bookings`, value: (appointmentsTodayActive + appointmentsTodayHistorical).toLocaleString(), icon: 'TrendingUp', color: 'emerald' },
          { title: 'Pending Requests', value: (pendingClinics + pendingAdmins + pendingDoctors).toString(), icon: 'AlertCircle', color: 'rose' },
          { title: `${dateLabel} Revenue`, value: `₹${totalRevenue.toLocaleString()}`, icon: 'IndianRupee', color: 'emerald', isCurrency: true }
        ],
        appointmentChartData: chartData,
        branchPerformance,
        recentActivity: [
          { id: 1, text: 'New Clinic "City Health" registered', time: '2 hours ago', type: 'registration' },
          { id: 2, text: 'Dr. Khanna profile approved', time: '4 hours ago', type: 'approval' },
          { id: 3, text: 'System backup completed', time: 'Yesterday', type: 'system' }
        ]
      };

    } else if (currentUser.role === UserRole.ADMIN) {
      // 2. Admin: Branch/Hospital Stats
      if (!branchObjId) throw new AppError('Branch context required for Admin', 400);

      const [
        todayAptsActive, todayAptsHistorical,
        checkedInAptsActive, checkedInAptsHistorical,
        completedAptsActive, completedAptsHistorical,
        missedAptsActive, missedAptsHistorical,
        upcomingAptsActive, historicalApts
      ] = await Promise.all([
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'checked_in' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'checked_in' }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['completed', 'visited'] } }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['completed', 'visited'] } }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'missed' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'missed' }),

        Appointment.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['booked', 'confirmed', 'checked_in'] } })
          .populate('patient', 'name')
          .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
          .sort('date')
          .limit(10),

        Patient.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } })
          .sort('date')
          .limit(10)
      ]);

      const mergedUpcomingApts = [
        ...upcomingAptsActive.map(apt => ({
          id: apt._id,
          patient: apt.fullName || (apt as any).patient?.name,
          doctor: (apt as any).doctor?.user?.name || 'Unknown Doctor',
          time: apt.slot,
          status: apt.status
        })),
        ...historicalApts.map(p => ({
          id: p._id,
          patient: p.patientName,
          doctor: p.doctorName,
          time: p.timeSlot,
          status: p.status || 'completed'
        }))
      ];

      resultData = {
        stats: [
          { title: `${dateLabel} Appointments`, value: (todayAptsActive + todayAptsHistorical).toLocaleString(), icon: 'CalendarCheck', color: 'blue' },
          { title: 'Checked-In Patients', value: (checkedInAptsActive + checkedInAptsHistorical).toLocaleString(), icon: 'Users', color: 'cyan' },
          { title: 'Completed Consultations', value: (completedAptsActive + completedAptsHistorical).toLocaleString(), icon: 'CheckCircle2', color: 'green' },
          { title: 'Missed Appointments', value: (missedAptsActive + missedAptsHistorical).toLocaleString(), icon: 'XCircle', color: 'red' },
        ],
        appointmentChartData: chartData,
        upcomingAppointments: mergedUpcomingApts
      };

    } else if (currentUser.role === UserRole.DOCTOR) {
      // 3. Doctor Dashboard
      const PatientModel = (await import('../models/Patient')).default;

      const [
        pendingDraftsActive, pendingDraftsHistorical,
        todayPatientsActive, todayPatientsHistorical,
        completedAptsActive, completedAptsHistorical,
        followUpsActive, followUpsHistorical,
        scheduleActive, historicalPatients
      ] = await Promise.all([
        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'draft_prepared' }),
        PatientModel.countDocuments({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'draft_prepared' }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } }),
        PatientModel.countDocuments({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['completed', 'visited'] } }),
        PatientModel.countDocuments({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['completed', 'visited'] } }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'follow_up' }),
        PatientModel.countDocuments({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'follow_up' }),

        Appointment.find({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } })
          .populate('patient', 'name phone')
          .sort('slot'),

        PatientModel.find({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } })
          .sort('timeSlot')
      ]);

      const mergedSchedule = [
        ...scheduleActive.map(apt => ({
          id: apt._id,
          patientName: apt.fullName || (apt as any).patient?.name,
          timeSlot: apt.slot,
          type: (apt as any).appointmentType || 'Consultation',
          status: apt.status
        })),
        ...historicalPatients.map(p => ({
          id: p._id,
          patientName: p.patientName,
          timeSlot: p.timeSlot,
          type: 'Consultation',
          status: p.status || 'completed'
        }))
      ];

      resultData = {
        stats: [
          { title: 'Pending Draft Reviews', value: (pendingDraftsActive + pendingDraftsHistorical).toLocaleString(), icon: 'Clock', color: 'amber' },
          { title: `${dateLabel} Patients`, value: (todayPatientsActive + todayPatientsHistorical).toLocaleString(), icon: 'Users', color: 'blue' },
          { title: `${dateLabel} Completed`, value: (completedAptsActive + completedAptsHistorical).toLocaleString(), icon: 'CheckCircle2', color: 'green' },
          { title: `${dateLabel} Follow-Ups`, value: (followUpsActive + followUpsHistorical).toLocaleString(), icon: 'CalendarCheck', color: 'indigo' },
        ],
        appointmentChartData: chartData,
        schedule: mergedSchedule
      };

    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      // 4. Receptionist Dashboard
      const [
        draftActive, draftHistorical,
        checkedInActive, checkedInHistorical,
        followUpActive, followUpHistorical,
        reportsActive, reportsHistorical,
        queueActive, queueHistorical
      ] = await Promise.all([
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'draft_prepared' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'draft_prepared' }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'checked_in' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'checked_in' }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'follow_up' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'follow_up' }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, "reports.0": { $exists: true } }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, "reports.0": { $exists: true } }),

        Appointment.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } })
          .populate('patient', 'name')
          .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
          .sort('slot'),

        Patient.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } })
          .sort('timeSlot')
      ]);

      const mergedQueue = [
        ...queueActive.map(apt => ({
          id: apt._id,
          patientName: apt.fullName || (apt as any).patient?.name,
          doctorName: (apt as any).doctor?.user?.name || 'Unknown Doctor',
          time: apt.slot,
          status: apt.status
        })),
        ...queueHistorical.map(p => ({
          id: p._id,
          patientName: p.patientName,
          doctorName: p.doctorName,
          time: p.timeSlot,
          status: p.status || 'completed'
        }))
      ];

      resultData = {
        stats: [
          { title: 'Draft Consultations', value: (draftActive + draftHistorical).toLocaleString(), icon: 'Clock', color: 'amber' },
          { title: `${dateLabel} Checked-In`, value: (checkedInActive + checkedInHistorical).toLocaleString(), icon: 'CheckCircle2', color: 'cyan' },
          { title: `${dateLabel} Follow-Ups`, value: (followUpActive + followUpHistorical).toLocaleString(), icon: 'CalendarCheck', color: 'purple' },
          { title: `${dateLabel} Reports`, value: (reportsActive + reportsHistorical).toLocaleString(), icon: 'Users', color: 'blue' }
        ],
        appointmentChartData: chartData,
        queue: mergedQueue
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
