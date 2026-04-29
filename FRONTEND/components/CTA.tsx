import { ArrowRight, Info, Calendar } from 'lucide-react';

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
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="bg-[#00B5B5] rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden shadow-2xl shadow-[#00B5B5]/20">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-grow text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1]">
                {title}
              </h2>
              <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                <button className="w-full sm:w-auto bg-white text-[#00B5B5] hover:bg-[#F0FDFD] px-12 h-16 rounded-full font-black text-lg flex items-center justify-center transition-all shadow-xl">
                  {primaryButtonText} <ArrowRight className="ml-3 w-6 h-6" />
                </button>
                <button className="w-full sm:w-auto bg-transparent border-2 border-white/30 hover:border-white text-white px-10 h-16 rounded-full font-black text-lg flex items-center justify-center transition-all">
                  <Info className="mr-3 w-6 h-6" /> {secondaryButtonText}
                </button>
              </div>
            </div>

            <div className="w-full max-w-sm lg:max-w-md hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#00B5B5] shadow-inner">
                    <Calendar size={32} />
                  </div>
                  <div>
                    <h4 className="text-white text-xl font-black">24/7 Support</h4>
                    <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Always here for you</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-4 bg-white/10 rounded-full w-full" />
                  ))}
                  <div className="h-4 bg-white/10 rounded-full w-2/3" />
                </div>
                <div className="mt-10 pt-10 border-t border-white/10">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#00B5B5] bg-white/20" />
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
