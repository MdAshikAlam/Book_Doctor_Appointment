import { Search, Calendar, CheckCircle } from 'lucide-react';

const steps = [
  {
    title: "Find Your Doctor",
    description: "Search for doctors by specialty, location, or insurance provider with our easy-to-use search tool.",
    icon: Search,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Book an Appointment",
    description: "Select a convenient time slot and book your appointment instantly without any phone calls.",
    icon: Calendar,
    color: "bg-teal-50 text-teal-600"
  },
  {
    title: "Get Quality Care",
    description: "Visit your doctor at the scheduled time and receive top-notch medical attention and follow-ups.",
    icon: CheckCircle,
    color: "bg-purple-50 text-purple-600"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-black text-[#00B5B5] uppercase tracking-[0.2em] mb-4">How It Works</h2>
          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">3 simple steps to better health</h3>
          <p className="text-slate-500 text-lg font-medium">We&apos;ve simplified the process of seeking medical care, so you can focus on what matters most—your recovery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-slate-50 -z-10 rounded-full" />
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-slate-200/50 group-hover:scale-110 transition-all duration-500 relative border-4 border-slate-50 group-hover:border-[#00B5B5]/20">
                <step.icon size={36} className="text-[#00B5B5]" />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#00B5B5] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-[#00B5B5]/20">
                  {index + 1}
                </div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h4>
              <p className="text-slate-500 leading-relaxed max-w-xs font-medium">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
