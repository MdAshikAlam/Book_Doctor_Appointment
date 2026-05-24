import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#F0FDFD] pt-8 pb-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} />




      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left Content */}
          <div className="max-w-2xl text-center lg:text-left">


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
