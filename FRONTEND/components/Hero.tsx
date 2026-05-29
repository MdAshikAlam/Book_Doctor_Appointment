import { ArrowRight, Check, Star } from 'lucide-react';

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
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Content */}
          <div className="max-w-2xl text-center lg:text-left">
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Find Trusted <br />
              <span className="text-[#00B5B5]">Doctors & Clinics</span> <br />
              Near You
            </h1>

            {/* Sub Heading */}
            <p className="text-md sm:text-lg text-slate-500 mb-8 max-w-xl leading-relaxed font-medium">
              Search verified doctors, specialists, and healthcare clinics in your area. Compare experience, consultation fees, patient ratings, and available appointment slots before booking.
            </p>

            {/* Benefits list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-lg mx-auto lg:mx-0 text-left">
              {[
                'Verified Doctors',
                'Verified Clinics',
                'Instant Appointment Booking',
                'Nearby Healthcare Services',
                'Secure Patient Experience',
                'Real-Time Slot Availability'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00B5B5]/10 flex items-center justify-center text-[#00B5B5] shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
              <button 
                onClick={() => window.location.href = '/specialties'}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#00B5B5] text-white font-black hover:bg-[#009A9A] transition-all shadow-xl shadow-[#00B5B5]/20 flex items-center justify-center gap-2"
              >
                <span>Find Doctors Near Me</span>
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => window.location.href = '/specialties'}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white text-slate-900 font-black border-2 border-slate-100 hover:border-[#00B5B5]/30 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <span>Browse Specialties</span>
              </button>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-200/50 max-w-xl mx-auto lg:mx-0">
              {[
                { value: '2,000+', label: 'Verified Doctors' },
                { value: '500+', label: 'Clinics' },
                { value: '50,000+', label: 'Appointments Booked' },
                { value: '4.8', label: 'Patient Rating', isRating: true }
              ].map((stat, i) => (
                <div key={i} className="text-left">
                  <p className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1 leading-none mb-1.5">
                    <span>{stat.value}</span>
                    {stat.isRating && <Star size={14} className="fill-[#00B5B5] text-[#00B5B5]" />}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Visuals */}
          <div className="relative w-full lg:w-1/2">
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
