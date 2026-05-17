import { Quote, Star } from 'lucide-react';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatarUrl?: string;
}

const Testimonial = ({ name, role, content, rating, avatarUrl }: TestimonialProps) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-lg shadow-slate-200/10 relative hover:shadow-2xl hover:shadow-[#00B5B5]/5 hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between h-full">
      {/* Premium Gradient Quote Watermark */}
      <div className="absolute top-8 right-10 text-[#00B5B5]/10 group-hover:text-[#00B5B5]/20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
        <Quote size={48} className="fill-current" />
      </div>
      
      <div>
        {/* Star Rating Section with premium layout */}
        <div className="flex items-center gap-1.5 mb-6 bg-slate-50 border border-slate-100/60 px-3 py-1.5 rounded-xl w-fit">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14}
              className={`${i < rating ? 'text-amber-500 fill-current' : 'text-slate-200'}`} 
            />
          ))}
          <span className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-wider">{rating}.0 / 5.0</span>
        </div>

        {/* Soothing Patient Quote */}
        <p className="text-slate-600 italic mb-8 leading-relaxed text-base font-medium relative z-10">
          &ldquo;{content}&rdquo;
        </p>
      </div>

      {/* Patient Biography Footer */}
      <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-50 ring-4 ring-slate-100/50 group-hover:ring-[#00B5B5]/20 shadow-sm transition-all duration-500">
            <img 
              src={avatarUrl || `https://ui-avatars.com/api/?name=${name}&background=random`} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
        <div>
          <h4 className="text-slate-900 font-extrabold text-sm tracking-tight">{name}</h4>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
