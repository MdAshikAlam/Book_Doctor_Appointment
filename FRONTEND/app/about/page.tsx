import React from 'react';
import { 
  HeartPulse, 
  Target, 
  Compass, 
  Users, 
  Award, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      {/* Page Header / Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFD] via-[#F6FCFC] to-white pt-36 pb-24 border-b border-slate-100">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00B5B5]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#00B5B5]/20 text-[#00B5B5] text-sm font-bold shadow-sm shadow-slate-100/50 mb-8">
              <Sparkles className="w-4 h-4 text-[#00B5B5]" />
              <span className="tracking-wide uppercase text-xs">Our Healthcare Vision</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-8">
              Revolutionizing Access to <br className="hidden sm:inline" />
              <span className="relative inline-block px-2 text-[#00B5B5] italic">
                Quality Healthcare
                <span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#00B5B5]/10 -skew-x-12 rounded-full"></span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
              We are dedicated to building a seamless healthcare bridge. Our platform connects patients with top-tier certified medical professionals, making quality clinical care accessible to everyone, anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative z-20 -mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y-2 md:divide-y-0 md:divide-x divide-slate-50">
              <div className="text-center md:px-4">
                <h4 className="text-4xl md:text-5xl font-black text-[#00B5B5] mb-2">10k+</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Certified Doctors</p>
              </div>
              <div className="text-center pt-6 md:pt-0 md:px-4">
                <h4 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">500k+</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Happy Patients</p>
              </div>
              <div className="text-center pt-6 md:pt-0 md:px-4">
                <h4 className="text-4xl md:text-5xl font-black text-[#00B5B5] mb-2">99.8%</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</p>
              </div>
              <div className="text-center pt-6 md:pt-0 md:px-4">
                <h4 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">50+</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specialties</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black text-[#00B5B5] uppercase tracking-[0.2em] mb-4">Core Principles</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 leading-snug">What drives our commitment to excellence</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Our Mission */}
            <div className="bg-slate-50/50 rounded-[2rem] p-8 md:p-10 border border-slate-100/80 hover:border-[#00B5B5]/20 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#00B5B5]/10 rounded-2xl flex items-center justify-center text-[#00B5B5] mb-6 group-hover:scale-110 transition-transform">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-4">Our Mission</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                To simplify the healthcare journey. We strive to provide transparent, high-fidelity scheduling systems that connect patients with clinics instantly, bypassing long queues.
              </p>
            </div>

            {/* Our Vision */}
            <div className="bg-slate-50/50 rounded-[2rem] p-8 md:p-10 border border-slate-100/80 hover:border-blue-400/20 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Compass size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-4">Our Vision</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                A digitally unified medical network where clinical choice is transparent, geographical borders are erased, and verified specialized medical support is always a click away.
              </p>
            </div>

            {/* Our Values */}
            <div className="bg-slate-50/50 rounded-[2rem] p-8 md:p-10 border border-slate-100/80 hover:border-[#00B5B5]/20 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#00B5B5]/10 rounded-2xl flex items-center justify-center text-[#00B5B5] mb-6 group-hover:scale-110 transition-transform">
                <HeartPulse size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-4">Our Values</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                We advocate patient-first clinical empathy, rigorous verification protocols, and data protection to deliver secure online diagnostic schedules you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Standards Section */}
      <section className="py-20 bg-slate-50/50 border-t border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-xs font-black text-[#00B5B5] uppercase tracking-[0.2em] mb-4">Operational Security</h2>
              <h3 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-6">
                Enterprise infrastructure built for secure digital healthcare
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                BookMyDoctor operates on enterprise-grade infrastructure. We implement secure data standards to ensure patient files and appointments are processed safely and efficiently.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm mb-1">HIPAA Compliant</h5>
                    <p className="text-xs text-slate-400 font-semibold">Maximum standard of data security</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm mb-1">Verified Medical Staff</h5>
                    <p className="text-xs text-slate-400 font-semibold">Strict qualification vetting</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm mb-1">Real-time Syncing</h5>
                    <p className="text-xs text-slate-400 font-semibold">Zero schedule collision guarantee</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm mb-1">24/7 Operations Helpdesk</h5>
                    <p className="text-xs text-slate-400 font-semibold">Round the clock patient support</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-3 border border-slate-100/50 max-w-[480px] mx-auto lg:ml-auto">
                <div className="rounded-[2rem] overflow-hidden aspect-[4/3] relative bg-[#F0FDFD] flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop" 
                    alt="Doctors talking" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00B5B5]/15 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Call To Action */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-gradient-to-br from-[#00B5B5] to-[#008A8A] rounded-[2.5rem] p-10 md:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-[#00B5B5]/20">
            {/* Subtle background overlay grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }} />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-black mb-4 leading-tight">Ready to consult with our expert specialists?</h3>
              <p className="text-white/80 font-medium text-base mb-8 max-w-md mx-auto leading-relaxed">
                Connect with the right clinicians near you and schedule your appointment in under 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/specialties" className="bg-white text-slate-900 py-4 px-8 rounded-2xl font-black shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center gap-2">
                  Browse Specialties
                  <ArrowRight size={16} className="text-[#00B5B5]" />
                </Link>
                <Link href="/contact" className="border-2 border-white/30 hover:border-white text-white py-4 px-8 rounded-2xl font-black transition-all text-sm">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
