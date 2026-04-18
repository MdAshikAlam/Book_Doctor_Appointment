import SearchBar from './SearchBar';
import { User } from 'lucide-react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

const Hero = ({ 
  title = "Your Health Is Our Top Priority", 
  subtitle = "Find and book appointments with top-rated doctors in your city. Quick, easy, and secure healthcare at your fingertips.",
}: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-healthcare-teal/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Text Content */}
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Available 24/7 For You</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              {title}
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              {subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <SearchBar />
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-8">
              <div className="flex -space-x-2 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src={`https://ui-avatars.com/api/?name=Dr+${i}&background=random`}
                    alt={`Doctor ${i}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">1,200+</span> Top Doctors Nearby
              </p>
            </div>
          </div>

          {/* Image/Visual Component */}
          <div className="relative w-full max-w-lg lg:max-w-xl">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop" 
                alt="Healthcare Professional"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
              
              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-healthcare-teal rounded-full flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Appointment Booked!</p>
                    <p className="text-xs text-gray-500">Dr. Sarah Johnson, Cardiologist</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Geometric Shapes */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-2xl -z-10 animate-pulse" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-healthcare-teal/30 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
