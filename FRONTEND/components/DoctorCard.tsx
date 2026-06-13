import Link from 'next/link';
import { useMemo, useState } from 'react';
import { 
  Star, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Navigation, 
  Video, 
  Building2, 
  Languages, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  Zap,
  PhoneCall
} from 'lucide-react';
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
  
  // New/Advanced fields
  consultationFee?: number;
  languages?: string[];
  videoConsultation?: boolean;
  emergencyConsultation?: boolean;
  insuranceAccepted?: boolean;
  clinicName?: string;
  nextSlot?: string;
  isAvailableToday?: boolean;
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
  distance,
  consultationFee = 500,
  languages = ['English', 'Hindi'],
  videoConsultation = false,
  emergencyConsultation = false,
  insuranceAccepted = true,
  clinicName = 'Central Healthcare Clinic',
  nextSlot = 'Today, 04:30 PM',
  isAvailableToday = true
}: DoctorCardProps) => {
  const fallbackAvatar = useMemo(() => getAvatarFallback(name), [name]);
  const initialAvatar = useMemo(() => resolveImageUrl(avatarUrl) || fallbackAvatar, [avatarUrl, fallbackAvatar]);
  const [imgSrc, setImgSrc] = useState(initialAvatar);

  // Formatted distance display
  const formattedDistance = useMemo(() => {
    if (distance === undefined) return null;
    if (distance < 1000) return `${distance.toFixed(0)} m away`;
    return `${(distance / 1000).toFixed(1)} km away`;
  }, [distance]);

  const displayName = name.startsWith('Dr. ') ? name : `Dr. ${name}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-100/80 p-5 shadow-lg shadow-slate-100/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full bg-clip-border">
      
      {/* Decorative Gradient Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      
      <div>
        {/* Top Header Row: Avatar + Basic Info */}
        <div className="flex gap-4 items-start relative z-10 mb-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 ring-2 ring-slate-100/80 group-hover:ring-primary/20 shadow-sm transition-all duration-500">
              <img 
                src={imgSrc}
                alt={displayName}
                onError={() => setImgSrc(fallbackAvatar)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow border border-slate-50">
              <CheckCircle size={14} className="text-[#00B5B5] fill-[#F0FDFD]" />
            </div>
          </div>

          {/* Name & Specialization */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1 mb-1">
              <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-primary transition-colors leading-snug pr-1" title={displayName}>
                {displayName}
              </h3>
              {/* Rating */}
              <div className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center shrink-0 border border-amber-100">
                <Star size={10} className="mr-0.5 fill-amber-500 text-amber-500" /> 
                {rating.toFixed(1)}
              </div>
            </div>

            <p className="text-primary font-black text-[9px] uppercase tracking-widest leading-none mb-1.5">
              {specialization}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold leading-none">
              <Building2 size={11} className="text-slate-400 shrink-0" />
              <span>{clinicName}</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Clean 3-Column Key Stats Row */}
        <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-slate-50/60 rounded-2xl border border-slate-100/80 text-center mb-4 relative z-10">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Experience</p>
            <p className="text-xs font-extrabold text-slate-700">{experience} Yrs</p>
          </div>
          <div className="border-x border-slate-200/60">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
            <p className="text-xs font-extrabold text-slate-700 truncate px-1" title={location}>{location.split(',')[0]}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Fee</p>
            <p className="text-xs font-black text-slate-900">₹{consultationFee}</p>
          </div>
        </div>

        {/* Badge & Mode Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 relative z-10">
          <div className="flex flex-wrap gap-1.5">
            {videoConsultation ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-bold">
                <Video size={10} /> Online
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-slate-600 text-[10px] font-bold">
              In-Clinic
            </span>
          </div>

          {emergencyConsultation && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wide animate-pulse shrink-0">
              <PhoneCall size={9} /> Emergency
            </span>
          )}
        </div>

        {/* Languages & Distance Row */}
        {((languages && languages.length > 0) || formattedDistance) ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold border-t border-slate-100 pt-3 mb-4 relative z-10">
            {languages && languages.length > 0 ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <Languages size={12} className="text-slate-400 shrink-0" />
                <span className="truncate" title={languages.join(', ')}>
                  {languages.slice(0, 2).join(', ')}{languages.length > 2 ? '...' : ''}
                </span>
              </div>
            ) : <div />}
            {formattedDistance && (
              <div className="flex items-center gap-1 text-primary shrink-0 font-extrabold">
                <Navigation size={11} className="rotate-45" />
                <span>{formattedDistance}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Footer Area: Availability & Action Buttons */}
      <div className="relative z-10 border-t border-slate-100/80 pt-3.5 space-y-3">
        {/* Availability Banner */}
        <div className="flex items-center justify-between text-xs bg-emerald-50/40 border border-emerald-100/60 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <Calendar size={13} className="text-emerald-600" />
            <span>Next: <span className="text-slate-800 font-black">{nextSlot || availability}</span></span>
          </div>
          {isAvailableToday && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider shrink-0">
              Today
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/doctors/${slug || id}`}
            className="btn-secondary-custom flex-1 !h-10 !min-w-0 !px-0 text-center font-bold text-xs shadow-sm"
          >
            Profile
          </Link>
          <Link
            href={`/appointments?doctorId=${id}`}
            className="btn-primary-custom flex-[1.4] !h-10 !min-w-0 !px-0 text-center font-black text-xs shadow-md shadow-primary/10"
          >
            Book Slot
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DoctorCard;
