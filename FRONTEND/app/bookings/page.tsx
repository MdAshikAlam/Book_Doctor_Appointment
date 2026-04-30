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
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Please log in to view your appointments");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/my`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.status === "success") {
        // Sort appointments by date descending
        const sorted = data.data.appointments.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAppointments(sorted);
      } else {
        throw new Error(data.message || "Failed to load appointments");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load appointments");
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
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
    } catch (err: any) {
      alert("Failed to cancel appointment");
    } finally {
      setCancelLoading(null);
    }
  };

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Loading appointments...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 animate-bounce-subtle">
          <Lock size={40} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Login Required</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg font-medium leading-relaxed">
          You need to be logged in to view and manage your appointments. Please sign in to access your dashboard.
        </p>
        <Link href="/login?redirect=/bookings" className="group relative inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
          Sign In to Access
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <CheckCircle2 size={18} />
          </div>
        </Link>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
  );
  
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < today || apt.status === 'cancelled' || apt.status === 'completed'
  );

  const renderAppointmentCard = (apt: Appointment, isUpcoming: boolean) => {
    const isCancelled = apt.status === 'cancelled';
    const isCompleted = apt.status === 'completed';
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
      <div key={apt._id} className={`bg-white rounded-2xl border ${isCancelled ? 'border-red-100 opacity-75' : isCompleted ? 'border-emerald-100 opacity-80' : 'border-gray-100'} shadow-sm p-6 mb-4 transition-all hover:shadow-md`}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-50 pb-4 mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCancelled ? 'bg-red-50 text-red-500' : isCompleted ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
              <Calendar size={24} />
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg">{appointmentDate}</p>
              <p className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <Clock size={14} /> {apt.slot}
              </p>
            </div>
          </div>
          <div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
              isCancelled ? 'bg-red-50 text-red-600' : 
              isCompleted ? 'bg-emerald-50 text-emerald-600' : 
              'bg-blue-50 text-blue-600'
            }`}>
              {apt.status}
            </span>
          </div>
        </div>

        {/* Patient Details Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Name</p>
            <p className="text-sm font-black text-gray-900">{apt.fullName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Age</p>
            <p className="text-sm font-black text-gray-900">{calculateAge(apt.dob)} Years</p>
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</p>
            <p className="text-sm font-bold text-gray-600">{apt.reason}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apt.doctor && (
            <div className="flex items-start gap-3">
              <div className="mt-1 text-gray-400"><User size={16} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Doctor</p>
                <p className="font-bold text-gray-900">Dr. {apt.doctor.user?.name}</p>
                <p className="text-sm text-gray-500">{apt.doctor.specialty}</p>
              </div>
            </div>
          )}
          
          {apt.clinic && (
            <div className="flex items-start gap-3">
              <div className="mt-1 text-gray-400"><Hospital size={16} /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Clinic</p>
                <p className="font-bold text-gray-900">{apt.clinic.name}</p>
                <p className="text-sm text-gray-500">{apt.clinic.district}, {apt.clinic.state}</p>
              </div>
            </div>
          )}
        </div>

        {isUpcoming && !isCancelled && (
          <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
            <button 
              onClick={() => handleCancel(apt._id)}
              disabled={cancelLoading === apt._id}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
            >
              {cancelLoading === apt._id ? (
                <><Loader2 size={16} className="animate-spin" /> Cancelling...</>
              ) : (
                <><AlertCircle size={16} /> Cancel Appointment</>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#fafbfc] min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-500 font-medium">Manage your upcoming visits and view your consultation history.</p>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center font-bold">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
            <button onClick={fetchAppointments} className="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 rounded-xl transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                Upcoming Appointments
              </h2>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(apt => renderAppointmentCard(apt, true))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Upcoming Appointments</h3>
                  <p className="text-gray-500 mb-6">You don't have any scheduled appointments right now.</p>
                  <Link href="/specialties" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all">
                    Book an Appointment
                  </Link>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-6 bg-gray-300 rounded-full"></div>
                Past Appointments
              </h2>
              {pastAppointments.length > 0 ? (
                pastAppointments.map(apt => renderAppointmentCard(apt, false))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                  <p className="text-gray-500 font-medium">No previous appointment history found.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
