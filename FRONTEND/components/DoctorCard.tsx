import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Star, Clock, MapPin, CheckCircle } from 'lucide-react';
import { getAvatarFallback, resolveImageUrl } from '@/lib/resolveImageUrl';

interface DoctorCardProps {
  id: string;
  slug?: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews: number;
  avatarUrl?: string;
  location: string;
  availability: string;
  distance?: number;
}

const DoctorCard = ({
  id,
  slug,
  name,
  specialization,
  experience,
  rating,
  reviews,
  avatarUrl,
  location,
  availability,
  distance
}: DoctorCardProps) => {
  const fallbackAvatar = useMemo(() => getAvatarFallback(name), [name]);
  const initialAvatar = useMemo(() => resolveImageUrl(avatarUrl) || fallbackAvatar, [avatarUrl, fallbackAvatar]);
  const [imgSrc, setImgSrc] = useState(initialAvatar);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative shrink-0">
          <img 
            src={imgSrc}
            alt={name}
            onError={() => setImgSrc(fallbackAvatar)}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] object-cover ring-4 ring-slate-50 group-hover:ring-[#00B5B5]/20 transition-all duration-500"
          />
          <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-lg border border-slate-50">
            <CheckCircle className="w-5 h-5 text-[#00B5B5] fill-[#F0FDFD]" />
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
            <div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-[#00B5B5] transition-colors leading-tight mb-1">{name}</h3>
              <p className="text-[#00B5B5] font-black text-xs uppercase tracking-widest">{specialization}</p>
            </div>
            <div className="bg-[#F0FDFD] text-[#00B5B5] px-4 py-1.5 rounded-full text-xs font-black flex items-center border border-[#E0F7F7]">
              <Star className="w-3 h-3 mr-1.5 fill-current" /> {rating} ({reviews})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-slate-500 text-[13px] font-bold">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 text-slate-400 group-hover:text-[#00B5B5] transition-colors">
                <Clock size={16} />
              </div>
              <span>{experience} Yrs Exp.</span>
            </div>
            <div className="flex items-center text-slate-500 text-[13px] font-bold">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 text-slate-400 group-hover:text-[#00B5B5] transition-colors">
                <MapPin size={16} />
              </div>
              <span className="truncate max-w-[120px]">{location}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-slate-100 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.15em] mb-1">Status</p>
              <p className="text-xs font-black text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {availability}
              </p>
            </div>
            <div className="w-full sm:w-auto flex gap-3">
              <Link
                href={`/doctors/${slug || id}`}
                className="flex-1 sm:flex-none text-center border-2 border-slate-100 hover:border-[#00B5B5] text-slate-900 px-6 h-12 flex items-center justify-center rounded-full font-black text-sm transition-all"
              >
                Profile
              </Link>
              <Link
                href={`/appointments?doctorId=${slug || id}`}
                className="flex-1 sm:flex-none text-center bg-[#00B5B5] hover:bg-[#009A9A] text-white px-8 h-12 flex items-center justify-center rounded-full font-black text-sm transition-all shadow-lg shadow-[#00B5B5]/10"
              >
                Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
