import { LucideIcon } from 'lucide-react';

interface SpecialtyCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
}

const SpecialtyCard = ({ name, icon: Icon, count }: SpecialtyCardProps) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group cursor-pointer text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
        <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="text-gray-500 text-sm font-medium">
        {count}+ Doctors
      </p>
      <div className="mt-6 pt-6 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-primary text-sm font-bold flex items-center justify-center">
          Learn More <span className="ml-2">→</span>
        </span>
      </div>
    </div>
  );
};

export default SpecialtyCard;
