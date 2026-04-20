import { LucideIcon } from 'lucide-react';

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
      className={`bg-white rounded-3xl p-8 border transition-all duration-300 group cursor-pointer text-center ${
        isActive 
          ? 'border-primary shadow-2xl shadow-primary/10 ring-1 ring-primary/20' 
          : 'border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5'
      }`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 shadow-inner ${
        isActive ? 'bg-primary text-white' : 'bg-gray-50 text-gray-900 group-hover:bg-primary group-hover:text-white'
      }`}>
        <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </div>
      <h3 className={`text-xl font-extrabold mb-2 transition-colors ${
        isActive ? 'text-primary' : 'text-gray-900 group-hover:text-primary'
      }`}>
        {name}
      </h3>
      <p className="text-gray-500 text-sm font-medium">
        {count}+ Doctors
      </p>
      <div className={`mt-6 pt-6 border-t border-gray-50 transition-all ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-primary text-sm font-bold flex items-center justify-center">
          {isActive ? 'Selected' : 'View Specialists'} <span className="ml-2">→</span>
        </span>
      </div>
    </div>
  );
};

export default SpecialtyCard;
