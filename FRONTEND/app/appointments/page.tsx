"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Stethoscope, User, LogIn, X, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import "../../styles/AppointmentForm.css";

export default function Appointments() {
  const searchParams = useSearchParams();
  const { isAuthenticated, logout, login } = useAuth();
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

  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  
  useEffect(() => {
    const doctorId = searchParams.get("doctorId");
    if (doctorId) {
      // Fetch doctor details (doctorId can be an ID or a slug)
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/doctors/${doctorId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const doc = data.data.doctor;
            setDoctorInfo(doc);
            
            // Try to extract city/country from address if they are missing
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

            setFormData(prev => ({ 
              ...prev, 
              doctor: doc._id,
              department: doc.specialty || prev.department,
              city: detectedCity || prev.city,
              country: detectedCountry || prev.country,
              address: doc.address || prev.address
            }));

            // Auto-update URL to use slug
            if (doc.slug && doctorId !== doc.slug) {
              const url = new URL(window.location.href);
              url.searchParams.set("doctorId", doc.slug);
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
    <div className="appointment-container">
      <div className="form-wrapper">
        <header className="form-header">
          <h1>Book an Appointment</h1>
          <p>Fill in the details below to schedule your consultation with our specialists.</p>
        </header>

        {status.type && (
          <div className={`mb-6 p-4 rounded-xl text-center ${status.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Doctor & Clinic Details */}
          <section className="form-section">
            <h2 className="section-title">
              <Stethoscope size={20} /> Doctor & Clinic Details
            </h2>
            <div className="grid-3">
              <div className="input-group">
                <label htmlFor="department">Department <span>*</span></label>
                <input id="department" name="department" value={formData.department} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="city">Clinic City <span>*</span></label>
                <input id="city" name="city" value={formData.city} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="country">Country <span>*</span></label>
                <input id="country" name="country" value={formData.country} onChange={handleChange} required className="form-control-custom" />
              </div>
            </div>
            {doctorInfo?.address && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Clinic Address</p>
                  <p className="text-xs font-bold text-blue-700">{doctorInfo.address}</p>
                </div>
              </div>
            )}
            <div className="grid-3">
              <div className="input-group">
                <label htmlFor="doctor">Doctor <span>*</span></label>
                <div className="form-control-custom flex items-center bg-gray-50 text-gray-500 cursor-not-allowed">
                  {doctorInfo ? `Dr. ${doctorInfo.user?.name}` : (formData.doctor || "Select Doctor")}
                </div>
                <input type="hidden" name="doctor" value={formData.doctor} />
              </div>
              <div className="input-group">
                <label htmlFor="appointmentDate">Appointment Date <span>*</span></label>
                <input 
                  type="date" 
                  id="appointmentDate" 
                  name="appointmentDate" 
                  value={formData.appointmentDate} 
                  onChange={handleChange} 
                  required 
                  className="form-control-custom" 
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} 
                />
              </div>
              <div className="input-group">
                <label htmlFor="appointmentTime">Appointment Time <span>*</span></label>
                {(() => {
                  if (!formData.appointmentDate || !doctorInfo) {
                    return <div className="form-control-custom flex items-center bg-gray-50 text-gray-400">Please select a date first</div>;
                  }

                  const selectedDate = new Date(formData.appointmentDate);
                  selectedDate.setHours(0, 0, 0, 0);

                  // Check if doctor is on leave
                  const isLeave = doctorInfo.leaves?.some((leave: any) => {
                    const start = new Date(leave.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(leave.endDate);
                    end.setHours(23, 59, 59, 999);
                    return selectedDate >= start && selectedDate <= end;
                  });

                  if (isLeave) {
                    return <div className="form-control-custom flex items-center bg-red-50 text-red-500 font-bold">Doctor is not available on this day.</div>;
                  }

                  // Find available slots for the day of the week
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const dayName = days[selectedDate.getDay()];
                  
                  const dayAvailability = doctorInfo.availability?.find((a: any) => a.day === dayName);
                  const availableSlots = dayAvailability?.slots || [];

                  if (availableSlots.length === 0) {
                    return <div className="form-control-custom flex items-center bg-gray-50 text-red-500 font-bold">Doctor is not available on this day.</div>;
                  }

                  return (
                    <select id="appointmentTime" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required className="form-control-custom">
                      <option value="">Select a time slot</option>
                      {availableSlots.map((slot: string) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* Section 2: Personal Details */}
          <section className="form-section">
            <h2 className="section-title">
              <User size={20} /> Personal Details
            </h2>
            <div className="grid-2">
              <div className="input-group">
                <label htmlFor="fullName">Full Name <span>*</span></label>
                <input type="text" id="fullName" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email <span>*</span></label>
                <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="phone">Mobile Number <span>*</span></label>
                <input type="tel" id="phone" name="phone" placeholder="Mobile Number" value={formData.phone} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="aadhaar">Aadhaar <span>*</span></label>
                <input type="text" id="aadhaar" name="aadhaar" placeholder="Aadhaar" value={formData.aadhaar} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="dob">Date of Birth <span>*</span></label>
                <input 
                  type="date" 
                  id="dob" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                  required 
                  className="form-control-custom" 
                  max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]} 
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label htmlFor="gender">Gender <span>*</span></label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="form-control-custom">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="address">Patient Address <span>*</span></label>
              <textarea id="address" name="address" rows={3} placeholder="Your Address" value={formData.address} onChange={handleChange} required className="form-control-custom"></textarea>
            </div>
          </section>

          <div className="input-group" style={{ marginBottom: "20px" }}>
            <label htmlFor="message">Message / About your illness</label>
            <textarea id="message" name="message" rows={4} placeholder="Describe your symptoms or reason for visit (optional)" value={formData.message} onChange={handleChange} className="form-control-custom"></textarea>
          </div>

          <div className="input-group">
            <label htmlFor="visitedBefore">Have you visited before?</label>
            <label className="checkbox-group">
              <input type="checkbox" id="visitedBefore" name="visitedBefore" checked={formData.visitedBefore} onChange={handleChange} />
              <span>Yes, I have visited before</span>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting || !isFormValid} className="submit-btn">
            {isSubmitting ? "Processing..." : "GET APPOINTMENT"}
          </button>
        </form>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <LogIn size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
              <p className="text-gray-500 mb-8">
                Please log in to your account to book an appointment with our specialists.
              </p>
              
              {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
              
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
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter your password" />
                </div>
                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="bg-primary text-white py-4 mt-2 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn size={20} />
                  {isLoggingIn ? "Logging in..." : "Login Now"}
                </button>
              </form>
              
              <button 
                onClick={() => setShowAuthModal(false)}
                className="py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors w-full mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
