import { ArrowRight, Info, Calendar } from 'lucide-react';

interface CTAProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

const CTA = ({
  title = "Ready to Book Your First Appointment?",
  subtitle = "Join thousands of satisfied patients who have found their perfect doctor through BookMyDoctor. Experience healthcare that actually works for you.",
  primaryButtonText = "Find a Doctor Now",
  secondaryButtonText = "Learn More"
}: CTAProps) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl shadow-primary/20">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white/5 rounded-full blur-xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-grow text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                {title}
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all transform hover:-translate-y-1 shadow-lg">
                  {primaryButtonText} <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="w-full sm:w-auto bg-transparent border-2 border-white/30 hover:border-white text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all">
                  <Info className="mr-2 w-5 h-5" /> {secondaryButtonText}
                </button>
              </div>
            </div>

            <div className="w-full max-w-sm lg:max-w-md hidden md:block">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">24/7 Support</h4>
                    <p className="text-white/60 text-sm">We are here for you anytime</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-4 bg-white/10 rounded-full w-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                  <div className="h-4 bg-white/10 rounded-full w-2/3 animate-pulse" />
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
