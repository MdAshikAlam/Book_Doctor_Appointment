"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stethoscope, User, LogIn, X, MapPin, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Import global UI components
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";

interface DoctorAvailability {
  day: string;
  slots: string[];
}

interface DoctorLeave {
  startDate: string;
  endDate: string;
}

interface DoctorInfo {
  _id: string;
  specialty?: string;
  address?: string;
  district?: string;
  state?: string;
  slug?: string;
  user?: {
    name: string;
  };
  leaves?: DoctorLeave[];
  availability?: DoctorAvailability[];
}

function AppointmentsForm() {
  const searchParams = useSearchParams();
  const { isAuthenticated, login } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState({
    department: "Pediatrics",
    city: "",
    country: "",
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    fullName: "",
    email: "",
    phone: "",
    aadhaar: "",
    dob: "",
    gender: "",
    address: "",
    visitedBefore: false,
    message: "",
  });

  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  
  useEffect(() => {
    const doctorId = searchParams.get("doctorId");
    if (doctorId) {
      // Fetch doctor details
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/doctors/${doctorId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const doc = data.data.doctor;
            setDoctorInfo(doc);
            
            let detectedCity = doc.district;
            let detectedCountry = doc.state;
            
            if (!detectedCity && doc.address) {
              const parts = doc.address.split(',').map((p: string) => p.trim());
              if (parts.length >= 2) {
                detectedCity = parts[parts.length - 2];
                detectedCountry = parts[parts.length - 1];
              } else {
                detectedCity = doc.address;
              }
            }

            const queryDate = searchParams.get("date") || "";
            const querySlot = searchParams.get("slot") || "";

            setFormData(prev => ({ 
              ...prev, 
              doctor: doc._id,
              department: doc.specialty || prev.department,
              city: detectedCity || prev.city,
              country: detectedCountry || prev.country,
              address: doc.address || prev.address,
              appointmentDate: queryDate || prev.appointmentDate,
              appointmentTime: querySlot || prev.appointmentTime
            }));

            // Auto-update URL to use slug
            if (doc.slug && doctorId !== doc.slug) {
              const url = new URL(window.location.href);
              url.searchParams.set("doctorId", doc.slug);
              if (queryDate) url.searchParams.set("date", queryDate);
              if (querySlot) url.searchParams.set("slot", querySlot);
              window.history.replaceState(null, '', url.toString());
            }
          }
        })
        .catch(err => console.error("Error fetching doctor:", err));
    }
  }, [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          date: formData.appointmentDate,
          slot: formData.appointmentTime,
          reason: formData.message ? `Appointment for ${formData.department}. Message: ${formData.message}` : `Appointment for ${formData.department}`
        }),
      });

      if (response.ok) {
        setStatus({ type: "success", message: "Appointment booked successfully!" });
        setFormData({
          department: "Pediatrics",
          city: "",
          country: "",
          doctor: "",
          appointmentDate: "",
          appointmentTime: "",
          fullName: "",
          email: "",
          phone: "",
          aadhaar: "",
          dob: "",
          gender: "",
          address: "",
          visitedBefore: false,
          message: "",
        });
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          setStatus({ type: "error", message: "Your token has expired. Please log in again to continue." });
          setShowAuthModal(true);
          return;
        }
        setStatus({ type: "error", message: errorData.message || "Failed to book appointment. Please try again." });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus({ type: "error", message: "An error occurred. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.department &&
    formData.city &&
    formData.country &&
    formData.doctor &&
    formData.appointmentDate &&
    formData.appointmentTime &&
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.aadhaar &&
    formData.dob &&
    formData.gender &&
    formData.address;

  return (
    <Section className="bg-slate-50/50 min-h-screen">
      <Container className="max-w-4xl">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-8 md:p-12">
          <header className="mb-10 text-center">
            <h1 className="font-h1 text-slate-900 mb-4">Book Appointment</h1>
            <p className="font-body-primary text-slate-500 mx-auto">Fill in the details below to schedule your consultation with our specialists.</p>
          </header>

          {status.type && (
            <div className={`mb-8 p-4 rounded-2xl text-center text-sm font-semibold ${status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Doctor & Clinic Details */}
            <div className="space-y-6">
              <h2 className="font-h2 text-slate-900 flex items-center gap-3 pb-3 border-b border-slate-100">
                <Stethoscope size={24} className="text-[#00B5B5]" /> Doctor & Clinic Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="department" className="text-xs font-black text-slate-400 uppercase tracking-widest">Department <span className="text-rose-500">*</span></label>
                  <input id="department" name="department" value={formData.department} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="city" className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinic City <span className="text-rose-500">*</span></label>
                  <input id="city" name="city" value={formData.city} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="country" className="text-xs font-black text-slate-400 uppercase tracking-widest">Country <span className="text-rose-500">*</span></label>
                  <input id="country" name="country" value={formData.country} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" />
                </div>
              </div>

              {doctorInfo?.address && (
                <div className="p-4 bg-[#F0FDFD] rounded-2xl border border-[#00B5B5]/15 flex items-center gap-3">
                  <MapPin size={20} className="text-[#00B5B5] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-[#00B5B5] uppercase tracking-wider">Clinic Address</p>
                    <p className="text-xs font-bold text-slate-700">{doctorInfo.address}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="doctor" className="text-xs font-black text-slate-400 uppercase tracking-widest">Doctor <span className="text-rose-500">*</span></label>
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold text-slate-400 cursor-not-allowed">
                    {doctorInfo ? `Dr. ${doctorInfo.user?.name}` : (formData.doctor || "Select Doctor")}
                  </div>
                  <input type="hidden" name="doctor" value={formData.doctor} />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="appointmentDate" className="text-xs font-black text-slate-400 uppercase tracking-widest">Appointment Date <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    id="appointmentDate" 
                    name="appointmentDate" 
                    value={formData.appointmentDate} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" 
                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="appointmentTime" className="text-xs font-black text-slate-400 uppercase tracking-widest">Appointment Time <span className="text-rose-500">*</span></label>
                  {(() => {
                    if (!formData.appointmentDate || !doctorInfo) {
                      return <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-400">Please select date first</div>;
                    }

                    const selectedDate = new Date(formData.appointmentDate);
                    selectedDate.setHours(0, 0, 0, 0);

                    // Check if doctor is on leave
                    const isLeave = doctorInfo.leaves?.some((leave: DoctorLeave) => {
                      const start = new Date(leave.startDate);
                      start.setHours(0, 0, 0, 0);
                      const end = new Date(leave.endDate);
                      end.setHours(23, 59, 59, 999);
                      return selectedDate >= start && selectedDate <= end;
                    });

                    if (isLeave) {
                      return <div className="w-full bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl p-4 text-sm font-bold">Doctor on leave</div>;
                    }

                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const dayName = days[selectedDate.getDay()];
                    
                    const dayAvailability = doctorInfo.availability?.find((a: DoctorAvailability) => a.day === dayName);
                    const availableSlots = dayAvailability?.slots || [];

                    if (availableSlots.length === 0) {
                      return <div className="w-full bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl p-4 text-sm font-bold text-center">No slots available</div>;
                    }

                    return (
                      <select id="appointmentTime" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800 appearance-none">
                        <option value="">Select slot</option>
                        {availableSlots.map((slot: string) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Section 2: Personal Details */}
            <div className="space-y-6">
              <h2 className="font-h2 text-slate-900 flex items-center gap-3 pb-3 border-b border-slate-100">
                <User size={24} className="text-[#00B5B5]" /> Personal Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="fullName" className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name <span className="text-rose-500">*</span></label>
                  <input type="text" id="fullName" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest">Email <span className="text-rose-500">*</span></label>
                  <input type="email" id="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile Number <span className="text-rose-500">*</span></label>
                  <input type="tel" id="phone" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="aadhaar" className="text-xs font-black text-slate-400 uppercase tracking-widest">Aadhaar <span className="text-rose-500">*</span></label>
                  <input type="text" id="aadhaar" name="aadhaar" placeholder="12-digit Aadhaar Number" value={formData.aadhaar} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="dob" className="text-xs font-black text-slate-400 uppercase tracking-widest">Date of Birth <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    id="dob" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800" 
                    max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="gender" className="text-xs font-black text-slate-400 uppercase tracking-widest">Gender <span className="text-rose-500">*</span></label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800 appearance-none">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="address" className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient Address <span className="text-rose-500">*</span></label>
                <textarea id="address" name="address" rows={3} placeholder="Your Residential Address" value={formData.address} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800 resize-none h-24"></textarea>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-xs font-black text-slate-400 uppercase tracking-widest">Message / About your illness</label>
              <textarea id="message" name="message" rows={4} placeholder="Describe symptoms or reasons for visit (optional)..." value={formData.message} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] focus:bg-white transition-all text-slate-800 resize-none h-32"></textarea>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" id="visitedBefore" name="visitedBefore" checked={formData.visitedBefore} onChange={handleChange} className="rounded text-[#00B5B5] focus:ring-[#00B5B5] w-5 h-5 cursor-pointer" />
              <label htmlFor="visitedBefore" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">Yes, I have visited this doctor/clinic before</label>
            </div>

            <button type="submit" disabled={isSubmitting || !isFormValid} className="btn-primary-custom w-full mt-4 flex items-center justify-center">
              {isSubmitting ? "Processing Booking..." : "Book Appointment Now"}
            </button>
          </form>
        </div>
      </Container>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#00B5B5]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00B5B5]">
                <LogIn size={40} />
              </div>
              <h2 className="font-h2 text-slate-900 mb-2">Login Required</h2>
              <p className="font-body-secondary text-slate-500 mb-8">
                Please log in to your account to book an appointment with our specialists.
              </p>
              
              {loginError && <p className="text-rose-500 text-sm font-semibold mb-4">{loginError}</p>}
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsLoggingIn(true);
                setLoginError("");
                const result = await login(loginEmail, loginPassword);
                if (result.success) {
                  setShowAuthModal(false);
                  setStatus({ type: "success", message: "Logged in successfully! You can now submit your appointment." });
                } else {
                  setLoginError(result.message || "Login failed");
                }
                setIsLoggingIn(false);
              }} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] outline-none transition-all text-sm font-semibold text-slate-800" placeholder="Enter your email" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] outline-none transition-all text-sm font-semibold text-slate-800" placeholder="Enter your password" />
                </div>
                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn-primary-custom w-full mt-2"
                >
                  <LogIn size={20} className="mr-2" />
                  {isLoggingIn ? "Logging in..." : "Login Now"}
                </button>
              </form>
              
              <button 
                onClick={() => setShowAuthModal(false)}
                className="py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors w-full mt-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

export default function Appointments() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#00B5B5] animate-spin" /></div>}>
      <AppointmentsForm />
    </Suspense>
  );
}
