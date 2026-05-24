"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, User, Hospital, Lock } from "lucide-react";

type Appointment = {
  _id: string;
  status: string;
  date: string;
  slot: string;
  reason: string;
  fullName: string;
  dob: string;
  doctor?: {
    _id: string;
    specialty: string;
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

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/my`, {
        credentials: "include"
      });
      const data = await res.json();

      if (data.status === "success") {
        // Sort appointments by date descending
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
      <div className="bg-slate-50/50 min-h-screen pt-36 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-12 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
            {/* Subtle card grid background */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: '45px 45px'
            }} />
            
            <div className="w-20 h-20 bg-[#00B5B5]/10 text-[#00B5B5] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Lock size={36} />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Access Restricted</h1>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm font-semibold leading-relaxed">
              Please sign in to access your appointment bookings panel, view consultation documents, or manage schedules.
            </p>
            
            <Link href="/login?redirect=/bookings" className="w-full inline-flex items-center justify-center gap-3 bg-[#00B5B5] text-white py-4 px-8 rounded-2xl font-black text-base shadow-xl shadow-[#00B5B5]/20 hover:bg-[#009A9A] hover:scale-[1.02] active:scale-[0.98] transition-all">
              Sign In to Continue
              <CheckCircle2 size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const renderAppointmentCard = (apt: Appointment, isUpcoming: boolean) => {
    const isCancelled = apt.status === 'cancelled';
    const isCompleted = apt.status === 'completed' || apt.status === 'visited';
    const isVisited = apt.status === 'visited';
    const appointmentDate = new Date(apt.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    const calculateAge = (dobString: string) => {
      const birthDate = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return (
      <div 
        key={apt._id} 
        className={`bg-white rounded-[2.5rem] border transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden p-6 md:p-8 mb-6 ${
          isCancelled 
            ? 'border-red-100 bg-red-50/5 opacity-85' 
            : isCompleted 
              ? 'border-emerald-100 bg-emerald-50/5' 
              : 'border-slate-100 hover:border-[#00B5B5]/20'
        }`}
      >
        {/* Top Status Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isCancelled 
                ? 'bg-red-50 text-red-500' 
                : isCompleted 
                  ? 'bg-emerald-50 text-emerald-500' 
                  : 'bg-[#00B5B5]/10 text-[#00B5B5]'
            }`}>
              <Calendar size={22} />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-lg leading-tight mb-1">{appointmentDate}</p>
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Clock size={13} className="text-[#00B5B5]" /> 
                <span className="text-slate-500">{apt.slot}</span>
              </p>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
              isCancelled 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : isVisited 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : isCompleted 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-teal-50 text-teal-600 border border-teal-100'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isCancelled ? 'bg-red-500' : isCompleted ? 'bg-emerald-500' : 'bg-teal-500'
              }`} />
              {apt.status}
            </span>
          </div>
        </div>

        {/* Patient Passport / Identity Card */}
        <div className="mb-6 p-5 bg-slate-50/50 rounded-3xl border border-slate-100/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Patient Name</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
                  <User size={12} />
                </div>
                <p className="text-sm font-extrabold text-slate-800">{apt.fullName}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age & DOB</p>
              <p className="text-sm font-extrabold text-slate-800">{calculateAge(apt.dob)} Years <span className="text-xs text-slate-400 font-bold">({new Date(apt.dob).toLocaleDateString()})</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reason for Visit</p>
              <p className="text-sm font-bold text-slate-600 leading-normal">{apt.reason}</p>
            </div>
          </div>
        </div>

        {/* Doctor & Clinic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {apt.doctor && (
            <div className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor Assigned</p>
                <p className="font-extrabold text-slate-900 text-sm">Dr. {apt.doctor.user?.name}</p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{apt.doctor.specialty}</p>
              </div>
            </div>
          )}
          
          {apt.clinic && (
            <div className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#00B5B5]/10 text-[#00B5B5] flex items-center justify-center shrink-0">
                <Hospital size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinic Location</p>
                <p className="font-extrabold text-slate-900 text-sm">{apt.clinic.name}</p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={11} className="text-[#00B5B5]" />
                  {apt.clinic.district}, {apt.clinic.state}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        {isUpcoming && !isCancelled && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => handleCancel(apt._id)}
              disabled={cancelLoading === apt._id}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50 text-sm"
            >
              {cancelLoading === apt._id ? (
                <><Loader2 size={15} className="animate-spin" /> Cancelling...</>
              ) : (
                <><AlertCircle size={15} /> Cancel Appointment</>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pt-36 pb-20 relative">
      {/* Decorative Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 max-w-4xl relative z-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Bookings</h1>
            <p className="text-slate-500 font-medium">Manage your upcoming visits and view your consultation history.</p>
          </div>
          <Link href="/specialties" className="bg-[#00B5B5] text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-[#00B5B5]/25 hover:bg-[#009A9A] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Book Appointment
          </Link>
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
            {/* Stats Row */}
            {appointments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Upcoming Visits</p>
                    <h4 className="text-2xl font-black text-slate-900">{upcomingAppointments.length}</h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Completed</p>
                    <h4 className="text-2xl font-black text-slate-900">
                      {appointments.filter(a => a.status === 'completed' || a.status === 'visited').length}
                    </h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cancelled</p>
                    <h4 className="text-2xl font-black text-slate-900">
                      {appointments.filter(a => a.status === 'cancelled').length}
                    </h4>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Appointments */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2.5 h-6 bg-[#00B5B5] rounded-full"></div>
                Upcoming Appointments
              </h2>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(apt => renderAppointmentCard(apt, true))
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No Upcoming Appointments</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm font-medium">You don&apos;t have any scheduled appointments right now. Ready to consult with an expert?</p>
                  <Link href="/specialties" className="inline-flex items-center gap-2 bg-[#00B5B5] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[#00B5B5]/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm">
                    Book an Appointment
                  </Link>
                </div>
              )}
            </section>

            {/* Past Appointments */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-2.5 h-6 bg-slate-300 rounded-full"></div>
                Past Appointments
              </h2>
              {pastAppointments.length > 0 ? (
                pastAppointments.map(apt => renderAppointmentCard(apt, false))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 font-semibold shadow-sm">
                  No previous appointment history found.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
