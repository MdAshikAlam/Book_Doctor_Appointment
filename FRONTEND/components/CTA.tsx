import { ArrowRight, Info, Calendar, Clock, PhoneCall } from 'lucide-react';

interface CTAProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

const CTA = ({
  title = "Ready to book your first appointment?",
  subtitle = "Join thousands of satisfied patients who have found their perfect doctor through HouseMed. Experience healthcare that actually works for you.",
  primaryButtonText = "Find a doctor now",
  secondaryButtonText = "Learn more"
}: CTAProps) => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Soothing background decorative glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#00B5B5]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="bg-gradient-to-tr from-[#00A5A5] to-[#008F8F] rounded-[3rem] p-8 md:p-20 relative overflow-hidden shadow-2xl shadow-[#00B5B5]/25 border border-white/10">
          
          {/* Calm Ambient Lighting inside Card */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[450px] h-[450px] bg-white/15 rounded-full blur-3xl animate-pulse duration-[6000ms]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content Column */}
            <div className="flex-grow text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-6">
                Premium Access
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                {title}
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="w-full sm:w-auto bg-white text-[#00A5A5] hover:bg-[#F0FDFD] px-10 h-14 rounded-2xl font-black text-sm flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/10 group">
                  {primaryButtonText} 
                  <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:border-white text-white px-8 h-14 rounded-2xl font-black text-sm flex items-center justify-center transition-all duration-300 gap-2">
                  <Info size={16} /> 
                  {secondaryButtonText}
                </button>
              </div>
            </div>

            {/* Right Interactive Information Block (Desktop/Tablet) */}
            <div className="w-full max-w-md hidden lg:block shrink-0">
              <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/15 shadow-2xl">
                
                {/* Support Heading */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white/10 border border-white/15 rounded-2xl flex items-center justify-center text-white shadow-inner shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="text-white text-lg font-extrabold leading-tight">24/7 Clinical Support</h4>
                    <p className="text-white/60 font-semibold uppercase tracking-widest text-[9px]">Always here to assist</p>
                  </div>
                </div>

                {/* Styled operational entries instead of empty lines */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-xs text-white/90 font-bold bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="flex items-center gap-2">
                      <Clock size={14} className="text-white/70" /> Weekday Schedule
                    </span>
                    <span className="text-white/60 font-medium">8:00 AM - 8:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/90 font-bold bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="flex items-center gap-2">
                      <Clock size={14} className="text-white/70" /> Weekend Coverage
                    </span>
                    <span className="text-white/60 font-medium">9:00 AM - 5:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/90 font-bold bg-white/5 border border-white/5 p-3 rounded-xl">
                    <span className="flex items-center gap-2">
                      <PhoneCall size={14} className="text-white/70" /> Emergency Hotline
                    </span>
                    <span className="text-white/60 font-medium">Open 24 Hours</span>
                  </div>
                </div>

                {/* Satisfied Patient count metrics */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Global Support Coverage</span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border border-[#00B5B5] bg-white/20 flex items-center justify-center text-[10px] text-white font-extrabold shadow-sm">
                        +{i * 10}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
