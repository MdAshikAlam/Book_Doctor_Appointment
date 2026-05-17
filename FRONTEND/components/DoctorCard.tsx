import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Star, Clock, MapPin, CheckCircle, Navigation } from 'lucide-react';
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

  // Formatted distance display for local specialists
  const formattedDistance = useMemo(() => {
    if (distance === undefined) return null;
    if (distance < 1000) return `${distance.toFixed(0)} m away`;
    return `${(distance / 1000).toFixed(1)} km away`;
  }, [distance]);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-lg shadow-slate-200/20 hover:shadow-2xl hover:shadow-[#00B5B5]/10 hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Profile Avatar Container with premium border ring */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2.2rem] overflow-hidden bg-slate-50 ring-4 ring-slate-100/50 group-hover:ring-[#00B5B5]/20 shadow-sm transition-all duration-500">
            <img 
              src={imgSrc}
              alt={name}
              onError={() => setImgSrc(fallbackAvatar)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          {/* Verified Badge */}
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-slate-50 animate-bounce duration-[4000ms]">
            <CheckCircle size={18} className="text-[#00B5B5] fill-[#F0FDFD]" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-grow w-full text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#00B5B5] transition-colors leading-tight mb-1">
                {name}
              </h3>
              <p className="text-[#00B5B5] font-black text-[10px] uppercase tracking-widest leading-none">
                {specialization}
              </p>
            </div>
            {/* Rating badge */}
            <div className="bg-[#F0FDFD] text-[#00B5B5] px-3 py-1 rounded-xl text-[11px] font-black flex items-center border border-[#E0F7F7] shrink-0 mt-2 sm:mt-0">
              <Star size={12} className="mr-1 fill-current text-amber-500" /> {rating} ({reviews})
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center sm:justify-start text-slate-500 text-xs font-bold gap-2">
              <Clock size={14} className="text-slate-400" />
              <span>{experience} Yrs Exp</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start text-slate-500 text-xs font-bold gap-2">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[100px]">{location}</span>
            </div>
            {formattedDistance && (
              <div className="col-span-2 flex items-center justify-center sm:justify-start text-[#00B5B5] text-[11px] font-black uppercase tracking-widest gap-2 pt-1.5 border-t border-slate-100/60">
                <Navigation size={12} className="animate-pulse" />
                <span>{formattedDistance}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-slate-100 gap-4 mt-2">
        <div className="text-center sm:text-left shrink-0">
          <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.15em] mb-1">Clinic Status</p>
          <p className="text-xs font-black text-emerald-500 flex items-center gap-1 justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {availability}
          </p>
        </div>
        <div className="w-full sm:w-auto flex gap-2.5">
          <Link
            href={`/doctors/${slug || id}`}
            className="flex-1 sm:flex-none text-center border border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50 px-5 h-11 flex items-center justify-center rounded-xl font-bold text-xs transition-all"
          >
            Profile
          </Link>
          <Link
            href={`/bookings?doctorId=${id}`}
            className="flex-1 sm:flex-none text-center bg-[#00B5B5] hover:bg-[#009A9A] text-white px-6 h-11 flex items-center justify-center rounded-xl font-black text-xs transition-all shadow-md shadow-[#00B5B5]/15"
          >
            Book Slot
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
