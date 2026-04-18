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
    <section className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">How It Works</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">3 Simple Steps to Better Health</h3>
          <p className="text-gray-500 text-lg">We&apos;ve simplified the process of seeking medical care, so you can focus on what matters most—your recovery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-gray-200 -z-10" />
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className={`w-20 h-20 ${step.color} rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-current/5 group-hover:scale-110 transition-transform duration-300 relative bg-white`}>
                <step.icon className="w-10 h-10" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h4>
              <p className="text-gray-500 leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
