"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  MapPin, 
  Star, 
  BadgeDollarSign, 
  Briefcase, 
  Hospital, 
  CheckCircle, 
  ShieldCheck, 
  Languages, 
  Calendar, 
  Zap, 
  Phone, 
  Video, 
  Users, 
  GraduationCap, 
  Award, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ThumbsUp,
  MapPinned,
  Compass
} from "lucide-react";
import { getAvatarFallback, resolveImageUrl } from "@/lib/resolveImageUrl";
import { useAuth } from "@/context/AuthContext";

// Import global UI components
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type DoctorDetails = {
  _id: string;
  slug?: string;
  specialty?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
  address?: string;
  district?: string;
  state?: string;
  qualifications?: string[];
  availability?: { day: string; slots: string[] }[];
  rating?: number;
  numReviews?: number;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    gender?: string;
  };
  clinic?: {
    _id?: string;
    clinicName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    images?: string[];
    slug?: string;
  };
  videoConsultation?: boolean;
  emergencyConsultation?: boolean;
  insuranceAccepted?: boolean;
  languages?: string[];
};

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consult mode selection: 'clinic', 'video', 'phone'
  const [consultMode, setConsultMode] = useState<'clinic' | 'video' | 'phone'>('clinic');
  
  // Slots & Booking Date selectors
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  
  // FAQ section toggle state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Recommendations state
  const [similarDoctors, setSimilarDoctors] = useState<DoctorDetails[]>([]);

  // Reviews stateful list
  const [reviewsList, setReviewsList] = useState([
    { name: "Meera Nair", rating: 5, date: "May 24, 2026", text: "Dr. Sharma was extremely patient and listened to all my symptoms without rushing. Highly recommend her for dermatology concerns!" },
    { name: "Rahul Deshmukh", rating: 5, date: "May 18, 2026", text: "Excellent consultation. She explained the root cause of my skin condition very clearly. The prescribed medicine worked wonders." },
    { name: "Aditi Sen", rating: 4, date: "May 05, 2026", text: "Very professional doctor. The clinic is clean and sanitized. Slight waiting time of 15 minutes, but the consultation was top-notch." }
  ]);

  const [ratingDistribution, setRatingDistribution] = useState([
    { stars: 5, percent: 84 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 }
  ]);

  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Computed state for reviews count and average rating
  const averageRating = useMemo(() => {
    if (reviewsList.length === 0) return 0;
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviewsList.length).toFixed(1));
  }, [reviewsList]);

  const numReviews = reviewsList.length;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    const newReview = {
      name: user?.name || "Anonymous Patient",
      rating: userRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      text: userComment
    };

    setReviewsList(prev => [newReview, ...prev]);

    // Update distribution mock-wise
    setRatingDistribution(prev => prev.map(row => {
      if (row.stars === userRating) {
        return { ...row, percent: Math.min(100, row.percent + 4) };
      }
      return { ...row, percent: Math.max(0, row.percent - 1) };
    }));

    setUserComment("");
    setUserRating(5);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [customDays, setCustomDays] = useState<any[]>([]);

  // Generate date array for next 7 days starting today
  const next7Days = useMemo(() => {
    const days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        name: weekdays[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        formattedDate: d.toISOString().split("T")[0],
        fullLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  }, []);

  const allDays = useMemo(() => {
    return [...next7Days, ...customDays];
  }, [next7Days, customDays]);

  const handleCustomDateChange = (dateString: string) => {
    if (!dateString) return;
    
    const standardIndex = next7Days.findIndex(d => d.formattedDate === dateString);
    if (standardIndex !== -1) {
      setSelectedDateIndex(standardIndex);
      setSelectedSlot("");
      return;
    }

    const d = new Date(dateString);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const newCustomDay = {
      name: weekdays[d.getDay()],
      dayNum: d.getDate(),
      month: months[d.getMonth()],
      formattedDate: dateString,
      fullLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };

    setCustomDays([newCustomDay]);
    setSelectedDateIndex(7); // select the newly appended custom day
    setSelectedSlot("");
  };

  // Fetch Doctor Profile
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/doctors/${id}`);
        const data = await res.json();

        if (data.status === "success") {
          setDoctor(data.data.doctor);
        } else {
          throw new Error(data.message || "Failed to load doctor profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id]);

  // Fetch Similar Doctors
  useEffect(() => {
    if (doctor?.specialty) {
      fetch(`${API_BASE_URL}/doctors?specialty=${encodeURIComponent(doctor.specialty)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            const filtered = data.data.doctors.filter((d: any) => d._id !== doctor._id && d.slug !== doctor.slug);
            setSimilarDoctors(filtered.slice(0, 3));
          }
        })
        .catch(err => console.error("Error fetching similar doctors:", err));
    }
  }, [doctor]);

  // Handle auto-redirect if ID is used instead of slug
  useEffect(() => {
    if (doctor && id && doctor.slug && id !== doctor.slug) {
      window.history.replaceState(null, '', `/doctors/${doctor.slug}`);
    }
  }, [doctor, id]);

  // Available slots computed from selected date's day of week
  const activeDaySlots = useMemo(() => {
    if (!doctor || !doctor.availability) return [];
    const dateObj = allDays[selectedDateIndex];
    if (!dateObj) return [];
    const dayName = dateObj.name; // e.g. "Mon"
    
    const dayAvailability = doctor.availability.find(
      (a) => a.day.toLowerCase() === dayName.toLowerCase() || a.day.toLowerCase().startsWith(dayName.toLowerCase().slice(0, 3))
    );
    return dayAvailability ? dayAvailability.slots : [];
  }, [doctor, selectedDateIndex, allDays]);

  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const groupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    activeDaySlots.forEach((slot) => {
      const startTime = slot.split("-")[0].trim();
      const hour = parseInt(startTime.split(":")[0], 10);
      
      if (isNaN(hour)) {
        morning.push(slot);
      } else if (hour < 12) {
        morning.push(slot);
      } else if (hour >= 12 && hour < 16) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [activeDaySlots]);

  useEffect(() => {
    if (groupedSlots.morning.length > 0) {
      setActiveSession('morning');
    } else if (groupedSlots.afternoon.length > 0) {
      setActiveSession('afternoon');
    } else if (groupedSlots.evening.length > 0) {
      setActiveSession('evening');
    }
  }, [groupedSlots]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50/50">
        <Loader2 className="w-12 h-12 animate-spin text-[#00B5B5] mb-4" />
        <p className="text-slate-500 font-extrabold text-sm uppercase tracking-wider animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <Section className="min-h-[70vh] flex items-center">
        <Container className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
            <ShieldAlert size={40} />
          </div>
          <h1 className="font-h1 text-slate-900 mb-3">Unable to find profile</h1>
          <p className="font-body-primary text-slate-500 mb-8">{error || "Doctor profile not found"}</p>
          <Link href="/specialties" className="btn-primary-custom w-full">
            Browse All Specialists
          </Link>
        </Container>
      </Section>
    );
  }

  const doctorName = doctor.user?.name ? (doctor.user.name.startsWith("Dr. ") ? doctor.user.name : `Dr. ${doctor.user.name}`) : "Doctor Profile";
  const feesMap = {
    clinic: doctor.consultationFee ?? 500,
    video: Math.round((doctor.consultationFee ?? 500) * 0.9), // 10% discount for video
    phone: Math.round((doctor.consultationFee ?? 500) * 0.8), // 20% discount for phone
  };

  const handleBookingRedirect = () => {
    if (!selectedSlot) {
      alert("Please select a convenient time slot first.");
      return;
    }
    const dateStr = allDays[selectedDateIndex]?.formattedDate;
    if (!dateStr) return;
    router.push(`/appointments?doctorId=${doctor.slug || doctor._id}&date=${dateStr}&slot=${encodeURIComponent(selectedSlot)}&type=${consultMode}`);
  };


  const mockFaqs = [
    { q: `What is the consultation fee for ${doctorName}?`, a: `The consultation fee is ₹${feesMap.clinic} for physical clinic visits, ₹${feesMap.video} for online video consults, and ₹${feesMap.phone} for audio-only phone calls.` },
    { q: `Where does ${doctorName} practice?`, a: `${doctorName} practices at the state-of-the-art ${doctor.clinic?.clinicName || "Central Specialty Clinic"} located at ${doctor.clinic?.address || doctor.address || "Main City Road"}.` },
    { q: `Does the clinic have parking facilities?`, a: "Yes, the clinic provides designated secure car and two-wheeler parking for visiting patients." },
    { q: `How can I cancel or reschedule my appointment?`, a: "You can easily cancel or request reschedule by visiting your personal 'My Bookings' tab up to 2 hours before the scheduled time slot." }
  ];

  return (
    <Section className="bg-slate-50/50 py-10 relative">
      <Container>
        {/* Floating background blobs */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-[#00B5B5]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Outer Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Profile Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* HERO CARD */}
            <Card className="!flex-col md:!flex-row items-center md:items-start gap-8 bg-white border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              {/* Profile Image */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-50 ring-4 ring-slate-100/80 shadow-md">
                  <img
                    src={resolveImageUrl(doctor.user?.avatar) || getAvatarFallback(doctor.user?.name)}
                    alt={doctorName}
                    onError={(e) => {
                      e.currentTarget.src = getAvatarFallback(doctor.user?.name);
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg border border-slate-100">
                  <CheckCircle size={20} className="text-[#00B5B5] fill-[#F0FDFD]" />
                </div>
              </div>

              {/* Doctor Details info block */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="font-h1 text-2xl md:text-3xl text-slate-900 font-black tracking-tight">{doctorName}</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                      Verified Specialist
                    </span>
                  </div>
                  <p className="text-primary font-black uppercase tracking-widest text-xs md:text-sm">{doctor.specialty || "Specialist"}</p>
                </div>

                {/* Micro metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Experience</p>
                    <p className="text-sm font-black text-slate-800">{doctor.experience ?? 0}+ Years</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Rating</p>
                    <p className="text-sm font-black text-slate-800 flex items-center justify-center gap-1">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      {(doctor.rating ?? 4.8).toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Patients</p>
                    <p className="text-sm font-black text-slate-800">2K+ Treated</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100/60 p-3 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fees</p>
                    <p className="text-sm font-black text-slate-800">₹{feesMap.clinic}</p>
                  </div>
                </div>

                {/* Additional Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                  {doctor.insuranceAccepted !== false && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                      <ShieldCheck className="text-emerald-500 w-4 h-4" /> Insurances Accepted
                    </span>
                  )}
                  {doctor.languages && doctor.languages.length > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                      <Languages className="text-[#00B5B5] w-4 h-4" /> Languages: {doctor.languages.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* CONSULTATION MODE SWITCHER */}
            <div className="bg-white border border-slate-100 shadow-xl shadow-slate-100/50 p-6 rounded-[2rem] space-y-4">
              <h2 className="text-lg font-black text-slate-900">Select Consultation Mode</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setConsultMode("clinic")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                    consultMode === "clinic"
                      ? "bg-teal-50/50 border-[#00B5B5] text-[#00B5B5] shadow-md shadow-teal-500/5"
                      : "bg-white border-slate-100 hover:border-slate-200 text-slate-500"
                  }`}
                >
                  <Hospital className="w-6 h-6 mb-2" />
                  <span className="text-xs font-black uppercase tracking-wider">In-Clinic</span>
                  <span className="text-[10px] font-bold mt-1 text-slate-600">₹{feesMap.clinic}</span>
                </button>

                <button
                  type="button"
                  disabled
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed relative overflow-hidden"
                >
                  <Video className="w-6 h-6 mb-2 text-slate-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Video</span>
                  <span className="text-[9px] font-black mt-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Coming Soon</span>
                </button>

                <button
                  type="button"
                  disabled
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed relative overflow-hidden"
                >
                  <Phone className="w-6 h-6 mb-2 text-slate-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Audio Phone</span>
                  <span className="text-[9px] font-black mt-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Coming Soon</span>
                </button>
              </div>
            </div>

            {/* DETAILS ACCORDION/SECTION */}
            <div className="bg-white border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-8 rounded-[2rem] space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-3">About Doctor</h2>
                <p className="font-body-secondary text-slate-600 leading-relaxed text-sm md:text-base">
                  {doctor.bio || "Dr. Sharma is a renowned expert in general specialty, bringing decades of stellar experience, advanced medical expertise, and patient-first methodologies."}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Qualifications & Education */}
                <div className="space-y-4">
                  <h3 className="text-md font-black text-slate-800 flex items-center gap-2">
                    <GraduationCap className="text-[#00B5B5] w-5 h-5" /> Education & Qualifications
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600 font-bold">
                    {doctor.qualifications && doctor.qualifications.length > 0 ? (
                      doctor.qualifications.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00B5B5] mt-2 shrink-0" />
                          <span>{q}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00B5B5] mt-2 shrink-0" />
                          <span>MBBS, MD - Dermatology & Venereology</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00B5B5] mt-2 shrink-0" />
                          <span>Fellowship in Aesthetic Dermatology</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Certifications & Memberships */}
                <div className="space-y-4">
                  <h3 className="text-md font-black text-slate-800 flex items-center gap-2">
                    <Award className="text-[#00B5B5] w-5 h-5" /> Certifications & Awards
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600 font-bold">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00B5B5] mt-2 shrink-0" />
                      <span>Certified Medical Practitioner - Board of Health</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00B5B5] mt-2 shrink-0" />
                      <span>Life Member - National Academy of Dermatologists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00B5B5] mt-2 shrink-0" />
                      <span>Distinguished Academic Excellence Award 2024</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CLINIC SECTION */}
            <div className="bg-white border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-8 rounded-[2rem] space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Clinic Information</h2>
                  <p className="text-xs font-bold text-[#00B5B5] flex items-center gap-1">
                    <Hospital className="w-3.5 h-3.5" />
                    {doctor.clinic?.clinicName || "Central Specialty Clinic"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider">
                    Open Today
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold">
                    1.4 km away
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4 font-body-secondary text-slate-600 text-sm">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="font-bold">{[doctor.clinic?.address, doctor.clinic?.city, doctor.clinic?.state].filter(Boolean).join(", ") || doctor.address || "Clinic Address Location"}</span>
                  </p>
                  <p className="flex items-center gap-2.5 font-bold">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>09:00 AM - 07:00 PM</span>
                  </p>
                  
                  {/* Clinic Highlights */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinic Highlights</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-slate-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-100 text-slate-600">
                        🚗 Free Parking
                      </span>
                      <span className="bg-slate-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-100 text-slate-600">
                        ♿ Wheelchair Access
                      </span>
                      <span className="bg-slate-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-100 text-slate-600">
                        💊 Pharmacy Shop
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clinic Visual representation */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm h-48 bg-slate-100">
                  {doctor.clinic?.images?.[0] ? (
                    <img
                      src={resolveImageUrl(doctor.clinic.images[0]) || undefined}
                      alt="Clinic Room"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400">
                      <MapPinned size={36} className="text-[#00B5B5] mb-2" />
                      <p className="text-xs font-bold text-slate-500">Interactive Map Directions</p>
                      <span className="text-[10px] text-slate-400">Click below to locate via Google Maps</span>
                    </div>
                  )}
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.clinic?.clinicName || "Doctor Clinic")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 shadow-lg text-xs font-black flex items-center gap-1.5 transition-all"
                  >
                    <Compass size={13} className="text-[#00B5B5]" /> Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="bg-white border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-8 rounded-[2rem] space-y-6">
              <h2 className="text-xl font-black text-slate-900">Patient Reviews & Ratings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-100 pb-6">
                {/* Score badge */}
                <div className="md:col-span-4 text-center space-y-1">
                  <p className="text-4xl md:text-5xl font-black text-slate-900">{averageRating.toFixed(1)}</p>
                  <div className="flex justify-center text-amber-400">
                    <Star className="fill-amber-500 text-amber-500 w-5 h-5" />
                    <Star className="fill-amber-500 text-amber-500 w-5 h-5" />
                    <Star className="fill-amber-500 text-amber-500 w-5 h-5" />
                    <Star className="fill-amber-500 text-amber-500 w-5 h-5" />
                    <Star className="fill-amber-500 text-amber-500 w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold">{numReviews} Verified Ratings</p>
                </div>

                {/* Progress bars breakdown */}
                <div className="md:col-span-8 space-y-1.5">
                  {ratingDistribution.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-slate-500 font-bold text-right">{row.stars} Star</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#00B5B5] h-full rounded-full" style={{ width: `${row.percent}%` }} />
                      </div>
                      <span className="w-8 text-slate-400 font-bold">{row.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Submission Form */}
              <div className="bg-slate-50/30 p-6 rounded-3xl border border-slate-100/80 space-y-5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#00B5B5]" /> Share Your Experience
                </h3>
                
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {submitSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl text-center">
                        Thank you! Your rating and review have been submitted successfully.
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-500">Your Rating:</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="text-amber-400 focus:outline-none transition-all active:scale-90 hover:scale-110"
                          >
                            <Star 
                              className={`w-7 h-7 transition-colors ${
                                star <= userRating ? "fill-amber-500 text-amber-500" : "text-slate-200"
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Write your review here... How was your consultation experience?"
                        rows={3}
                        required
                        className="w-full bg-white border border-slate-200 focus:border-[#00B5B5] focus:ring-1 focus:ring-[#00B5B5] rounded-2xl p-4 text-xs md:text-sm font-medium outline-none transition-all resize-none text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary-custom !py-2.5 !px-5 text-xs font-black uppercase tracking-wider block ml-auto"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs text-slate-500 font-bold">Please log in to your account to write a review and give a rating for this doctor.</p>
                    <Link
                      href="/appointments"
                      className="btn-secondary-custom inline-block !py-2 !px-4 text-xs font-black uppercase tracking-wider"
                    >
                      Log In / Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Review Comments list */}
              <div className="space-y-4">
                {reviewsList.map((r, idx) => (
                  <div key={idx} className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100/50 flex gap-4 items-start hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-[#00B5B5]/10 text-[#00B5B5] flex items-center justify-center font-black text-sm shrink-0 uppercase">
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                            {r.name}
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-50 text-[9px] font-black text-[#00B5B5] uppercase tracking-wider">
                              Verified Patient
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">{r.date}</p>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < r.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm font-body-secondary text-slate-600 leading-relaxed italic">"{r.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-8 rounded-[2rem] space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-xs text-slate-400 font-bold">Frequently asked queries about scheduling, pricing, and consultation methods.</p>
              </div>

              <div className="space-y-3">
                {mockFaqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full flex justify-between items-center p-4 bg-slate-50/30 hover:bg-slate-50 text-left transition-colors"
                      >
                        <h3 className="text-xs md:text-sm font-black text-slate-800">{faq.q}</h3>
                        {isOpen ? (
                          <ChevronUp size={16} className="text-[#00B5B5] shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white border-t border-slate-100/50 text-xs md:text-sm font-body-secondary text-slate-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECOMMENDATIONS (SIMILAR DOCTORS) */}
            {similarDoctors.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900">Similar Doctors You May Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarDoctors.map((doc) => {
                    const docTitle = doc.user?.name ? (doc.user.name.startsWith("Dr. ") ? doc.user.name : `Dr. ${doc.user.name}`) : "Doctor Specialist";
                    return (
                      <div key={doc._id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-lg flex items-center justify-between gap-4 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={resolveImageUrl(doc.user?.avatar) || getAvatarFallback(doc.user?.name)}
                            alt={docTitle}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-slate-100 group-hover:ring-[#00B5B5]/20 transition-all"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate group-hover:text-[#00B5B5] transition-colors">
                              <Link href={`/doctors/${doc.slug || doc._id}`}>{docTitle}</Link>
                            </p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">{doc.specialty}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-bold">
                              <span className="flex items-center gap-0.5"><Briefcase size={12} className="text-slate-400" /> {doc.experience}+ Yrs</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="flex items-center gap-0.5 text-slate-700"><Star size={12} className="text-amber-500 fill-amber-500" /> {(doc.rating ?? 4.8).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/doctors/${doc.slug || doc._id}`}
                          className="shrink-0 bg-slate-50 hover:bg-[#E0F7F7] text-slate-700 hover:text-[#00B5B5] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          Profile
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL: STICKY BOOKING CARD */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 rounded-[2rem] space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Mode</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black capitalize text-slate-800 flex items-center gap-1.5">
                    {consultMode === "clinic" && <Hospital className="w-4 h-4 text-[#00B5B5]" />}
                    {consultMode === "video" && <Video className="w-4 h-4 text-[#00B5B5]" />}
                    {consultMode === "phone" && <Phone className="w-4 h-4 text-[#00B5B5]" />}
                    {consultMode === "clinic" ? "In-Clinic Visit" : consultMode === "video" ? "Video Consultation" : "Phone Call Consult"}
                  </span>
                  <span className="text-lg font-black text-[#00B5B5]">₹{feesMap[consultMode]}</span>
                </div>
              </div>

              {/* Date picker with full calendar option */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Date</p>
                  <button 
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="flex items-center gap-1 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-wider cursor-pointer transition-colors bg-teal-50 px-2.5 py-1 rounded-lg"
                  >
                    <Calendar size={11} className="text-[#00B5B5]" />
                    <span>Full Calendar</span>
                    <input 
                      ref={dateInputRef}
                      type="date"
                      onChange={(e) => handleCustomDateChange(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="sr-only"
                    />
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {allDays.map((d, index) => {
                    const isSelected = selectedDateIndex === index;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedDateIndex(index);
                          setSelectedSlot("");
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border min-w-[55px] text-center transition-all ${
                          isSelected
                            ? "bg-[#00B5B5] border-[#00B5B5] text-white shadow-md shadow-teal-500/10"
                            : "bg-white border-slate-100 hover:border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider">{d.name}</span>
                        <span className="text-sm font-black leading-none my-1">{d.dayNum}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider">{d.month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Time Slots</p>
                  <span className="text-[9px] font-black text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                    <Zap size={8} className="fill-teal-600 text-teal-600" />
                    Instant
                  </span>
                </div>

                {activeDaySlots.length > 0 ? (
                  <div className="space-y-3">
                    {/* Session Selector Tabs */}
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100/50">
                      <button
                        type="button"
                        onClick={() => setActiveSession('morning')}
                        disabled={groupedSlots.morning.length === 0}
                        className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          activeSession === 'morning'
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                        }`}
                      >
                        🌅 Morning ({groupedSlots.morning.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSession('afternoon')}
                        disabled={groupedSlots.afternoon.length === 0}
                        className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          activeSession === 'afternoon'
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                        }`}
                      >
                        ☀️ Afternoon ({groupedSlots.afternoon.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSession('evening')}
                        disabled={groupedSlots.evening.length === 0}
                        className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          activeSession === 'evening'
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                        }`}
                      >
                        🌙 Evening ({groupedSlots.evening.length})
                      </button>
                    </div>

                    {/* Active Session Slots grid */}
                    {groupedSlots[activeSession].length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {groupedSlots[activeSession].map((slot) => {
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 text-[11px] font-black rounded-lg border transition-all text-center ${
                                isSelected
                                  ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                                  : "bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-xl text-center text-slate-400 text-xs font-bold">
                        No slots in this session.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-100/50 p-4 rounded-2xl text-center text-rose-600 text-xs font-black">
                    Doctor unavailable on this day.
                  </div>
                )}
              </div>

              {/* Instant Book CTA */}
              <button
                onClick={handleBookingRedirect}
                disabled={!selectedSlot}
                className={`w-full py-4.5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  selectedSlot 
                    ? "bg-[#00B5B5] hover:bg-[#00B5B5]/90 text-white shadow-lg shadow-teal-500/20 active:translate-y-0.5" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Book Appointment <ArrowRight size={16} />
              </button>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 font-bold">
                <Clock className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                <span>Confirm slots selection and proceed. Bookings are instantly saved securely.</span>
              </div>
            </div>
          </div>

        </div>
      </Container>

      {/* MOBILE STICKY PANEL (Floats at bottom of mobile viewports to increase bookings/conversions) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100/80 shadow-2xl p-4 z-50 flex justify-between items-center gap-4 animate-in slide-in-from-bottom duration-300">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultation Fee</p>
          <p className="text-lg font-black text-[#00B5B5] leading-none mt-0.5">₹{feesMap[consultMode]}</p>
        </div>
        <button
          onClick={() => {
            const rightWidget = document.querySelector(".lg\\:sticky");
            if (rightWidget) {
              rightWidget.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="bg-[#00B5B5] hover:bg-[#00B5B5]/90 text-white font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-teal-500/15"
        >
          Book Now
        </button>
      </div>
    </Section>
  );
}
