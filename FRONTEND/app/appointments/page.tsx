"use client";

import React, { useState } from "react";
import { Stethoscope, User } from "lucide-react";
import "../../styles/AppointmentForm.css";

export default function Appointments() {
  const [formData, setFormData] = useState({
    department: "Pediatrics",
    clinicCity: "",
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    aadhaar: "",
    dob: "",
    gender: "",
    address: "",
    visitedBefore: false,
  });

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
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({ type: "success", message: "Appointment booked successfully!" });
        setFormData({
          department: "Pediatrics",
          clinicCity: "",
          doctor: "",
          appointmentDate: "",
          appointmentTime: "",
          firstName: "",
          lastName: "",
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
    formData.clinicCity &&
    formData.doctor &&
    formData.appointmentDate &&
    formData.appointmentTime &&
    formData.firstName &&
    formData.lastName &&
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
            <div className="grid-2">
              <div className="input-group">
                <label htmlFor="department">Department <span>*</span></label>
                <select id="department" name="department" value={formData.department} onChange={handleChange} required className="form-control-custom">
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="clinicCity">Clinic City <span>*</span></label>
                <select id="clinicCity" name="clinicCity" value={formData.clinicCity} onChange={handleChange} required className="form-control-custom">
                  <option value="">Select City</option>
                  <option value="New York">New York</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="Chicago">Chicago</option>
                </select>
              </div>
            </div>
            <div className="grid-3">
              <div className="input-group">
                <label htmlFor="doctor">Doctor <span>*</span></label>
                <select id="doctor" name="doctor" value={formData.doctor} onChange={handleChange} required className="form-control-custom">
                  <option value="">Select Doctor</option>
                  <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                  <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                  <option value="Dr. Elena Rodriguez">Dr. Elena Rodriguez</option>
                </select>
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
                <label htmlFor="firstName">First Name <span>*</span></label>
                <input type="text" id="firstName" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="form-control-custom" />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name <span>*</span></label>
                <input type="text" id="lastName" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="form-control-custom" />
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
    </div>
  );
}
