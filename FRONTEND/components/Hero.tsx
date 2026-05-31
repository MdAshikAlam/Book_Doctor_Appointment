import { ArrowRight, Check, Star } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#F0FDFD] pt-20 pb-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} />

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00B5B5]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
          {/* Left Content */}
          <div className="max-w-2xl text-center lg:text-left">
            {/* Heading */}
            <h1 className="font-h1 text-slate-900 mb-6">
              Find Trusted <br />
              <span className="text-[#00B5B5]">Doctors & Clinics</span> <br />
              Near You
            </h1>

            {/* Sub Heading */}
            <p className="font-body-primary text-slate-500 mb-8 max-w-xl">
              Search verified doctors, specialists, and healthcare clinics in your area. Compare experience, consultation fees, patient ratings, and available appointment slots before booking.
            </p>

            {/* Benefits list */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-8 max-w-2xl mx-auto">
              {[
                'Verified Doctors',
                'Verified Clinics',
                'Instant Appointment Booking',
                'Nearby Healthcare Services',
                'Secure Patient Experience',
                'Real-Time Slot Availability'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5 justify-center">
                  <div className="w-5 h-5 rounded-full bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-4">
              <Link 
                href="/specialties#doctor-listings"
                className="btn-primary-custom w-full sm:w-auto"
              >
                Find Doctors Near Me <ArrowRight size={16} />
              </Link>
              <Link 
                href="/specialties"
                className="btn-secondary-custom w-full sm:w-auto"
              >
                Browse Specialties
              </Link>
            </div>

            {/* Clinic Partner Network Prompt */}
            <div className="flex items-center gap-2 justify-center mt-2 mb-12 text-xs font-bold text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B5B5]/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B5B5]" />
              </span>
              <span>Are you a clinic or healthcare provider?</span>
              <Link 
                href="/contact" 
                className="text-[#00B5B5] hover:underline font-black flex items-center gap-0.5 group"
              >
                Join our network
                <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Content - Visuals */}
          <div className="relative w-full lg:w-1/2 lg:pt-2">
            <div className="relative z-10 w-full max-w-[500px] mx-auto lg:ml-auto">
              {/* Main Doctor Image Container */}
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-white p-2">
                <div className="rounded-[2.5rem] overflow-hidden aspect-[4/5] relative">
                  <img
                    src="/image/pexels-pavel-danilyuk-5998466.jpg"
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00B5B5]/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
