"use client"

import React from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Building2, 
  Calendar, 
  Search, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import Hero from '@/components/Hero';
import SpecialtyCard from '@/components/SpecialtyCard';
import HowItWorks from '@/components/HowItWorks';
import Testimonial from '@/components/Testimonial';
import CTA from '@/components/CTA';
import DoctorDiscoverySection from '@/components/DoctorDiscoverySection';
import { specialties, testimonials } from '@/data/mock';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Why Patients Use BookMyDoctor */}
      <section className="py-16 bg-slate-50/50 relative overflow-hidden border-y border-slate-100">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
              Healthcare Access Made Simple
            </h3>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
              Finding the right doctor should not be difficult. BookMyDoctor helps patients discover trusted healthcare professionals nearby, compare options, and schedule appointments quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Find Nearby Doctors",
                description: "Discover healthcare professionals based on your location.",
                icon: MapPin
              },
              {
                title: "Verified Clinics",
                description: "Browse trusted clinics and healthcare centers.",
                icon: Building2
              },
              {
                title: "Easy Appointment Booking",
                description: "Book confirmed appointment slots within minutes.",
                icon: Calendar
              },
              {
                title: "Doctor Discovery",
                description: "Search by specialty, symptoms, clinic, or treatment type.",
                icon: Search
              },
              {
                title: "Transparent Information",
                description: "View doctor experience, consultation fees, and patient reviews before booking.",
                icon: FileText
              },
              {
                title: "Follow-Up Appointments",
                description: "Manage repeat visits easily.",
                icon: RefreshCw
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100/80 shadow-md shadow-slate-100/50 hover:shadow-xl hover:shadow-[#00B5B5]/5 hover:-translate-y-1 transition-all duration-300 flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 mb-2">{feature.title}</h4>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialties Overview */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Soft Radial Background Accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#00B5B5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8">
            <div className="max-w-2xl text-left">
              <h3 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
                Explore experienced specialists <br />
                <span className="bg-gradient-to-r from-[#00B5B5] to-[#008F8F] bg-clip-text text-transparent">across multiple fields</span>
              </h3>
            </div>
            
            <button 
              onClick={() => window.location.href = '/specialties'}
              className="bg-white hover:bg-slate-900 text-slate-900 hover:text-white px-8 h-14 rounded-2xl font-black transition-all duration-300 border border-slate-100 hover:border-slate-900 shadow-md hover:shadow-xl shadow-slate-200/50 flex items-center gap-3 shrink-0 group"
            >
              View All Specialties
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => (
              <SpecialtyCard
                key={index}
                {...specialty}
                onClick={() => window.location.href = `/specialties?specialty=${encodeURIComponent(specialty.name)}#doctor-listings`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Doctors Discovery Section */}
      <DoctorDiscoverySection />

      {/* Why Choose BookMyDoctor */}
      <section className="py-16 bg-[#F0FDFD]/25 relative overflow-hidden border-y border-slate-100/50">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
              Why Patients Trust BookMyDoctor
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Healthcare Professionals",
                desc: "Every doctor and clinic undergoes verification before being listed."
              },
              {
                title: "Real-Time Appointment Availability",
                desc: "See available appointment slots instantly."
              },
              {
                title: "Location-Based Search",
                desc: "Find doctors and clinics closest to your current location."
              },
              {
                title: "Transparent Consultation Fees",
                desc: "Know pricing before booking."
              },
              {
                title: "Fast Appointment Scheduling",
                desc: "Book appointments in minutes."
              },
              {
                title: "Trusted Patient Experience",
                desc: "Designed to simplify healthcare access for everyone."
              }
            ].map((trust, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md shadow-slate-100/30 flex flex-col justify-between h-full">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-3">{trust.title}</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">{trust.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Real Experiences From Real Patients</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <CTA />
    </div>
  );
}
