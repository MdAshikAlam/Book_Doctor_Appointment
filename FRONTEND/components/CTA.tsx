import { ArrowRight, Info } from 'lucide-react';

interface CTAProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

const CTA = ({
  title = "Need a Doctor Today?",
  subtitle = "Find trusted doctors, compare available appointment slots, and book healthcare services in minutes.",
  primaryButtonText = "Find Doctors Near Me",
  secondaryButtonText = "Browse Specialties"
}: CTAProps) => {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Soothing background decorative glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#00B5B5]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="bg-gradient-to-tr from-[#00A5A5] to-[#008F8F] rounded-[3rem] p-8 md:p-20 relative overflow-hidden shadow-2xl shadow-[#00B5B5]/25 border border-white/10">
          
          {/* Calm Ambient Lighting inside Card */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[450px] h-[450px] bg-white/15 rounded-full blur-3xl animate-pulse duration-[6000ms]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/5 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Left Content Column */}
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                {title}
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                {subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <button 
                  onClick={() => window.location.href = '/specialties'}
                  className="w-full sm:w-auto bg-white text-[#00A5A5] hover:bg-[#F0FDFD] px-10 h-14 rounded-2xl font-black text-sm flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/10 group"
                >
                  {primaryButtonText} 
                  <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => window.location.href = '/specialties'}
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:border-white text-white px-8 h-14 rounded-2xl font-black text-sm flex items-center justify-center transition-all duration-300 gap-2"
                >
                  <Info size={16} /> 
                  {secondaryButtonText}
                </button>
              </div>

              {/* Trust Message */}
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Join thousands of patients who use BookMyDoctor to discover trusted healthcare professionals nearby.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
