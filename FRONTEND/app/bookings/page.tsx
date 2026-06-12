"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  User,
  Hospital,
  Lock,
  Search,
  BookOpen,
  HelpCircle,
  X,
  Stethoscope
} from "lucide-react";

// Import global UI components
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";

type Appointment = {
  _id: string;
  status: string;
  date: string;
  slot: string;
  reason: string;
  fullName: string;
  dob: string;
  createdAt?: string;
  doctor?: {
    _id: string;
    specialty: string;
    consultationFee?: number;
    avatarUrl?: string;
    user: {
      name: string;
    };
  };
  clinic?: {
    _id: string;
    name: string;
    addressLine1: string;
    district: string;
    state: string;
  };
};

export default function MyAppointmentsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState<string | null>(null);

  const calculateAge = (dobString: string) => {
    if (!dobString) return "N/A";
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/my`, {
        credentials: "include"
      });
      const data = await res.json();

      if (data.status === "success") {
        const sorted = data.data.appointments.sort((a: Appointment, b: Appointment) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAppointments(sorted);
      } else {
        throw new Error(data.message || "Failed to load appointments");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchAppointments();
    }
  }, [authLoading, isAuthenticated]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      setCancelLoading(id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status: "cancelled" })
      });
      const data = await res.json();

      if (data.status === "success") {
        setAppointments(prev => prev.map(apt =>
          apt._id === id ? { ...apt, status: "cancelled" } : apt
        ));
        if (selectedAppointment?._id === id) {
          setSelectedAppointment(prev => prev ? { ...prev, status: "cancelled" } : null);
        }
      } else {
        alert(data.message || "Failed to cancel appointment");
      }
    } catch {
      alert("Failed to cancel appointment");
    } finally {
      setCancelLoading(null);
    }
  };

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-slate-50/30">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#00B5B5] animate-spin" />
          <Loader2 className="w-6 h-6 text-[#00B5B5] animate-pulse absolute" />
        </div>
        <p className="text-slate-500 font-extrabold text-sm tracking-wide animate-pulse uppercase">Assembling your bookings...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Section className="bg-slate-50/50 min-h-screen flex items-center justify-center">
        <Container className="max-w-xl">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-12 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: '45px 45px'
            }} />

            <div className="w-20 h-20 bg-[#00B5B5]/10 text-[#00B5B5] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Lock size={36} />
            </div>

            <h1 className="font-h1 text-slate-900 mb-3">Access Restricted</h1>
            <p className="font-body-secondary text-slate-500 mb-8 max-w-sm mx-auto">
              Please sign in to access your appointment bookings panel, view consultation documents, or manage schedules.
            </p>

            <Link href="/login?redirect=/bookings" className="btn-primary-custom w-full">
              Sign In to Continue
              <CheckCircle2 size={18} className="ml-2" />
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group appointments
  const upcomingAppointments = appointments.filter(apt =>
    new Date(apt.date) >= today &&
    apt.status !== 'cancelled' &&
    apt.status !== 'completed' &&
    apt.status !== 'visited'
  );

  const pastAppointments = appointments.filter(apt =>
    new Date(apt.date) < today ||
    apt.status === 'cancelled' ||
    apt.status === 'completed' ||
    apt.status === 'visited'
  );

  const upcomingCount = upcomingAppointments.length;
  const completedCount = appointments.filter(a => a.status === 'completed' || a.status === 'visited').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const uniqueClinics = new Set(appointments.map(a => a.clinic?._id || a.clinic?.name).filter(Boolean));
  const uniqueDoctors = new Set(appointments.map(a => a.doctor?._id || a.doctor?.user?.name).filter(Boolean));
  const uniqueSpecialties = new Set(appointments.map(a => a.doctor?.specialty).filter(Boolean));

  const renderStatusBadge = (status: string) => {
    const formatted = status.toLowerCase();
    if (formatted === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Confirmed
        </span>
      );
    } else if (formatted === 'completed' || formatted === 'visited') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Completed
        </span>
      );
    } else if (formatted === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Cancelled
        </span>
      );
    } else if (formatted === 'rescheduled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Rescheduled
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Pending Approval
        </span>
      );
    }
  };

  const handleOpenDetails = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowModal(true);
  };

  return (
    <Section className="bg-slate-50/50 min-h-screen relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} />

      <Container className="max-w-5xl relative z-10">

        {/* SECTION 1: PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-h1 text-slate-900 mb-2">My Appointments</h1>
            <p className="font-body-secondary text-slate-500">View upcoming appointments, manage bookings, and access your consultation history.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/specialties" className="btn-primary-custom w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Find Doctors
            </Link>
            <Link href="/specialties" className="btn-secondary-custom w-full sm:w-auto">
              Browse Specialties
            </Link>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-[2.5rem] border border-red-100 text-center font-bold">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="text-lg mb-4">{error}</p>
            <button onClick={fetchAppointments} className="px-6 py-2.5 bg-red-100 hover:bg-red-200 rounded-xl transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-12">

            {/* SECTION 2: APPOINTMENT SUMMARY - metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">📅 Upcoming</p>
                <h4 className="text-2xl font-black text-slate-900">{upcomingCount}</h4>
              </div>
              <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">✅ Completed</p>
                <h4 className="text-2xl font-black text-slate-900">{completedCount}</h4>
              </div>
              <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">❌ Cancelled</p>
                <h4 className="text-2xl font-black text-slate-900">{cancelledCount}</h4>
              </div>
              <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">🏥 Clinics Visited</p>
                <h4 className="text-2xl font-black text-slate-900">{uniqueClinics.size}</h4>
              </div>
              <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">👨‍⚕️ Doctors Consulted</p>
                <h4 className="text-2xl font-black text-slate-900">{uniqueDoctors.size}</h4>
              </div>
            </div>

            {/* SECTION 3: UPCOMING APPOINTMENTS */}
            <section>
              <h2 className="font-h2 text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2.5 h-6 bg-[#00B5B5] rounded-full"></div>
                Upcoming Appointments
              </h2>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-6">
                  {upcomingAppointments.map((apt) => {
                    const docAvatar = apt.doctor?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&h=150&auto=format&fit=crop";
                    const appointmentDate = new Date(apt.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    });

                    return (
                      <Card key={apt._id} className="hover:border-[#00B5B5]/25">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex items-start gap-5">
                            {/* Doctor Photo */}
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                              <img src={docAvatar} alt={apt.doctor?.user?.name || "Doctor"} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              {/* Card title must use H3 */}
                              <h3 className="font-h3 text-slate-900">Dr. {apt.doctor?.user?.name || "Healthcare Professional"}</h3>
                              <p className="text-xs font-bold text-[#00B5B5]">{apt.doctor?.specialty || "Specialist"}</p>
                              <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pt-1">
                                <Hospital className="w-3.5 h-3.5" />
                                <span>{apt.clinic?.name || "BookMyDoctor Clinic"}</span>
                              </p>
                              <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pt-1">
                                <User className="w-3.5 h-3.5 text-slate-450" />
                                <span>Patient: {apt.fullName}</span>
                              </p>
                            </div>
                          </div>

                          <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-4 md:gap-2 shrink-0 justify-between flex flex-row md:flex-col items-center md:items-start w-full md:w-auto text-metadata">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                              <p className="text-sm font-extrabold text-slate-800">{appointmentDate}</p>
                              <p className="text-xs font-semibold text-slate-400 mt-0.5">{apt.slot}</p>
                            </div>
                            <div className="text-right md:text-left">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                              <p className="text-sm font-black text-slate-905">₹{apt.doctor?.consultationFee || 500}</p>
                            </div>
                          </div>
                        </div>

                        {apt.clinic && (
                          <div className="mt-1 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs font-bold text-slate-500">
                            <MapPin size={14} className="text-[#00B5B5]" />
                            <span>{apt.clinic.addressLine1}, {apt.clinic.district}, {apt.clinic.state}</span>
                          </div>
                        )}

                        <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div>
                            {renderStatusBadge(apt.status)}
                          </div>
                          <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                              onClick={() => handleOpenDetails(apt)}
                              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setRescheduleMessage(`To reschedule your appointment with Dr. ${apt.doctor?.user?.name || ''}, please contact ${apt.clinic?.name || 'the clinic'} support at partners@bookmydoctor.in or call support.`);
                              }}
                              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancel(apt._id)}
                              disabled={cancelLoading === apt._id}
                              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border-2 border-red-50 text-red-650 font-bold hover:bg-red-50 hover:border-red-100 transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
                            >
                              {cancelLoading === apt._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : "Cancel"}
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* EMPTY STATE */
                <Card className="p-12 text-center max-w-2xl mx-auto items-center">
                  <div className="w-20 h-20 bg-slate-50 text-slate-350 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar size={36} />
                  </div>
                  <h3 className="font-h3 text-slate-900 mb-2">No Upcoming Appointments</h3>
                  <p className="font-body-secondary text-slate-500 mb-8 max-w-md mx-auto">
                    You currently have no scheduled appointments. Find trusted doctors near you and book an appointment in minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                    <Link href="/specialties" className="btn-primary-custom w-full sm:w-auto">
                      Find Doctors
                    </Link>
                    <Link href="/specialties" className="btn-secondary-custom w-full sm:w-auto">
                      Browse Specialties
                    </Link>
                  </div>
                </Card>
              )}
            </section>

            {/* SECTION 5: APPOINTMENT HISTORY */}
            <section>
              <h2 className="font-h2 text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2.5 h-6 bg-slate-300 rounded-full"></div>
                Appointment History
              </h2>

              {pastAppointments.length > 0 ? (
                <div className="space-y-6">
                  {pastAppointments.map((apt) => {
                    const appointmentDate = new Date(apt.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    });

                    return (
                      <Card key={apt._id}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1">
                            <h3 className="font-h3 text-slate-900">Dr. {apt.doctor?.user?.name || "Doctor"}</h3>
                            <p className="text-xs font-bold text-slate-400">{apt.doctor?.specialty || "Specialist"} — {apt.clinic?.name || "Clinic"}</p>
                            <p className="text-xs font-semibold text-slate-450 flex items-center gap-1 pt-1">
                              <Calendar size={12} className="text-[#00B5B5]" />
                              <span>{appointmentDate} at {apt.slot}</span>
                            </p>
                            <p className="text-xs font-semibold text-slate-550 flex items-center gap-1 pt-1">
                              <User size={12} className="text-[#00B5B5]" />
                              <span>Patient: {apt.fullName}</span>
                            </p>
                          </div>

                          <div className="flex sm:flex-col justify-between sm:items-end w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee paid</p>
                              <p className="text-sm font-black text-slate-800">₹{apt.doctor?.consultationFee || 500}</p>
                            </div>
                            <div className="mt-1.5">
                              {renderStatusBadge(apt.status)}
                            </div>
                          </div>
                        </div>

                        {/* HISTORY CARD ACTIONS */}
                        <div className="mt-2 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <button
                            onClick={() => handleOpenDetails(apt)}
                            className="text-xs font-bold text-[#00B5B5] hover:underline"
                          >
                            View Details
                          </button>
                          <div className="flex items-center gap-3">
                            {apt.doctor && (
                              <Link
                                href={`/doctors/${apt.doctor._id}`}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 px-3.5 py-2 rounded-xl bg-slate-50"
                              >
                                Doctor Profile
                              </Link>
                            )}
                            <Link
                              href="/specialties"
                              className="text-xs font-bold text-white bg-[#00B5B5] px-4 py-2 rounded-xl shadow-md hover:bg-[#009A9A]"
                            >
                              Book Again
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* EMPTY HISTORY STATE */
                <Card className="p-12 text-center max-w-xl mx-auto items-center">
                  <h3 className="font-h3 text-slate-900 mb-2">No Appointment History</h3>
                  <p className="font-body-secondary text-slate-500 mb-6 max-w-sm">
                    Your completed appointments will appear here after your visits.
                  </p>
                  <Link href="/specialties" className="btn-primary-custom">
                    Find Doctors
                  </Link>
                </Card>
              )}
            </section>

            {/* SECTION 6: QUICK ACTIONS */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="font-h2 text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/specialties" className="p-5 rounded-2xl border border-slate-100 hover:border-[#00B5B5]/30 hover:bg-slate-50/50 transition-all flex flex-col justify-between h-32 group">
                  <Search size={22} className="text-[#00B5B5]" />
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-[#00B5B5]">Find Doctors</span>
                </Link>
                <Link href="/specialties" className="p-5 rounded-2xl border border-slate-100 hover:border-[#00B5B5]/30 hover:bg-slate-50/50 transition-all flex flex-col justify-between h-32 group">
                  <BookOpen size={22} className="text-[#00B5B5]" />
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-[#00B5B5]">Browse Specialties</span>
                </Link>
                <Link href="/specialties" className="p-5 rounded-2xl border border-slate-100 hover:border-[#00B5B5]/30 hover:bg-slate-50/50 transition-all flex flex-col justify-between h-32 group">
                  <Calendar size={22} className="text-[#00B5B5]" />
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-[#00B5B5]">Book New Appointment</span>
                </Link>
                <Link href="/contact" className="p-5 rounded-2xl border border-slate-100 hover:border-[#00B5B5]/30 hover:bg-slate-50/50 transition-all flex flex-col justify-between h-32 group">
                  <HelpCircle size={22} className="text-[#00B5B5]" />
                  <span className="font-extrabold text-sm text-slate-800 group-hover:text-[#00B5B5]">Contact Support</span>
                </Link>
              </div>
            </section>

            {/* SECTION 7: PATIENT INSIGHTS */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-h2 text-slate-900 m-0">Your Healthcare Activity</h2>
                <span className="text-xs font-black text-[#00B5B5] bg-[#00B5B5]/10 px-3.5 py-1 rounded-full uppercase tracking-wider">This Year</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-metadata">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointments Completed</p>
                  <p className="text-xl font-black text-slate-900">{completedCount} Appointments</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctors Consulted</p>
                  <p className="text-xl font-black text-slate-900">{uniqueDoctors.size} Doctors</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialties Visited</p>
                  <p className="text-xl font-black text-slate-900">{uniqueSpecialties.size} Specialties</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinics Visited</p>
                  <p className="text-xl font-black text-slate-900">{uniqueClinics.size} Clinics</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* FOOTER CTA */}
        <div className="mt-20 bg-gradient-to-br from-[#00B5B5] to-[#008A8A] rounded-[2.5rem] p-10 md:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-[#00B5B5]/25">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-h2 text-white mb-4">Need Another Appointment?</h2>
            <p className="text-white/80 font-body-primary mb-8 mx-auto">
              Explore verified doctors and clinics near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/specialties" className="btn-primary-custom !bg-white !text-slate-900 w-full sm:w-auto">
                Find Doctors
              </Link>
              <Link href="/specialties" className="btn-secondary-custom !border-white/30 hover:!border-white !text-white !bg-transparent w-full sm:w-auto">
                Browse Specialties
              </Link>
            </div>
          </div>
        </div>

      </Container>

      {/* DETAIL DRAWER / MODAL */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModal(false);
                setRescheduleMessage(null);
              }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-h3 text-slate-900 mb-6 flex items-center gap-2">
              <Stethoscope className="text-[#00B5B5]" /> Appointment Details
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment ID</p>
                  <p className="text-xs font-extrabold text-slate-800 font-mono mt-0.5">{selectedAppointment._id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <div className="mt-1">{renderStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedAppointment.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Age & DOB</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {calculateAge(selectedAppointment.dob)} Years ({new Date(selectedAppointment.dob).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })})
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor Name</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">Dr. {selectedAppointment.doctor?.user?.name || "Doctor"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialization</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedAppointment.doctor?.specialty || "Specialist"}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic Name</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">{selectedAppointment.clinic?.name || "BookMyDoctor Clinic"}</p>
              </div>

              {selectedAppointment.clinic && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic Address</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {selectedAppointment.clinic.addressLine1}, {selectedAppointment.clinic.district}, {selectedAppointment.clinic.state}
                  </p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment Date</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {new Date(selectedAppointment.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment Time</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">{selectedAppointment.slot}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking Date</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {selectedAppointment.createdAt ? new Date(selectedAppointment.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : "Recent"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">₹{selectedAppointment.doctor?.consultationFee || 500}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Notes</p>
                <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100/50">
                  {selectedAppointment.reason || "No notes provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Assistance Dialog */}
      {rescheduleMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 border border-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setRescheduleMessage(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
            <h4 className="font-h3 text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="text-[#00B5B5]" /> Reschedule Appointment
            </h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
              {rescheduleMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setRescheduleMessage(null)}
                className="btn-primary-custom !h-10 !text-xs"
              >
                Okay, Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </Section>
  );
}
