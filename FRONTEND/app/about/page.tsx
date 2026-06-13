import React from 'react';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Search,
  FileText,
  Calendar,
  Check,
  UserCheck,
  Clock,
  Building2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

// Import global UI components
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';

export default function About() {
  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFD] via-[#F6FCFC] to-white pt-10 pb-16 border-b border-slate-100"> {/* Navbar -> Hero = 40px */}
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00B5B5]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

        <Container className="relative z-10 text-center">
          {/* Main Title */}
          <h1 className="font-h1 text-slate-900 mb-6">
            Making Healthcare Access <br className="hidden sm:inline" />
            <span className="relative inline-block px-2 text-[#00B5B5]">
              Simple for Everyone
              <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#00B5B5]/10 -skew-x-12 rounded-full"></span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body-primary text-slate-500 mx-auto mb-8">
            BookMyDoctor helps patients discover trusted doctors and clinics nearby, compare healthcare options, and book appointments quickly and easily.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/specialties"
              className="btn-primary-custom w-full sm:w-auto"
            >
              <span>Find Doctors Near You</span>
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/specialties"
              className="btn-secondary-custom w-full sm:w-auto"
            >
              <span>Browse Specialties</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* SECTION 2: OUR STORY */}
      <Section className="bg-white border-b border-slate-100">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-h2 text-slate-900">
                Why Choose BookMyDoctor
              </h2>
              <div className="space-y-4 text-slate-500 font-medium leading-relaxed">
                <p className="text-lg text-slate-600 font-semibold">
                  Finding the right doctor should not be stressful.
                </p>
                <p>
                  Many patients struggle to locate trusted healthcare professionals, compare options, and secure appointments without making multiple calls or visiting clinics in person.
                </p>
                <p>
                  BookMyDoctor was created to simplify that process by connecting patients with verified doctors and clinics through a single platform.
                </p>
                <p>
                  Our goal is to make healthcare discovery and appointment booking faster, easier, and more transparent.
                </p>
              </div>
            </div>

            <div className="relative">
              {/* Decorative Frame */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-3 border border-slate-100/50 max-w-[480px] mx-auto lg:ml-auto">
                <div className="rounded-[2rem] overflow-hidden aspect-[4/3] relative bg-[#F0FDFD]">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop"
                    alt="Healthcare professional consulting with patient"
                    className="w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00B5B5]/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 3: THE PROBLEM WE SOLVE */}
      <Section className="bg-slate-50/50 border-b border-slate-100">
        <Container className="max-w-6xl">
          <SectionHeader
            title="Why Choose BookMyDoctor"
            description="We solve core accessibility challenges to connect patients directly with verified clinical care."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Difficulty Finding Specialists",
                description: "Patients often struggle to identify the right specialist for their medical concerns.",
                icon: Search,
                color: "from-blue-500/10 to-blue-500/5",
                iconColor: "text-blue-500"
              },
              {
                title: "Long Appointment Booking Process",
                description: "Many clinics still rely on phone calls and manual scheduling.",
                icon: Clock,
                color: "from-amber-500/10 to-amber-500/5",
                iconColor: "text-amber-500"
              },
              {
                title: "Limited Information",
                description: "Patients frequently lack access to consultation fees, experience, and clinic details before booking.",
                icon: FileText,
                color: "from-teal-500/10 to-teal-500/5",
                iconColor: "text-[#00B5B5]"
              },
              {
                title: "Location Challenges",
                description: "Finding trusted healthcare providers nearby can be time-consuming.",
                icon: MapPin,
                color: "from-rose-500/10 to-rose-500/5",
                iconColor: "text-rose-500"
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <Card key={i} className="flex-row gap-6 items-start">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center ${card.iconColor} shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    {/* Card Title must use H3 */}
                    <h3 className="font-h3 text-slate-900 mb-2">{card.title}</h3>
                    {/* Card Descriptions must use body text */}
                    <p className="font-body-secondary text-slate-400">{card.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* SECTION 4: HOW BOOKMYDOCTOR WORKS */}
      <Section className="bg-white border-b border-slate-100">
        <Container className="max-w-6xl">
          <SectionHeader
            title="How It Works"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "Step 1",
                title: "Choose Your Location",
                description: "Allow location access or select your city manually.",
                icon: MapPin
              },
              {
                step: "Step 2",
                title: "Find Doctors & Clinics",
                description: "Browse specialists based on location and healthcare needs.",
                icon: Search
              },
              {
                step: "Step 3",
                title: "Compare Options",
                description: "Review doctor profiles, experience, consultation fees, and clinic information.",
                icon: FileText
              },
              {
                step: "Step 4",
                title: "Book Appointment",
                description: "Select an available slot and confirm your appointment instantly.",
                icon: Calendar
              }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <Card key={i} className="relative flex flex-col justify-between group hover:border-[#00B5B5]/25">
                  <div className="absolute top-6 right-6 text-slate-200 group-hover:text-[#00B5B5]/10 text-4xl font-black transition-colors">
                    {`0${i + 1}`}
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[#00B5B5] mb-6">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-[#00B5B5] uppercase tracking-wider mb-2 block">{step.step}</span>
                    <h3 className="font-h3 text-slate-900 mb-3">{step.title}</h3>
                    <p className="font-body-secondary text-slate-400">{step.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* SECTION 5: WHY PATIENTS TRUST US */}
      <Section className="bg-slate-50/50 border-b border-slate-100">
        <Container className="max-w-6xl">
          <SectionHeader
            title="Why Choose BookMyDoctor"
            description="Dedicated to simplifying access to medical professionals."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Doctor Profiles",
                description: "Every listed healthcare professional undergoes profile verification.",
                icon: UserCheck
              },
              {
                title: "Location-Based Search",
                description: "Find doctors and clinics nearest to you.",
                icon: MapPin
              },
              {
                title: "Transparent Information",
                description: "View experience, fees, specialties, and clinic details before booking.",
                icon: FileText
              },
              {
                title: "Quick Appointment Scheduling",
                description: "Book appointments in just a few clicks.",
                icon: Clock
              },
              {
                title: "Wide Specialty Coverage",
                description: "Explore healthcare providers across multiple specialties.",
                icon: Building2
              },
              {
                title: "Direct Booking & Zero Fees",
                description: "Schedule appointments directly with doctors with absolutely zero extra booking charges.",
                icon: ShieldCheck
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] mb-4">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-h3 text-slate-900 mb-2">{item.title}</h3>
                    <p className="font-body-secondary text-slate-400">{item.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* SECTION 6: FOR DOCTORS & CLINICS */}
      <Section className="bg-white border-b border-slate-100">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-last lg:order-first">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-3 border border-slate-100/50 max-w-[480px] mx-auto lg:mr-auto">
                <div className="rounded-[2rem] overflow-hidden aspect-[4/3] relative bg-slate-50">
                  <img
                    src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop"
                    alt="Doctors team working in clinic"
                    className="w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00B5B5]/10 to-transparent" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="font-h2 text-slate-900 mb-4">
                  Why Choose BookMyDoctor
                </h2>
                <p className="font-body-primary text-slate-500">
                  BookMyDoctor is designed not only for patients but also for healthcare providers. Our platform helps doctors and clinics increase visibility, manage appointments efficiently, and connect with patients actively searching for healthcare services.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Increase Patient Reach",
                  "Improve Appointment Management",
                  "Strengthen Online Presence",
                  "Reduce Scheduling Friction"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 7: OUR VISION */}
      <Section className="bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-100">
        <Container className="max-w-4xl text-center">
          {/* Mission / Vision / Values must use H3 */}
          <h3 className="font-h3 text-slate-900 mb-6 uppercase tracking-wider">
            Our Vision
          </h3>
          <h2 className="font-h2 text-slate-900 mb-6">
            Making Healthcare Access Simple for Everyone
          </h2>
          <p className="font-body-primary text-slate-500 mx-auto">
            We envision a future where finding trusted healthcare professionals is simple, transparent, and accessible to everyone. By combining technology with healthcare discovery, we aim to help patients make informed decisions and connect with the care they need faster.
          </p>
        </Container>
      </Section>

      {/* SECTION 8: FINAL CTA */}
      <Section className="bg-white relative">
        <Container className="max-w-4xl">
          <div className="bg-gradient-to-br from-[#00B5B5] to-[#008A8A] rounded-[2.5rem] p-10 md:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-[#00B5B5]/25">
            {/* Subtle background overlay grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }} />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-h2 text-white mb-4">Ready to Find the Right Doctor?</h2>
              <p className="text-white/80 font-body-primary mb-8 mx-auto">
                Discover verified doctors, compare healthcare options, and book appointments with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/specialties" className="btn-primary-custom !bg-white !text-slate-900 w-full sm:w-auto">
                  Find Doctors Near Me
                  <ArrowRight size={16} className="ml-2 text-[#00B5B5]" />
                </Link>
                <Link href="/specialties" className="btn-secondary-custom !border-white/30 hover:!border-white !text-white !bg-transparent w-full sm:w-auto">
                  Browse Specialties
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
