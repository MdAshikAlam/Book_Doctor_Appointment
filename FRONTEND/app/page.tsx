"use client"

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import SpecialtyCard from '@/components/SpecialtyCard';
import HowItWorks from '@/components/HowItWorks';
import Testimonial from '@/components/Testimonial';
import CTA from '@/components/CTA';
import DoctorDiscoverySection from '@/components/DoctorDiscoverySection';
import { specialties, testimonials } from '@/data/mock';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Specialties Overview */}
      <section className="py-28 bg-gradient-to-b from-white via-slate-50/30 to-white relative overflow-hidden">
        {/* Soft Radial Background Accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#00B5B5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00B5B5]/10 border border-[#00B5B5]/20 text-[#00B5B5] text-[10px] font-black uppercase tracking-widest mb-4">
                Clinical Expertise
              </div>
              <h3 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
                Specialists trained in <br />
                <span className="bg-gradient-to-r from-[#00B5B5] to-[#008F8F] bg-clip-text text-transparent">modern medicine</span>
              </h3>
            </div>
            
            <button className="bg-white hover:bg-slate-900 text-slate-900 hover:text-white px-8 h-14 rounded-2xl font-black transition-all duration-300 border border-slate-100 hover:border-slate-900 shadow-md hover:shadow-xl shadow-slate-200/50 flex items-center gap-3 shrink-0 group">
              View All Specialties
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => (
              <SpecialtyCard key={index} {...specialty} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Doctors Discovery Section */}
      <DoctorDiscoverySection />

      {/* Testimonials */}
      <section className="py-24 bg-healthcare-blue/30 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-black text-[#00B5B5] uppercase tracking-[0.2em] mb-4">Patient Stories</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Real results from real patients</h3>
            <p className="text-slate-500 text-lg font-medium">Hear what our patients have to say about their exceptional care experience with HouseMed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
