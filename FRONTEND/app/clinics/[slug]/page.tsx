"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Loader2, MapPin, Phone, Mail, Globe,
  Hospital, Stethoscope, ArrowRight,
  ShieldCheck, Award as AwardIcon, Users as UsersIcon, Star as StarIcon, MessageSquare as MessageSquareIcon,
  Send as SendIcon, Lock, Calendar, Clock, Sparkles, Check, ChevronDown, ChevronUp, AlertCircle, PhoneCall,
  X, ChevronLeft, ChevronRight
} from "lucide-react";
import { resolveImageUrl } from "../../../lib/resolveImageUrl";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type ClinicDetails = {
  _id: string;
  name: string;
  clinicName: string;
  clinicType: string;
  description?: string;
  images: string[];
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  emergencyAvailable: boolean;
  services: string[];
  facilities: string[];
  registrationFee?: number;
  slug: string;
  averageRating: number;
  reviewCount: number;
  doctors: {
    _id: string;
    slug?: string;
    specialty: string;
    status: string;
    experience?: number;
    rating?: number;
    reviewsCount?: number;
    consultationFee?: number;
    user: {
      name: string;
      avatar?: string;
    };
  }[];
};

type Review = {
  _id: string;
  user?: {
    name?: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt?: string;
};

// Premium Mock Fallback Assets
const fallbackGallery = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop", // waiting area
  "https://images.unsplash.com/photo-1584515901367-f1388c1307aa?q=80&w=600&auto=format&fit=crop", // consult room
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop", // reception
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop"  // lab
];

const mockInsurances = [
  "Star Health Insurance",
  "HDFC ERGO Health",
  "ICICI Lombard",
  "Niva Bupa Health",
  "Bajaj Allianz",
  "Care Health Insurance"
];

const mockNearbyClinics = [
  { name: "Apex Heart Clinic", specialty: "Cardiology & General Care", rating: 4.8, distance: "1.2 km" },
  { name: "Grace Dental & Orthodontic", specialty: "Dental Sciences", rating: 4.7, distance: "2.4 km" },
  { name: "Siddhi Skin & Laser Clinic", specialty: "Dermatology", rating: 4.6, distance: "3.1 km" }
];

export default function ClinicDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();
  const [clinic, setClinic] = useState<ClinicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const userReview = useMemo(() => {
    if (!user || !reviews.length) return null;
    return reviews.find(r => r.user?._id === user.id || r.user === user.id || r.userId === user.id);
  }, [user, reviews]);

  useEffect(() => {
    if (userReview && !isEditingReview) {
      setNewReview({
        rating: userReview.rating,
        comment: userReview.comment || userReview.text || ""
      });
    }
  }, [userReview, isEditingReview]);

  // Gallery state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Booking Widget state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/clinics/${slug}`);
        const data = await res.json();

        if (data.status === "success") {
          setClinic(data.data.clinic);
        } else {
          throw new Error(data.message || "Failed to load clinic details");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clinic details");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchClinic();
    }
  }, [slug]);

  const fetchReviews = async (clinicId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/clinics/${clinicId}/reviews`);
      const data = await res.json();
      if (data.status === "success") {
        setReviews(data.data.reviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  useEffect(() => {
    if (clinic?._id) {
      fetchReviews(clinic._id);
    }
  }, [clinic]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !isAuthenticated) return;

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/clinics/${clinic._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReview)
      });

      if (res.status === 401) {
        return;
      }

      const data = await res.json();
      if (data.status === "success") {
        setNewReview({ rating: 5, comment: "" });
        setIsEditingReview(false);
        fetchReviews(clinic._id);
        const refreshRes = await fetch(`${API_BASE_URL}/clinics/${slug}`);
        const refreshData = await refreshRes.json();
        if (refreshData.status === "success") {
          setClinic(refreshData.data.clinic);
        }
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch {
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Gallery images merger
  const imagesList = useMemo(() => {
    if (clinic && clinic.images && clinic.images.length > 0) {
      return clinic.images.map(img => resolveImageUrl(img) || "");
    }
    return fallbackGallery;
  }, [clinic]);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [customDays, setCustomDays] = useState<any[]>([]);

  // Next 7 days builder for booking sidebar
  const bookingDates = useMemo(() => {
    const dates = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        iso: d.toISOString().split("T")[0],
        label: `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
      });
    }
    return dates;
  }, []);

  const allDates = useMemo(() => {
    return [...bookingDates, ...customDays];
  }, [bookingDates, customDays]);

  const handleCustomDateChange = (dateString: string) => {
    if (!dateString) return;
    
    const standardIndex = bookingDates.findIndex(d => d.iso === dateString);
    if (standardIndex !== -1) {
      setSelectedDate(dateString);
      setSelectedTime("");
      return;
    }

    const d = new Date(dateString);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const newCustomDay = {
      iso: dateString,
      label: `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
    };

    setCustomDays([newCustomDay]);
    setSelectedDate(dateString);
    setSelectedTime("");
  };

  const activeDocSlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate || !clinic) return [];
    const selectedDoc = clinic.doctors?.find(d => d._id === selectedDoctorId) as any;
    if (!selectedDoc || !selectedDoc.availability) return [];
    
    // Get day name (e.g. "Mon")
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = weekdays[new Date(selectedDate).getDay()];
    
    const dayAvailability = selectedDoc.availability.find(
      (a: any) => a.day.toLowerCase() === dayName.toLowerCase() || a.day.toLowerCase().startsWith(dayName.toLowerCase().substring(0, 3))
    );
    
    return dayAvailability ? dayAvailability.slots : [];
  }, [selectedDoctorId, selectedDate, clinic]);

  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const isSlotInPast = (slotStr: string) => {
    if (!selectedDate) return false;
    
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDate = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDate}`;
    
    const isToday = selectedDate === todayStr;
    if (!isToday) return false;
    
    const startTimeStr = slotStr.split("-")[0]?.trim() || "";
    const matches = startTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!matches) return false;
    
    let slotHours = parseInt(matches[1], 10);
    const slotMinutes = parseInt(matches[2], 10);
    const ampm = matches[3];
    
    if (ampm) {
      if (ampm.toUpperCase() === "PM" && slotHours < 12) slotHours += 12;
      else if (ampm.toUpperCase() === "AM" && slotHours === 12) slotHours = 0;
    }
    
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    
    if (slotHours < currentHours) return true;
    if (slotHours === currentHours && slotMinutes <= currentMinutes) return true;
    return false;
  };

  const groupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    activeDocSlots.forEach((slot: string) => {
      const startTime = slot.split(" ")[0]; // e.g. "09:30"
      const isPm = slot.toLowerCase().includes("pm");
      let hour = parseInt(startTime.split(":")[0], 10);
      if (isPm && hour !== 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
      
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
  }, [activeDocSlots]);

  // Set default selected date
  useEffect(() => {
    if (bookingDates.length > 0 && !selectedDate) {
      setSelectedDate(bookingDates[0].iso);
    }
  }, [bookingDates, selectedDate]);

  // FAQs builder
  const faqs = useMemo(() => {
    if (!clinic) return [];
    return [
      { q: `How do I book an appointment at ${clinic.clinicName}?`, a: "You can book directly using the online booking widget. Simply choose a date, pick a convenient time slot, and click 'Book Appointment'." },
      { q: `Is emergency support available at ${clinic.clinicName}?`, a: clinic.emergencyAvailable ? "Yes! The facility provides emergency support. For life-threatening emergencies, please immediately visit the closest emergency ward." : "No, this clinic does not support 24/7 emergencies. Please reach out to emergency response services directly." },
      { q: "Does the clinic accept insurance?", a: "Yes, this clinic accepts major healthcare and cashless insurance options including Star Health, HDFC ERGO, and ICICI Lombard." },
      { q: "Is wheelchair access available?", a: "Yes. The facility is fully equipped with ramp structures and elevator services for wheelchair accessibility." }
    ];
  }, [clinic]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Loading Healthcare Facility...</p>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <Hospital size={40} />
        </div>
        <h1 className="font-h1 text-slate-900 mb-4">Clinic Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">{error || "We couldn't find the medical facility you're looking for."}</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  const fullAddress = [
    clinic.addressLine1,
    clinic.addressLine2,
    clinic.district,
    clinic.state,
    clinic.pincode
  ].filter(Boolean).join(", ");

  return (
    <div className="bg-[#FAFBFD] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* 1. PREMIUM HERO SECTION */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#0E7C66]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="flex-1 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-[#0E7C66]/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#0E7C66]/20">
                  {clinic.clinicType}
                </span>
                {clinic.emergencyAvailable && (
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 border border-rose-100 animate-pulse">
                    <PhoneCall size={10} /> Emergency Support 24/7
                  </span>
                )}
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                  <ShieldCheck size={11} /> Verified Partner
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                {clinic.clinicName}
              </h1>

              {/* Ratings and Reviews */}
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 text-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center shadow-sm">
                  <StarIcon size={12} className="mr-1 fill-white" />
                  {clinic.averageRating ? clinic.averageRating.toFixed(1) : "4.8"}
                </div>
                <span className="text-slate-400 font-bold text-xs">({clinic.reviewCount || 48} Patient Ratings)</span>
              </div>

              <p className="flex items-start gap-2 text-sm text-slate-500 font-bold max-w-2xl">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>{fullAddress}</span>
              </p>

              {/* Status and details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</p>
                  <p className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Open Today
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Doctors</p>
                  <p className="text-sm font-black text-slate-800">{clinic.doctors?.length || 0} Specialists</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-black text-slate-800">12+ Years</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Languages</p>
                  <p className="text-sm font-black text-slate-800">English, Hindi</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button 
                  onClick={() => document.getElementById("booking-card")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-primary text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-[#0E7C66]/15 hover:bg-[#0B6A59] transition-all"
                >
                  Book Appointment
                </button>
                <a 
                  href={`tel:${clinic.phone}`} 
                  className="border border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50 hover:bg-slate-50 text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all"
                >
                  Call Clinic
                </a>
                <a 
                  href={`https://wa.me/91${clinic.phone}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="border border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all"
                >
                  WhatsApp Support
                </a>
                <button 
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`)}
                  className="border border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50 hover:bg-slate-50 text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all"
                >
                  Get Directions
                </button>
              </div>
            </div>

            {/* 2. GALLERY SLIDER */}
            <div className="w-full lg:w-[420px] space-y-3 shrink-0">
              <div 
                className="h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-50 relative border border-slate-100 shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img 
                  src={imagesList[activeImageIdx]} 
                  alt="Clinic Gallery" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Image {activeImageIdx + 1} of {imagesList.length}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imagesList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (activeImageIdx === i) {
                        setIsLightboxOpen(true);
                      } else {
                        setActiveImageIdx(i);
                      }
                    }}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIdx === i ? "border-primary scale-95 shadow-sm" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout: Info (Left) + Booking (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLUMNS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 3. ABOUT THE CLINIC */}
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 text-left space-y-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-primary rounded-full" />
                About the Facility
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                {clinic.description || `Welcome to ${clinic.clinicName}, a premier modern healthcare center located in ${clinic.district}, ${clinic.state}. We focus on providing personalized, patient-centric healthcare service across multiple specialties. The center is equipped with high-tech diagnostic capabilities, comfortable seating, and verification protocols, ensuring that your doctor visit remains secure, comfortable, and efficient.`}
              </p>
            </section>

            {/* 4. SERVICES */}
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 text-left space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-[#0E7C66] rounded-full" />
                Available Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clinic.services?.map((service, index) => (
                  <div key={index} className="flex items-center gap-3.5 p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all group text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:bg-[#0E7C66] group-hover:text-white transition-all">
                      <Stethoscope size={16} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{service}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. MEDICAL STAFF & DOCTORS */}
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 text-left space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-indigo-500 rounded-full" />
                Specialists & Physicians
              </h2>
              <div className="space-y-4">
                {clinic.doctors?.map((doc) => (
                  <div key={doc._id} className="p-4 sm:p-6 border border-slate-100 rounded-2xl bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-slate-100/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                    <Link href={`/doctors/${doc.slug || doc._id}`} className="flex items-start gap-4 hover:opacity-85 transition-opacity">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 shadow-sm relative">
                        <img
                          src={doc.user?.avatar ? resolveImageUrl(doc.user.avatar) || "" : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user?.name || 'Doctor')}&background=00B5B5&color=fff`}
                          alt={doc.user?.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow border border-slate-50">
                          <span className="block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm sm:text-base">
                          Dr. {doc.user?.name || "Unknown"}
                        </h4>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{doc.specialty}</p>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs font-bold pt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" /> {doc.experience || "8"} Yrs Exp
                          </span>
                          <span className="flex items-center gap-1">
                            <StarIcon size={12} className="text-amber-500 fill-amber-500" /> {doc.rating || "4.8"}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="w-full sm:w-auto flex sm:flex-col items-end justify-between sm:justify-center gap-3 sm:gap-2.5 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Consultation Fee</p>
                        <p className="text-base font-black text-slate-900 mt-1">₹{doc.consultationFee || "499"}</p>
                      </div>
                      <Link 
                        href={`/appointments?doctorId=${doc._id}`}
                        className="bg-primary hover:bg-[#0B6A59] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#0E7C66]/10"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}

                {(!clinic.doctors || clinic.doctors.length === 0) && (
                  <div className="py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                    <Stethoscope size={40} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold italic">No doctors listed for this facility currently.</p>
                  </div>
                )}
              </div>
            </section>

            {/* 6. CLINIC HIGHLIGHTS */}
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 text-left space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-amber-500 rounded-full" />
                Clinic Highlights
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { title: "Valet Parking", available: true },
                  { title: "Wheelchair Access", available: true },
                  { title: "In-house Pharmacy", available: true },
                  { title: "24/7 Emergency Support", available: clinic.emergencyAvailable },
                  { title: "Sanitized Facility", available: true }
                ].map((hl, i) => (
                  <div key={i} className={`p-4 rounded-2xl border text-center space-y-2 flex flex-col justify-center items-center ${
                    hl.available ? "bg-emerald-50/20 border-emerald-100 text-emerald-800" : "bg-slate-50/50 border-slate-100 text-slate-400"
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hl.available ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-350"}`}>
                      {hl.available ? <Check size={16} strokeWidth={3} /> : <AlertCircle size={16} />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{hl.title}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 12. INSURANCE ACCEPTED */}
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 text-left space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-[#0E7C66] rounded-full" />
                Cashless Insurance Partners
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mockInsurances.map((ins, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{ins}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 9. PATIENT REVIEWS & RATINGS SUMMARY */}
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 text-left space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-yellow-400 rounded-full" />
                  Patient Reviews & Rating
                </h2>
                <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                  <span className="text-2xl font-black text-slate-800">{clinic.averageRating ? clinic.averageRating.toFixed(1) : "4.8"}</span>
                  <div className="flex items-center gap-0.5 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <StarIcon key={s} size={14} fill={s <= Math.round(clinic.averageRating || 4.8) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400">({clinic.reviewCount || 48} reviews)</span>
                </div>
              </div>

              {/* Rating Distribution breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-slate-100">
                <div className="col-span-2 space-y-2">
                  {[
                    { stars: 5, pct: "75%", count: 36 },
                    { stars: 4, pct: "18%", count: 8 },
                    { stars: 3, pct: "5%", count: 3 },
                    { stars: 2, pct: "2%", count: 1 },
                    { stars: 1, pct: "0%", count: 0 }
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                      <span className="w-12 text-left">{row.stars} Stars</span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: row.pct }} />
                      </div>
                      <span className="w-10 text-right">{row.count}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 text-center flex flex-col justify-center items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recommendation</span>
                  <span className="text-2xl font-black text-slate-800">96%</span>
                  <p className="text-[10px] font-bold text-slate-450 mt-2 leading-relaxed">of patients recommended this clinic to friends and family.</p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0E7C66]/10 flex items-center justify-center text-primary font-bold overflow-hidden text-xs">
                            {rev.user?.avatar ? (
                              <img src={resolveImageUrl(rev.user.avatar) || ""} alt="" className="w-full h-full object-cover" />
                            ) : (
                              rev.user?.name?.[0] || <UsersIcon size={14} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 leading-none">{rev.user?.name || "Anonymous Patient"}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Booking</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-yellow-400">
                          {[1, 2, 3, 4, 5].map(s => (
                            <StarIcon key={s} size={11} fill={s <= rev.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                    <MessageSquareIcon size={36} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold italic text-xs">No reviews submitted yet.</p>
                  </div>
                )}
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
                <h4 className="font-black text-slate-900 mb-4 text-sm flex items-center gap-2">
                  <AwardIcon size={16} className="text-[#0E7C66]" /> {userReview && !isEditingReview ? "Your Review" : "Write a Patient Review"}
                </h4>
                {isAuthenticated ? (
                  userReview && !isEditingReview ? (
                    <div className="space-y-4">
                      <div className="p-5 bg-blue-50/30 border border-blue-100/60 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                            <Check size={14} className="text-blue-500" strokeWidth={3} /> You have already reviewed this clinic
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEditingReview(true)}
                            className="text-xs font-black text-[#0E7C66] hover:underline uppercase tracking-wider"
                          >
                            Edit Review
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Your Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon 
                                key={star}
                                size={18}
                                fill={newReview.rating >= star ? "currentColor" : "none"}
                                className={newReview.rating >= star ? "text-amber-500" : "text-slate-200"} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-white/80 rounded-xl border border-slate-100/50 text-xs md:text-sm font-medium text-slate-700 italic">
                          "{newReview.comment}"
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Your Rating:</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <StarIcon size={18} fill={newReview.rating >= star ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        required
                        rows={3}
                        placeholder="Share details of your clinical visit, consultation, and facility standards..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full bg-white border border-slate-100 rounded-xl p-3.5 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        {userReview && isEditingReview && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingReview(false);
                              setNewReview({
                                rating: userReview.rating,
                                comment: userReview.comment || userReview.text || ""
                              });
                            }}
                            className="bg-slate-100 text-slate-600 py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {submittingReview ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            userReview ? "Update Review" : "Submit Review"
                          )}
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
                    <Lock size={28} className="text-slate-400 mb-3 animate-pulse" />
                    <p className="text-base font-black text-slate-800">Access Restricted</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-xs mt-1 mb-4 text-center">Please log in to write an appointment review.</p>
                    <Link href="/login" className="bg-[#0E7C66] hover:bg-[#0B6A59] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl shadow-md shadow-[#0E7C66]/10 transition-all">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* 10. FAQ SECTION */}
            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 text-left space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-indigo-500 rounded-full" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                      className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:text-primary transition-colors"
                    >
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base hover:text-primary transition-colors">{faq.q}</h3>
                      {openFaqIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openFaqIdx === idx && (
                      <div className="px-5 pb-5 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-50 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: SCHEDULE, BOOKING WIDGET & CONTACT */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
            
            {/* 13. STICKY BOOKING SIDEBAR */}
            <div id="booking-card" className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-200/40 text-left space-y-6">
              {(() => {
                const selectedDoc = clinic.doctors?.find(d => d._id === selectedDoctorId);
                return (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                        <p className="text-2xl font-black text-[#0E7C66] mt-1">
                          {selectedDoc ? `₹${selectedDoc.consultationFee || '499'}` : '--'}
                        </p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-emerald-100">
                        Cashless Accepted
                      </div>
                    </div>

                    {/* Doctor Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                        <Stethoscope size={13} className="text-[#0E7C66]" /> Select Doctor
                      </label>
                      <select
                        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 transition-all outline-none font-bold text-xs"
                        value={selectedDoctorId}
                        onChange={(e) => {
                          setSelectedDoctorId(e.target.value);
                          setSelectedTime("");
                        }}
                      >
                        <option value="">Choose Doctor...</option>
                        {clinic.doctors?.map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            Dr. {doc.user?.name} ({doc.specialty})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Selector */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#0E7C66]" /> Select Appointment Date
                        </p>
                        <button 
                          type="button"
                          onClick={() => dateInputRef.current?.showPicker()}
                          className="flex items-center gap-1 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-wider cursor-pointer transition-colors bg-teal-50 px-2 py-0.5 rounded-lg"
                        >
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
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {allDates.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedDate(item.iso);
                              setSelectedTime("");
                            }}
                            className={`px-3 py-2.5 rounded-xl border shrink-0 text-center flex flex-col justify-between h-14 w-18 transition-all ${
                              selectedDate === item.iso
                                ? "bg-primary border-primary text-white shadow-md shadow-[#0E7C66]/15"
                                : "border-slate-150 text-slate-600 bg-white hover:border-slate-300"
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider block">{item.label.split(",")[0]}</span>
                            <span className="text-xs font-black block mt-1">{item.label.split(",")[1]?.trim()}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time slot selector */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={13} className="text-[#0E7C66]" /> Choose Slot Timings
                      </p>

                      {/* Session Selector Tabs */}
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100/50">
                        <button
                          type="button"
                          onClick={() => setActiveSession('morning')}
                          disabled={groupedSlots.morning.length === 0}
                          className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            activeSession === 'morning'
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-450 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                          }`}
                        >
                          🌅 Morning ({groupedSlots.morning.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSession('afternoon')}
                          disabled={groupedSlots.afternoon.length === 0}
                          className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            activeSession === 'afternoon'
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-450 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                          }`}
                        >
                          ☀️ Afternoon ({groupedSlots.afternoon.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSession('evening')}
                          disabled={groupedSlots.evening.length === 0}
                          className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            activeSession === 'evening'
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-450 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
                          }`}
                        >
                          🌙 Evening ({groupedSlots.evening.length})
                        </button>
                      </div>

                      {/* Active Session Slots grid */}
                      {!selectedDoctorId ? (
                        <div className="bg-slate-50 p-4 rounded-xl text-center text-slate-400 text-xs font-bold">
                          Please select a doctor to view available slots.
                        </div>
                      ) : groupedSlots[activeSession].length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {groupedSlots[activeSession].map((time, i) => {
                            const isPast = isSlotInPast(time);
                            return (
                              <button
                                key={i}
                                type="button"
                                disabled={isPast}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2 text-[10px] font-black rounded-lg border transition-all text-center ${
                                  isPast
                                    ? "opacity-40 cursor-not-allowed bg-slate-100 border-slate-100 text-slate-400"
                                    : selectedTime === time
                                      ? "bg-slate-900 border-slate-900 text-white"
                                      : "border-slate-150 text-slate-600 bg-white hover:border-slate-350"
                                }`}
                              >
                                {time}
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

                    {/* CTA Booking Action */}
                    <button
                      onClick={() => {
                        if (!selectedDoctorId || !selectedDate || !selectedTime) {
                          alert("Please select a doctor, date, and time slot to proceed.");
                          return;
                        }
                        window.location.href = `/appointments?doctorId=${selectedDoctorId}&date=${selectedDate}&slot=${selectedTime}&clinicId=${clinic._id}`;
                      }}
                      className="w-full bg-[#0E7C66] hover:bg-[#0B6A59] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0E7C66]/25 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                      Confirm Appointment Slot <ArrowRight size={16} />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* 8. WEEKLY SCHEDULE */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={14} className="text-slate-450" /> Weekly Schedule
              </h4>
              <div className="space-y-2 text-xs font-bold text-slate-650">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                  const isWorking = clinic.workingDays?.includes(day);
                  return (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span>{day}</span>
                      <span className={isWorking ? "font-black text-[#0E7C66]" : "text-slate-400 italic"}>
                        {isWorking ? `${clinic.openingTime} - ${clinic.closingTime}` : "Closed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. DETAILED CONTACT & ACCESS INFO */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left space-y-5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Globe size={14} className="text-slate-450" /> Contact Info & Access
              </h4>
              <div className="space-y-3.5">
                <div className="flex gap-3">
                  <Phone size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Emergency Phone</p>
                    <p className="text-xs font-black text-slate-800 mt-1">{clinic.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Email Address</p>
                    <p className="text-xs font-black text-slate-800 mt-1 truncate max-w-[200px]" title={clinic.email}>{clinic.email}</p>
                  </div>
                </div>
                {clinic.website && (
                  <div className="flex gap-3">
                    <Globe size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Website</p>
                      <a href={clinic.website} target="_blank" rel="noreferrer" className="text-xs font-black text-primary hover:underline mt-1 block truncate max-w-[200px]">{clinic.website}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 11. NEARBY RECOMMENDATIONS */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Hospital size={14} className="text-slate-450" /> Nearby Clinics
              </h4>
              <div className="space-y-4">
                {mockNearbyClinics.map((nc, i) => (
                  <div key={i} className="flex justify-between items-start gap-2 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-800 leading-tight">{nc.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 leading-none">{nc.specialty}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{nc.distance} Away</p>
                    </div>
                    <div className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center shrink-0">
                      <StarIcon size={8} className="mr-0.5 fill-white" />
                      {nc.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 transition-all duration-300">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={() => setActiveImageIdx((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1))}
            className="absolute left-6 text-white hover:text-gray-300 transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full"
            aria-label="Previous Image"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center">
            <img 
              src={imagesList[activeImageIdx]} 
              alt="Clinic Gallery Full view" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
            />
          </div>

          <button 
            onClick={() => setActiveImageIdx((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1))}
            className="absolute right-6 text-white hover:text-gray-300 transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full"
            aria-label="Next Image"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-bold bg-white/10 px-4 py-2 rounded-full">
            Image {activeImageIdx + 1} of {imagesList.length}
          </div>
        </div>
      )}
    </div>
  );
}
