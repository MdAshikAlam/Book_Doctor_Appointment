import React from 'react';
import { Search, Calendar, CheckCircle2 } from 'lucide-react';
import Section from './ui/Section';
import Container from './ui/Container';
import SectionHeader from './ui/SectionHeader';
import Card from './ui/Card';

const steps = [
  {
    title: "Search Doctors Near You",
    description: "Use your location to find verified doctors and clinics nearby.",
    icon: Search
  },
  {
    title: "Compare & Select",
    description: "Review doctor profiles, consultation fees, ratings, experience, and clinic details.",
    icon: Calendar
  },
  {
    title: "Book Appointment",
    description: "Select an available slot and confirm your appointment instantly.",
    icon: CheckCircle2
  }
];

const HowItWorks = () => {
  return (
    <Section className="bg-gradient-to-b from-[#F0FDFD]/20 via-[#F9FCFC] to-[#F0FDFD]/20 relative overflow-hidden">
      {/* Absolute Soothing Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#00B5B5]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00B5B5]/5 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Soothing Header - H2 */}
        <SectionHeader 
          title={
            <span>
              Book a Doctor in <span className="bg-gradient-to-r from-[#00B5B5] to-[#008F8F] bg-clip-text text-transparent">3 Simple Steps</span>
            </span>
          }
        />

        {/* Dynamic Connected Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index}
                className="group relative flex flex-col justify-between"
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

                  {/* Title - Card Title must use H3 */}
                  <h3 className="font-h3 text-slate-900 group-hover:text-[#00B5B5] transition-colors leading-tight">
                    {step.title}
                  </h3>

                  {/* Description - Card Descriptions must use body text */}
                  <p className="font-body-secondary text-slate-400 group-hover:text-slate-500 transition-colors">
                    {step.description}
                  </p>
                </div>

                {/* Card Glow Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00B5B5]/60 to-transparent transition-transform duration-500 scale-x-0 group-hover:scale-x-100 rounded-b-[24px]" />
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorks;
