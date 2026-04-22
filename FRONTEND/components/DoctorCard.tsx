import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Star, Clock, MapPin, CheckCircle } from 'lucide-react';
import { getAvatarFallback, resolveImageUrl } from '@/lib/resolveImageUrl';

interface DoctorCardProps {
  id: string;
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
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative">
          <img 
            src={imgSrc}
            alt={name}
            onError={() => setImgSrc(fallbackAvatar)}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-gray-50 group-hover:ring-primary/10 transition-all"
          />
          <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md">
            <CheckCircle className="w-5 h-5 text-healthcare-teal fill-current text-white" />
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-primary font-semibold text-sm">{specialization}</p>
            </div>
            <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <Star className="w-3 h-3 mr-1 fill-current" /> {rating} ({reviews} Reviews)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span>{experience} Yrs Exp.</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{location} {distance !== undefined && `(${ (distance / 1000).toFixed(1) } km)`}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-50 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Next Available</p>
              <p className="text-sm font-semibold text-gray-700">{availability}</p>
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              <Link
                href={`/doctors/${id}`}
                className="w-full sm:w-auto text-center border border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-all"
              >
                View Profile
              </Link>
              <Link
                href={`/appointments?doctorId=${id}`}
                className="w-full sm:w-auto text-center bg-gray-900 hover:bg-primary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
