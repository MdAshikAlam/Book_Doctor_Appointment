import { LucideIcon, ArrowRight, Sparkles } from 'lucide-react';

interface SpecialtyCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  onClick?: () => void;
  isActive?: boolean;
}

const getSpecialtyDescription = (name: string) => {
  if (name.includes('Cardiology')) return 'Comprehensive cardiovascular diagnostics, advanced heart health management, and preventive care.';
  if (name.includes('Neurology')) return 'Elite neurological assessments, brain function analytics, and neuromuscular therapies.';
  if (name.includes('Pediatrics')) return 'Gentle, expert healthcare services tailored for infants, children, and growing adolescents.';
  if (name.includes('Orthopedics')) return 'Elite bone, joint, and muscle therapies, skeletal reconstruction, and physical recovery.';
  if (name.includes('Dermatology')) return 'Advanced clinical skin treatments, restorative therapies, and cosmetic dermatology.';
  if (name.includes('Eye Specialist')) return 'Comprehensive ophthalmic care, visual acuity correction, and advanced eye health management.';
  if (name.includes('ENT')) return 'Specialized care for ear, nose, throat, head and neck conditions, and hearing wellness.';
  if (name.includes('Dentist')) return 'Comprehensive dental care, preventive teeth cleaning, cavity treatment, and orthodontic wellness.';
  if (name.includes('General Physician')) return 'Holistic health consultations, family medicine, preventative check-ups, and wellness advice.';
  return 'Highly trained medical professionals delivering next-gen diagnostics and specialized therapy.';
};

const SpecialtyCard = ({ name, icon: Icon, count, onClick, isActive }: SpecialtyCardProps) => {
  const description = getSpecialtyDescription(name);
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[2rem] p-8 border border-slate-100 transition-all duration-500 group cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${
        isActive 
          ? 'border-[#00B5B5]/50 shadow-2xl shadow-[#00B5B5]/10 bg-gradient-to-b from-[#F0FDFD] to-white' 
          : 'hover:border-[#00B5B5]/30 hover:shadow-xl hover:shadow-[#00B5B5]/5 hover:-translate-y-2'
      }`}
    >
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div>
        {/* Top bar with Icon */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
            isActive 
              ? 'bg-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/30' 
              : 'bg-slate-50 text-[#00B5B5] border border-slate-100 group-hover:bg-[#00B5B5] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#00B5B5]/25 group-hover:scale-105'
          }`}>
            <Icon size={26} className="group-hover:rotate-12 transition-transform duration-500" />
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xl font-extrabold mb-3 transition-colors relative z-10 leading-snug tracking-tight ${
          isActive ? 'text-slate-900' : 'text-slate-900 group-hover:text-[#00B5B5]'
        }`}>
          {name}
        </h3>

        {/* Enterprise Grade Description */}
        <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6 relative z-10 transition-colors group-hover:text-slate-500">
          {description}
        </p>
      </div>

      {/* Action Footer */}
      <div className={`pt-5 border-t border-slate-50 transition-all duration-500 relative z-10 ${
        isActive ? 'opacity-100 translate-y-0' : 'translate-y-2 group-hover:translate-y-0'
      }`}>
        <span className="text-[#00B5B5] text-xs font-black flex items-center gap-2 uppercase tracking-widest">
          {isActive ? 'Selected Specialty' : 'Find Specialists'} 
          <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
        </span>
      </div>

      {/* Glowing Bottom Border Accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00B5B5]/60 to-transparent transition-transform duration-500 scale-x-0 ${
        isActive ? 'scale-x-100' : 'group-hover:scale-x-100'
      }`} />
    </div>
  );
};

export default SpecialtyCard;
