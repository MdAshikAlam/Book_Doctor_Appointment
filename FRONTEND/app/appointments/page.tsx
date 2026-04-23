"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Stethoscope, User, LogIn, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import "../../styles/AppointmentForm.css";

export default function Appointments() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  });

  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  
  useEffect(() => {
    const doctorId = searchParams.get("doctorId");
    if (doctorId) {
      setFormData(prev => ({ ...prev, doctor: doctorId }));
      // Fetch doctor details
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/doctors/${doctorId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const doc = data.data.doctor;
            setDoctorInfo(doc);
            setFormData(prev => ({ 
              ...prev, 
              department: doc.specialty || prev.department,
              city: doc.city || prev.city,
              country: doc.country || prev.country
            }));
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
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          date: formData.appointmentDate,
          slot: formData.appointmentTime,
          reason: `Appointment for ${formData.department}`
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
        });
      } else {
        const errorData = await response.json();
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
                <input type="date" id="appointmentDate" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="appointmentTime">Appointment Time <span>*</span></label>
                <input type="time" id="appointmentTime" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required className="form-control-custom" />
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
                <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} required className="form-control-custom" />
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
              
              <div className="flex flex-col gap-3">
                <Link 
                  href="/login"
                  onClick={() => setShowAuthModal(false)}
                  className="bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={20} />
                  Login Now
                </Link>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
