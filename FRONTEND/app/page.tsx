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

// Import global UI components
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Why Patients Use BookMyDoctor */}
      <Section className="bg-slate-50/50 relative overflow-hidden border-y border-slate-100">
        <Container className="relative z-10">
          <SectionHeader 
            title="Why Choose BookMyDoctor"
            description="Finding the right doctor should not be difficult. BookMyDoctor helps patients discover trusted healthcare professionals nearby, compare options, and schedule appointments quickly."
          />

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
                <Card key={i} className="hover:-translate-y-1 transition-all duration-300 flex flex-row gap-5 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    {/* Card Title must use H3 */}
                    <h3 className="font-h3 text-slate-900 mb-2">{feature.title}</h3>
                    {/* Card Descriptions must use body text */}
                    <p className="font-body-secondary text-slate-400">{feature.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Specialties Overview */}
      <Section className="bg-white relative overflow-hidden">
        {/* Soft Radial Background Accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#00B5B5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <div className="max-w-2xl text-left">
              <h2 className="font-h2 text-slate-900 tracking-tight">
                Popular Specialties
              </h2>
              <p className="font-body-primary text-slate-500 mt-4">
                Explore experienced specialists across multiple fields. Choose a specialty to find verified doctors in your area.
              </p>
            </div>
            
            <button 
              onClick={() => window.location.href = '/specialties'}
              className="btn-secondary-custom shrink-0 group flex items-center gap-3"
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
        </Container>
      </Section>

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Doctors Discovery Section */}
      <DoctorDiscoverySection />

      {/* Why Patients Trust BookMyDoctor */}
      <Section className="bg-[#F0FDFD]/25 relative overflow-hidden border-y border-slate-100/50">
        <Container className="relative z-10">
          <SectionHeader 
            title="Why Patients Trust BookMyDoctor"
          />

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
              <Card key={i} className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-h3 text-slate-900 mb-3">{trust.title}</h3>
                  <p className="font-body-secondary text-slate-400">{trust.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section className="bg-white relative overflow-hidden">
        <Container className="relative z-10">
          <SectionHeader 
            title="Patient Reviews"
            description="Real experiences from real patients who booked their appointments through BookMyDoctor."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Call to Action */}
      <CTA />
    </div>
  );
}
