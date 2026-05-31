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
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full bg-clip-border">
      
      {/* Premium Gradient Glow Overlay */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      
      {/* Top Banner tags (e.g. AI Recommended, Emergency, Video Consultation) */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {rating >= 4.8 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/50 text-amber-700 text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={10} className="fill-amber-500 text-amber-500" />
            AI Recommended
          </span>
        )}
        {emergencyConsultation && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/50 text-rose-700 text-[10px] font-black uppercase tracking-wider animate-pulse">
            <PhoneCall size={10} />
            Emergency
          </span>
        )}
        {insuranceAccepted && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={10} />
            Insurance
          </span>
        )}
      </div>

      {/* Main Info Row */}
      <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
        {/* Profile Avatar with status ring */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 ring-4 ring-slate-100 group-hover:ring-primary/20 shadow-md transition-all duration-500">
            <img 
              src={imgSrc}
              alt={displayName}
              onError={() => setImgSrc(fallbackAvatar)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          {/* Verified Badge */}
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg border border-slate-50">
            <CheckCircle size={18} className="text-[#00B5B5] fill-[#F0FDFD]" />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-grow w-full text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2 gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1">
                {displayName}
              </h3>
              <p className="text-primary font-black text-[10px] uppercase tracking-widest">
                {specialization}
              </p>
            </div>
            {/* Rating badge */}
            <div className="bg-[#F0FDFD] text-primary px-3 py-1 rounded-xl text-xs font-black flex items-center border border-[#E0F7F7] shrink-0">
              <Star size={12} className="mr-1 fill-amber-500 text-amber-500" /> 
              {rating.toFixed(1)} 
              <span className="text-slate-400 font-bold ml-1">({reviews})</span>
            </div>
          </div>

          {/* Core Hospital Details */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 font-bold mb-3">
            <Building2 size={13} className="text-slate-400" />
            <span>{clinicName}</span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold justify-center sm:justify-start">
              <Clock size={14} className="text-slate-400" />
              <span>{experience} Yrs Exp</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold justify-center sm:justify-start">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[110px]" title={location}>{location}</span>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5 pt-2 border-t border-slate-200/50">
              {/* Distance Display */}
              {formattedDistance && (
                <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-wider justify-center sm:justify-start">
                  <Navigation size={12} className="animate-pulse" />
                  <span>{formattedDistance}</span>
                </div>
              )}
              
              {/* Consultation Fee Display */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 mt-1">
                <span>Fee</span>
                <span className="text-slate-900 font-black text-sm">₹{consultationFee}</span>
              </div>

              {/* Languages Display */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-1 justify-center sm:justify-start">
                <Languages size={12} className="text-slate-400 shrink-0" />
                <span className="truncate max-w-[200px]" title={languages.join(', ')}>
                  {languages.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online / Offline Badges */}
      <div className="my-4 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-bold">
        <span className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Consultation Mode</span>
        <div className="flex gap-2">
          {videoConsultation ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-black">
              <Video size={10} /> Online
            </span>
          ) : null}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black">
            In-Clinic
          </span>
        </div>
      </div>

      {/* Availability Section */}
      <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Calendar size={13} className="text-slate-400" />
            <span>Next Available Slot</span>
          </div>
          {isAvailableToday && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
              Today
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-xs font-black text-slate-900 leading-none">
            {nextSlot || availability}
          </p>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider">
            <Zap size={8} className="fill-amber-600 text-amber-600" />
            Instant
          </span>
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100/60 relative z-10">
        <Link
          href={`/doctors/${slug || id}`}
          className="btn-secondary-custom flex-1 !h-11 !min-w-0 !px-0 text-center font-bold text-xs"
        >
          View Profile
        </Link>
        <Link
          href={`/appointments?doctorId=${id}`}
          className="btn-primary-custom flex-[1.5] !h-11 !min-w-0 !px-0 text-center font-black text-xs"
        >
          Book Appointment
        </Link>
      </div>

    </div>
  );
};

export default DoctorCard;
