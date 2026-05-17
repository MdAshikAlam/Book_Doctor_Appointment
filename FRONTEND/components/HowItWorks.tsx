import { Search, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    title: "Select Your Specialist",
    description: "Easily navigate our curated list of world-class medical experts by specialty, experience, or proximity.",
    icon: Search,
    color: "from-blue-500/10 to-teal-500/10 text-[#00B5B5]"
  },
  {
    title: "Secure Instant Slot",
    description: "Book directly without telephone delays. Select a highly convenient hour and secure your slot in seconds.",
    icon: Calendar,
    color: "from-teal-500/10 to-emerald-500/10 text-[#00B5B5]"
  },
  {
    title: "Receive Quality Care",
    description: "Consult your doctor at the scheduled hour to receive modern medical solutions, therapies, and follow-ups.",
    icon: CheckCircle2,
    color: "from-indigo-500/10 to-purple-500/10 text-[#00B5B5]"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-28 bg-gradient-to-b from-[#F0FDFD]/20 via-[#F9FCFC] to-[#F0FDFD]/20 relative overflow-hidden">
      {/* Absolute Soothing Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#00B5B5]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00B5B5]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Soothing Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00B5B5]/10 border border-[#00B5B5]/20 text-[#00B5B5] text-[10px] font-black uppercase tracking-widest mb-4">
            Patient Guide
          </div>
          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
            3 simple steps to <span className="bg-gradient-to-r from-[#00B5B5] to-[#008F8F] bg-clip-text text-transparent">better health</span>
          </h3>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
            We have simplified the clinical intake process, allowing you to bypass administrative friction and focus entirely on your recovery.
          </p>
        </div>

        {/* Dynamic Connected Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-lg shadow-slate-200/20 hover:shadow-2xl hover:shadow-[#00B5B5]/10 hover:-translate-y-2 transition-all duration-500 group relative flex flex-col justify-between"
              >
                <div>
                  {/* Floating Number Overlay */}
                  <div className="absolute top-8 right-10 text-8xl font-black text-slate-50/70 select-none group-hover:text-[#00B5B5]/10 transition-colors pointer-events-none">
                    0{index + 1}
                  </div>

                  {/* Icon Container with glowing base */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00B5B5]/5 to-transparent border border-slate-100 flex items-center justify-center mb-8 relative z-10 group-hover:bg-[#00B5B5] group-hover:text-white transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#00B5B5]/20">
                    <Icon size={26} className="text-[#00B5B5] group-hover:text-white transition-colors duration-500" />
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-extrabold text-slate-900 mb-3 relative z-10 group-hover:text-[#00B5B5] transition-colors leading-tight">
                    {step.title}
                  </h4>

                  {/* Description */}
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed relative z-10 mb-6 group-hover:text-slate-500 transition-colors">
                    {step.description}
                  </p>
                </div>

                {/* Animated Learn More Hook */}
                <div className="pt-4 border-t border-slate-50 relative z-10 flex items-center gap-1.5 text-[10px] font-black text-[#00B5B5] uppercase tracking-widest">
                  Learn Details
                  <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>

                {/* Card Glow Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00B5B5]/60 to-transparent transition-transform duration-500 scale-x-0 group-hover:scale-x-100 rounded-b-[2.5rem]" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
