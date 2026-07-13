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

const stepStyles = [
  { bg: "bg-orange-50", text: "text-orange-600" },
  { bg: "bg-blue-50", text: "text-blue-600" },
  { bg: "bg-green-50", text: "text-green-600" }
];

const HowItWorks = () => {
  return (
    <Section className="bg-[#F8FCFB] relative overflow-hidden border-y border-slate-100/50">
      {/* Absolute Soothing Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#0E7C66]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#0E7C66]/5 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10">
        {/* Soothing Header - H2 */}
        <SectionHeader 
          title={
            <span>
              Book a Doctor in <span className="bg-gradient-to-r from-[#0E7C66] to-[#0b3d2f] bg-clip-text text-transparent">3 Simple Steps</span>
            </span>
          }
        />

        {/* Dynamic Connected Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const style = stepStyles[index];
            return (
              <Card 
                key={index}
                className="group relative flex flex-col justify-between"
              >
                <div>
                  {/* Floating Number Overlay */}
                  <div className="absolute top-8 right-10 text-8xl font-black text-slate-100 select-none group-hover:text-[#0E7C66]/5 transition-colors pointer-events-none">
                    0{index + 1}
                  </div>

                  {/* Icon Container with custom bg */}
                  <div className={`w-16 h-16 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center mb-8 relative z-10 transition-all duration-500 group-hover:scale-105`}>
                    <Icon size={32} />
                  </div>

                  {/* Title - Card Title must use H3 */}
                  <h3 className="font-h3 text-slate-900 group-hover:text-[#0E7C66] transition-colors leading-tight">
                    {step.title}
                  </h3>

                  {/* Description - Card Descriptions must use body text */}
                  <p className="font-body-secondary text-slate-400 group-hover:text-slate-500 transition-colors">
                    {step.description}
                  </p>
                </div>

                {/* Card Glow Border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0E7C66]/60 to-transparent transition-transform duration-500 scale-x-0 group-hover:scale-x-100 rounded-b-[18px]" />
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorks;
