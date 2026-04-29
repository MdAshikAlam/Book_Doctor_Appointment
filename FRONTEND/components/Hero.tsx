import { Stethoscope, Pill, HeartPulse, Star, Phone, CheckCircle2, ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onSearch?: (query: string, location: string) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#F0FDFD] py-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} />

      {/* Decorative Floating Icons */}
      <div className="absolute top-20 left-10 animate-bounce duration-[3000ms] opacity-20 hidden lg:block">
        <div className="p-4 bg-white rounded-3xl shadow-xl rotate-12">
          <HeartPulse size={40} className="text-[#00B5B5]" />
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-pulse opacity-20 hidden lg:block">
        <div className="p-4 bg-white rounded-3xl shadow-xl -rotate-12">
          <Pill size={40} className="text-[#00B5B5]" />
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Content */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E0F7F7] text-[#00B5B5] text-xs font-black uppercase tracking-wider mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#00B5B5] animate-ping" />
              Healthy everyday!
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
              Get a <span className="text-[#00B5B5]">professional</span> <br />
              <span className="text-[#00B5B5]">diagnosis</span> in your <br />
              neighborhood
            </h1>
            
            <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
              Leading experts in all major fields are just around the corner. 
              Book your appointment today and take the first step towards a healthier you.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button className="h-16 px-10 rounded-full bg-[#00B5B5] text-white font-black hover:bg-[#009A9A] transition-all shadow-xl shadow-[#00B5B5]/20 flex items-center gap-3">
                Book an appointment
                <ArrowRight size={20} />
              </button>
              <button className="h-16 px-10 rounded-full bg-white text-slate-900 font-black border-2 border-slate-100 hover:border-[#00B5B5] transition-all flex items-center gap-3">
                Learn more
                <div className="w-8 h-8 rounded-full bg-[#F0FDFD] flex items-center justify-center text-[#00B5B5]">
                  <Play size={12} fill="currentColor" />
                </div>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-slate-100 pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Patient" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-[#00B5B5] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  +2k
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#FFB800" stroke="none" />)}
                </div>
                <p className="text-[13px] font-bold text-slate-900 leading-tight">
                  Trusted by <span className="text-[#00B5B5]">20,000+</span> <br />
                  patients worldwide
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Visuals */}
          <div className="relative w-full lg:w-1/2">
            <div className="relative z-10 w-full max-w-[500px] mx-auto lg:ml-auto">
              {/* Main Doctor Image Container */}
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-white p-2">
                <div className="rounded-[2.5rem] overflow-hidden aspect-[4/5] relative">
                  <img 
                    src="/doctor_hero_image_1777495389004.png" 
                    alt="Doctor" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00B5B5]/20 to-transparent" />
                </div>
              </div>

              {/* Floating Card 1: Call Center */}
              <div className="absolute -left-12 top-1/4 z-20 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4 animate-bounce-subtle">
                <div className="w-10 h-10 rounded-full bg-[#00B5B5] flex items-center justify-center text-white">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Available</p>
                  <p className="text-xs font-black text-slate-900">24/7 Call Center</p>
                </div>
              </div>

              {/* Floating Card 2: Doctor Info */}
              <div className="absolute -right-8 bottom-1/4 z-20 bg-white p-4 rounded-2xl shadow-2xl border border-slate-50 flex items-center gap-4 min-w-[200px]">
                <img 
                  src="https://i.pravatar.cc/150?u=doc1" 
                  className="w-12 h-12 rounded-xl object-cover"
                  alt="Doctor"
                />
                <div>
                  <p className="text-sm font-black text-slate-900">Dr. Jared Giel</p>
                  <p className="text-[10px] font-bold text-slate-400">Laryngologist</p>
                </div>
                <div className="ml-auto w-6 h-6 rounded-full bg-[#E0F7F7] flex items-center justify-center text-[#00B5B5]">
                  <CheckCircle2 size={14} />
                </div>
              </div>

              {/* Floating Card 3: Review */}
              <div className="absolute -left-8 -bottom-10 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 max-w-[240px]">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src="https://i.pravatar.cc/150?u=elsa" 
                    className="w-10 h-10 rounded-full"
                    alt="Elsa B."
                  />
                  <div>
                    <p className="text-xs font-black text-slate-900">Elsa B.</p>
                    <p className="text-[9px] font-bold text-slate-400">Warsaw | Verified Patient</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                  "The diagnosis was quick and the care I received was exceptional. Highly recommend HouseMed!"
                </p>
                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="#00B5B5" stroke="none" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
