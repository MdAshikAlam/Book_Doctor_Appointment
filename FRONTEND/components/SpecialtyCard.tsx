import { LucideIcon, ArrowRight } from 'lucide-react';

interface SpecialtyCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  onClick?: () => void;
  isActive?: boolean;
}

const SpecialtyCard = ({ name, icon: Icon, count, onClick, isActive }: SpecialtyCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[2.5rem] p-10 border-2 transition-all duration-500 group cursor-pointer text-center relative overflow-hidden ${
        isActive 
          ? 'border-[#00B5B5] shadow-2xl shadow-[#00B5B5]/10 bg-[#F0FDFD]' 
          : 'border-slate-50 hover:border-[#00B5B5]/30 hover:shadow-2xl hover:shadow-[#00B5B5]/5'
      }`}
    >
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-500 relative z-10 ${
        isActive ? 'bg-[#00B5B5] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-[#00B5B5] group-hover:text-white group-hover:shadow-xl group-hover:shadow-[#00B5B5]/20'
      }`}>
        <Icon size={32} className="group-hover:rotate-12 transition-all duration-500" />
      </div>

      <h3 className={`text-xl font-black mb-3 transition-colors relative z-10 ${
        isActive ? 'text-slate-900' : 'text-slate-900 group-hover:text-[#00B5B5]'
      }`}>
        {name}
      </h3>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest group-hover:bg-[#E0F7F7] group-hover:text-[#00B5B5] transition-all relative z-10">
        {count}+ Doctors
      </div>

      <div className={`mt-8 pt-8 border-t border-slate-50 transition-all duration-500 relative z-10 ${
        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'
      }`}>
        <span className="text-[#00B5B5] text-sm font-black flex items-center justify-center gap-2 uppercase tracking-widest">
          {isActive ? 'Selected Specialty' : 'Find Specialists'} 
          <ArrowRight size={16} />
        </span>
      </div>

      {/* Decorative Gradient Background on Active */}
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B5B5]/5 rounded-full blur-3xl -mr-16 -mt-16" />
      )}
    </div>
  );
};

export default SpecialtyCard;
