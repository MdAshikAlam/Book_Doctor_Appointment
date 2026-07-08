import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import User, { UserRole } from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Clinic from '../models/Clinic';
import Contact from '../models/Contact';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { AppError } from '../middlewares/error';
import { checkAndAutoUpdateMissedAppointments } from '../services/appointment.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await checkAndAutoUpdateMissedAppointments();
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
    let branchObjId = branchId ? new mongoose.Types.ObjectId(branchId) : null;

    if (currentUser.role === UserRole.ADMIN) {
      const clinics = await Clinic.find({ owner: currentUser.id, isDeleted: false });
      if (clinics.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            hasClinics: false,
            stats: [],
            upcomingAppointments: [],
            appointmentChartData: []
          }
        });
      }
      if (!branchObjId) {
        branchObjId = clinics[0]!._id as mongoose.Types.ObjectId;
      }
    }

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
        pendingClinics, pendingDoctors,
        activeClinics, activeAdmins, activeDoctors, activeReceptionists, registeredPatients,
        bookedToday, checkedInToday, completedToday, cancelledToday, noShowToday,
        platformRevenueAgg, totalAppointmentsCount, contactsCount
      ] = await Promise.all([
        Clinic.countDocuments({ clinicStatus: 'pending', isDeleted: false }),
        Doctor.countDocuments({ status: 'submitted' }),
        
        Clinic.countDocuments({ clinicStatus: 'approved', isDeleted: false }),
        User.countDocuments({ role: UserRole.ADMIN, status: 'approved', isDeleted: { $ne: true } }),
        Doctor.countDocuments({ status: 'verified' }),
        User.countDocuments({ role: UserRole.RECEPTIONIST, status: 'approved', isDeleted: { $ne: true } }),
        User.countDocuments({ role: UserRole.PATIENT, isDeleted: { $ne: true } }),
        
        Appointment.countDocuments({ date: { $gte: filterStart, $lte: filterEnd } }),
        Appointment.countDocuments({ status: 'checked_in', date: { $gte: filterStart, $lte: filterEnd } }),
        Appointment.countDocuments({ status: { $in: ['completed', 'follow_up'] }, date: { $gte: filterStart, $lte: filterEnd } }),
        Appointment.countDocuments({ status: 'cancelled', date: { $gte: filterStart, $lte: filterEnd } }),
        Appointment.countDocuments({ status: 'patient_missed', date: { $gte: filterStart, $lte: filterEnd } }),
        
        Appointment.aggregate([
          { $match: { status: { $in: ['completed', 'follow_up'] } } },
          { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doc' } },
          { $unwind: '$doc' },
          { $group: { _id: null, total: { $sum: '$doc.consultationFee' } } }
        ]),
        Appointment.countDocuments({}),
        Contact.countDocuments({})
      ]);

      const totalRevenue = platformRevenueAgg[0]?.total || 0;
      const commissionRevenue = Math.round(totalRevenue * 0.15); // 15% platform fee

      const branchPerformance = await Clinic.aggregate([
        { $match: { isDeleted: false } },
        { $lookup: { from: 'appointments', localField: '_id', foreignField: 'branchId', as: 'apts' } },
        {
          $project: {
            name: '$clinicName',
            appointmentCount: { $size: '$apts' },
            revenue: { $sum: 0 },
            averageRating: { $ifNull: ['$averageRating', 0] }
          }
        },
        { $sort: { appointmentCount: -1 } },
        { $limit: 5 }
      ]);

      // Fetch registered patients with activity counts (booked, completed, cancelled, total)
      const registeredPatientsWithActivity = await User.aggregate([
        { $match: { role: UserRole.PATIENT, isDeleted: { $ne: true } } },
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'patient',
            as: 'apts'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            fullName: 1,
            email: 1,
            phone: 1,
            createdAt: 1,
            totalBooked: {
              $size: {
                $filter: {
                  input: '$apts',
                  as: 'apt',
                  cond: { $in: ['$$apt.status', ['booked', 'confirmed', 'checked_in', 'waiting', 'in_consultation']] }
                }
              }
            },
            totalCancelled: {
              $size: {
                $filter: {
                  input: '$apts',
                  as: 'apt',
                  cond: { $eq: ['$$apt.status', 'cancelled'] }
                }
              }
            },
            totalCompleted: {
              $size: {
                $filter: {
                  input: '$apts',
                  as: 'apt',
                  cond: { $in: ['$$apt.status', ['completed', 'follow_up']] }
                }
              }
            },
            totalMissed: {
              $size: {
                $filter: {
                  input: '$apts',
                  as: 'apt',
                  cond: { $eq: ['$$apt.status', 'patient_missed'] }
                }
              }
            },
            totalAppointments: { $size: '$apts' }
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      resultData = {
        registeredPatientsWithActivity,
        approvalQueue: {
          pendingClinics,
          pendingDoctors,
          pendingKyc: pendingClinics + pendingDoctors
        },
        platformMetrics: {
          activeClinics,
          activeClinicAdmins: activeAdmins,
          activeDoctors,
          activeReceptionists,
          registeredPatients
        },
        appointmentMetrics: {
          bookedToday,
          confirmedToday: checkedInToday,
          completedToday,
          cancelledToday,
          noShowToday
        },
        businessMetrics: {
          platformRevenue: totalRevenue,
          commissionRevenue: commissionRevenue,
          monthlyRevenue: totalRevenue,
          monthlyGrowthRate: 14.2,
          repeatPatientRate: 28.5
        },
        supportMetrics: {
          openTickets: contactsCount,
          escalatedCases: Math.min(contactsCount, 2),
          reportedAccounts: 0
        },
        stats: [
          { title: 'Total Clinics', value: activeClinics.toLocaleString(), icon: 'Users', color: 'blue' },
          { title: 'Active Admins', value: activeAdmins.toLocaleString(), icon: 'ShieldCheck', color: 'indigo' },
          { title: 'Active Doctors', value: activeDoctors.toLocaleString(), icon: 'Stethoscope', color: 'green' },
          { title: 'Registered Patients', value: registeredPatients.toLocaleString(), icon: 'Users', color: 'orange' },
          { title: 'Platform Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: 'IndianRupee', color: 'emerald', isCurrency: true }
        ],
        appointmentChartData: chartData,
        branchPerformance,
        recentActivity: [
          { id: 1, text: 'New Clinic Admin Registered', time: '2 hours ago', type: 'registration' },
          { id: 2, text: 'Doctor Profile Approved', time: '4 hours ago', type: 'approval' },
          { id: 3, text: 'System backup completed', time: 'Yesterday', type: 'system' }
        ]
      };

    } else if (currentUser.role === UserRole.ADMIN) {
      // 2. Admin: Branch/Hospital Stats
      if (!branchObjId) throw new AppError('Branch context required for Admin', 400);

      const [
        todayAptsActive, todayAptsHistorical,
        totalAptsActive, totalAptsHistorical,
        completedAptsActive, completedAptsHistorical,
        cancelledAptsActive, cancelledAptsHistorical,
        noShowAptsActive, noShowAptsHistorical,
        activeDoctorsCount, activeReceptionistsCount,
        upcomingAptsActive, historicalApts,
        avgWaitAgg
      ] = await Promise.all([
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } }),

        Appointment.countDocuments({ branchId: branchObjId }),
        Patient.countDocuments({ branchId: branchObjId }),

        Appointment.countDocuments({ branchId: branchObjId, status: { $in: ['completed', 'follow_up'] } }),
        Patient.countDocuments({ branchId: branchObjId, status: { $in: ['completed', 'visited', 'follow_up'] } }),

        Appointment.countDocuments({ branchId: branchObjId, status: 'cancelled' }),
        Patient.countDocuments({ branchId: branchObjId, status: 'cancelled' }),

        Appointment.countDocuments({ branchId: branchObjId, status: 'patient_missed' }),
        Patient.countDocuments({ branchId: branchObjId, status: 'patient_missed' }),

        Doctor.countDocuments({ status: 'verified', branchId: branchObjId }),
        User.countDocuments({ role: UserRole.RECEPTIONIST, status: 'approved', branchId: branchObjId, isDeleted: { $ne: true } }),

        Appointment.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['booked', 'checked_in', 'waiting'] } })
          .populate('patient', 'name')
          .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
          .sort('date')
          .limit(10),

        Patient.find({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } })
          .sort('date')
          .limit(10),

        Appointment.aggregate([
          {
            $match: {
              branchId: branchObjId,
              date: { $gte: filterStart, $lte: filterEnd },
              consultationStartedAt: { $exists: true, $ne: null },
              waitingSince: { $exists: true, $ne: null }
            }
          },
          {
            $project: {
              waitingDuration: { $subtract: ["$consultationStartedAt", "$waitingSince"] }
            }
          },
          {
            $group: {
              _id: null,
              avgWait: { $avg: "$waitingDuration" }
            }
          }
        ])
      ]);

      const avgWaitingTimeMs = avgWaitAgg[0]?.avgWait || 0;
      const avgWaitingTimeMins = Math.round(avgWaitingTimeMs / (60 * 1000));

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
        hasClinics: true,
        stats: [
          { title: "Total Appointments", value: (totalAptsActive + totalAptsHistorical).toLocaleString(), icon: 'CalendarCheck', color: 'indigo' },
          { title: "Today's Appointments", value: (todayAptsActive + todayAptsHistorical).toLocaleString(), icon: 'CalendarCheck', color: 'blue' },
          { title: "Completed Visits", value: (completedAptsActive + completedAptsHistorical).toLocaleString(), icon: 'CheckCircle2', color: 'green' },
          { title: "Cancelled Appointments", value: (cancelledAptsActive + cancelledAptsHistorical).toLocaleString(), icon: 'XCircle', color: 'red' },
          { title: "Patient Missed", value: (noShowAptsActive + noShowAptsHistorical).toLocaleString(), icon: 'XCircle', color: 'orange' },
          { title: "Active Doctors", value: activeDoctorsCount.toLocaleString(), icon: 'Stethoscope', color: 'teal' },
          { title: "Active Receptionists", value: activeReceptionistsCount.toLocaleString(), icon: 'Users', color: 'cyan' },
          { title: "Average Waiting Time", value: `${avgWaitingTimeMins} Min`, icon: 'Clock', color: 'amber' }
        ],
        appointmentChartData: chartData,
        upcomingAppointments: mergedUpcomingApts
      };

    } else if (currentUser.role === UserRole.DOCTOR) {
      // 3. Doctor Dashboard
      const PatientModel = (await import('../models/Patient')).default;

      const [
        todayPatientsActive, todayPatientsHistorical,
        checkedInActive,
        inConsultationActive,
        completedActive, completedHistorical,
        cancelledActive,
        noShowActive,
        scheduleActive, historicalPatients
      ] = await Promise.all([
        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } }),
        PatientModel.countDocuments({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'checked_in' }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'in_consultation' }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['completed', 'visited'] } }),
        PatientModel.countDocuments({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: { $in: ['completed', 'visited', 'follow_up'] } }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'cancelled' }),

        Appointment.countDocuments({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd }, status: 'patient_missed' }),

        Appointment.find({ doctor: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } })
          .populate('patient', 'name phone')
          .sort('slot'),

        PatientModel.find({ doctorId: doctorProfileId, date: { $gte: filterStart, $lte: filterEnd } })
          .sort('timeSlot')
      ]);

      const totalPatients = todayPatientsActive + todayPatientsHistorical;
      const completed = completedActive + completedHistorical;

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
          { title: 'Total Patients Today', value: totalPatients.toLocaleString(), icon: 'Users', color: 'blue' },
          { title: 'Ready for Consultation (Checked-In)', value: checkedInActive.toLocaleString(), icon: 'UserCheck', color: 'cyan' },
          { title: 'Currently in Consultation', value: inConsultationActive.toLocaleString(), icon: 'Stethoscope', color: 'purple' },
          { title: 'Consultations Completed', value: completed.toLocaleString(), icon: 'CheckCircle2', color: 'green' },
          { title: 'Cancelled', value: cancelledActive.toLocaleString(), icon: 'XCircle', color: 'red' },
          { title: 'No Show', value: noShowActive.toLocaleString(), icon: 'AlertCircle', color: 'orange' }
        ],
        appointmentChartData: chartData,
        schedule: mergedSchedule
      };

    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      // 4. Receptionist Dashboard
      const [
        checkedInActive, checkedInHistorical,
        waitingActive, waitingHistorical,
        followUpActive, followUpHistorical,
        todayPatientsActive, todayPatientsHistorical,
        queueActive, queueHistorical
      ] = await Promise.all([
        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'checked_in' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'checked_in' }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'waiting' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'waiting' }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'follow_up' }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd }, status: 'follow_up' }),

        Appointment.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } }),
        Patient.countDocuments({ branchId: branchObjId, date: { $gte: filterStart, $lte: filterEnd } }),

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
          { title: 'Checked-In Patients', value: (checkedInActive + checkedInHistorical).toLocaleString(), icon: 'CheckCircle2', color: 'cyan' },
          { title: 'Waiting Queue', value: (waitingActive + waitingHistorical).toLocaleString(), icon: 'Clock', color: 'amber' },
          { title: 'Follow-Up Visits', value: (followUpActive + followUpHistorical).toLocaleString(), icon: 'CalendarCheck', color: 'purple' },
          { title: 'Today\'s Total Bookings', value: (todayPatientsActive + todayPatientsHistorical).toLocaleString(), icon: 'Users', color: 'blue' }
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
    await checkAndAutoUpdateMissedAppointments();
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const lastViewed = user.lastViewedNotifications || {
      adminRequests: new Date(0),
      clinicVerification: new Date(0),
      doctorVerification: new Date(0),
      kycVerification: new Date(0),
      patients: new Date(0),
      appointments: new Date(0)
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

    // 4. KYC Verification (Combined pending clinics and submitted doctors document reviews)
    const [kycPendingClinics, kycNewClinics] = await Promise.all([
      Clinic.countDocuments({ clinicStatus: 'pending' }),
      Clinic.countDocuments({ 
        clinicStatus: 'pending', 
        createdAt: { $gt: (lastViewed as any).kycVerification || new Date(0) } 
      })
    ]);
    const [kycPendingDoctors, kycNewDoctors] = await Promise.all([
      Doctor.countDocuments({ status: 'submitted' }),
      Doctor.countDocuments({ 
        status: 'submitted', 
        createdAt: { $gt: (lastViewed as any).kycVerification || new Date(0) } 
      })
    ]);
    const kycPending = kycPendingClinics + kycPendingDoctors;
    const kycNew = kycNewClinics + kycNewDoctors;

    // 5. Patients (Patient History / new patients recorded)
    let branchObjId: mongoose.Types.ObjectId | null = null;
    const branchId = (req as any).branchId || user.branchId;
    if (branchId) {
      branchObjId = new mongoose.Types.ObjectId(branchId);
    }
    if (user.role === UserRole.ADMIN && !branchObjId) {
      const clinics = await Clinic.find({ owner: user.id, isDeleted: false });
      if (clinics.length > 0) {
        branchObjId = clinics[0]!._id as mongoose.Types.ObjectId;
      }
    }

    let doctorProfileId: mongoose.Types.ObjectId | null = null;
    if (user.role === UserRole.DOCTOR) {
      const doctorProfile = await Doctor.findOne({ user: user.id });
      if (doctorProfile) {
        doctorProfileId = doctorProfile._id as mongoose.Types.ObjectId;
      }
    }

    const patientFilter: any = {};
    if (user.role === UserRole.DOCTOR && doctorProfileId) {
      patientFilter.doctorId = doctorProfileId;
    } else if (branchObjId) {
      patientFilter.branchId = branchObjId;
    }

    const [patientsTotal, patientsNew] = await Promise.all([
      Patient.countDocuments(patientFilter),
      Patient.countDocuments({
        ...patientFilter,
        createdAt: { $gt: (lastViewed as any).patients || new Date(0) }
      })
    ]);

    // 6. Appointments (new appointments booked)
    const appointmentFilter: any = {};
    if (user.role === UserRole.DOCTOR && doctorProfileId) {
      appointmentFilter.doctor = doctorProfileId;
    } else if (branchObjId) {
      appointmentFilter.branchId = branchObjId;
    }

    const [appointmentsTotal, appointmentsNew] = await Promise.all([
      Appointment.countDocuments(appointmentFilter),
      Appointment.countDocuments({
        ...appointmentFilter,
        createdAt: { $gt: (lastViewed as any).appointments || new Date(0) }
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        adminRequests: { total: adminPending, new: adminNew },
        clinicVerification: { total: clinicPending, new: clinicNew },
        doctorVerification: { total: doctorPending, new: doctorNew },
        kycVerification: { total: kycPending, new: kycNew },
        patients: { total: patientsTotal, new: patientsNew },
        appointments: { total: appointmentsTotal, new: appointmentsNew }
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

    if (!['adminRequests', 'clinicVerification', 'doctorVerification', 'kycVerification', 'patients', 'appointments'].includes(category)) {
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
