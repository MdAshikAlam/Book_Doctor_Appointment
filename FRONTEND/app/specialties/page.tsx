"use client"

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Stethoscope,
  Search,
  Loader2,
  AlertCircle,
  Users,
  LayoutGrid,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Award,
  DollarSign,
  Globe,
  Building2,
  Clock,
  User,
  ThumbsUp,
  CheckCircle2,
  HelpCircle,
  Activity,
  Check,
  Heart,
  Brain,
  Baby,
  Bone,
  Eye,
  Smile,
  Ear,
  ArrowRight,
  ShieldCheck,
  Zap,
  PhoneCall,
  Languages,
  Navigation,
  Star,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarFallback, resolveImageUrl } from '@/lib/resolveImageUrl';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// Detailed condition listings for SEO / Diagnostics by specialty
const getConditionsBySpecialty = (specialty: string) => {
  const normalized = specialty.toLowerCase();
  if (normalized.includes('ent')) {
    return ['Sinus Infection', 'Ear Infection', 'Hearing Problems', 'Tonsillitis', 'Allergies', 'Throat Pain', 'Sleep Apnea', 'Voice Disorders'];
  }
  if (normalized.includes('cardio')) {
    return ['Chest Pain', 'High Blood Pressure', 'Arrhythmia', 'Coronary Artery Disease', 'Heart Failure', 'Palpitations', 'Cholesterol Management', 'Heart Murmur'];
  }
  if (normalized.includes('pediatr')) {
    return ['Common Cold & Flu', 'Child Immunizations', 'Growth Monitoring', 'Asthma in Children', 'Infant Nutrition', 'Developmental Delays', 'Allergies', 'Childhood Infections'];
  }
  if (normalized.includes('ortho')) {
    return ['Arthritis', 'Joint Pain', 'Back Pain', 'Fractures', 'Sports Injuries', 'Scoliosis', 'Ligament Tears', 'Osteoporosis'];
  }
  if (normalized.includes('dermat')) {
    return ['Acne & Pimple Care', 'Eczema', 'Psoriasis', 'Hair Fall', 'Skin Allergy', 'Warts & Moles', 'Pigmentation', 'Nail Infections'];
  }
  if (normalized.includes('dentist') || normalized.includes('dental')) {
    return ['Cavities', 'Toothache', 'Gum Bleeding', 'Root Canal Issues', 'Teeth Alignment', 'Wisdom Tooth Pain', 'Bad Breath', 'Dental Plaque'];
  }
  return ['General Consultations', 'Chronic Pain', 'Physical Fatigue', 'Allergic Reactions', 'Inflammatory Conditions', 'Diagnostic Screenings', 'Preventative Care', 'Follow-up Visits'];
};

interface Doctor {
  _id: string;
  slug?: string;
  user: {
    name: string;
    avatar?: string;
  };
  specialty: string;
  experience: number;
  district: string;
  state: string;
  distance?: number;
  isFallback?: boolean;
  consultationFee?: number;
  languages?: string[];
  gender?: 'Male' | 'Female';
  clinicType?: 'Private Clinic' | 'Medical Center';
  nextSlot?: string;
  isAvailableToday?: boolean;
  rating?: number;
  reviews?: number;
  emergencyConsultation?: boolean;
  insuranceAccepted?: boolean;
  clinicName?: string;
}

const specialtiesList = [
  { name: "ENT", icon: Ear, count: 55, desc: "Ear, nose, throat, sinus, hearing, and allergy care." },
  { name: "Cardiology", icon: Heart, count: 120, desc: "Heart specialists for diagnosis, treatment, and preventive care." },
  { name: "Dermatology", icon: Activity, count: 150, desc: "Skin, hair, and nail treatments." },
  { name: "Orthopedics", icon: Bone, count: 95, desc: "Bone, joint, spine, and sports injury care." },
  { name: "Pediatrics", icon: Baby, count: 210, desc: "Healthcare services for children and adolescents." },
  { name: "Dentist", icon: Smile, count: 180, desc: "Oral healthcare and dental treatments." },
  { name: "Neurology", icon: Brain, count: 85, desc: "Neurological assessments and brain function diagnostics." },
  { name: "Eye Specialist (Ophthalmologist)", icon: Eye, count: 70, desc: "Visual acuity correction and advanced eye care." },
  { name: "General Physician", icon: Stethoscope, count: 320, desc: "Holistic health consultations and preventative diagnostics." }
];

function SpecialtiesList() {
  const searchParams = useSearchParams();
  const { selectedState, selectedDistrict, pincode, setSelectedState, setSelectedDistrict, setPincode, latitude, longitude, updateLocation } = useLocation();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectError, setLocationDetectError] = useState<string | null>(null);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [modalStates, setModalStates] = useState<string[]>([]);
  const [modalDistricts, setModalDistricts] = useState<string[]>([]);
  const [isLoadingModalLocations, setIsLoadingModalLocations] = useState(false);

  // Fetch States for local modal on open
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setIsLoadingModalLocations(true);
        const res = await fetch(`${API_BASE_URL}/utility/states`);
        const data = await res.json();
        if (data.status === 'success') {
          setModalStates(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch states:', err);
      } finally {
        setIsLoadingModalLocations(false);
      }
    };
    if (isManualModalOpen && modalStates.length === 0) {
      fetchStates();
    }
  }, [isManualModalOpen, modalStates.length]);

  // Fetch Districts for local modal when selectedState changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setModalDistricts([]);
        return;
      }
      try {
        setIsLoadingModalLocations(true);
        const res = await fetch(`${API_BASE_URL}/utility/districts?state=${encodeURIComponent(selectedState)}`);
        const data = await res.json();
        if (data.status === 'success') {
          setModalDistricts(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      } finally {
        setIsLoadingModalLocations(false);
      }
    };
    if (isManualModalOpen && selectedState) {
      fetchDistricts();
    }
  }, [isManualModalOpen, selectedState]);

  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationDetectError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    setLocationDetectError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(`${API_BASE_URL}/utility/reverse-geocode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lng })
          });
          const data = await res.json();
          if (data.status === 'success') {
            const { pincode: resPincode, district, state } = data.data;
            updateLocation(state, district, resPincode || '', lat, lng);
          } else {
            setLocationDetectError('Failed to resolve coordinates to district details.');
          }
        } catch (err) {
          console.error(err);
          setLocationDetectError('Failed to connect to geocoding service.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        setLocationDetectError(`Location retrieval failed: ${error.message}`);
      }
    );
  };
  const [selectedSpecialty, setSelectedSpecialty] = useState('ENT');
  const [currentLocation, setCurrentLocation] = useState('Nawada');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<{ doctors: any[], clinics: any[] }>({ doctors: [], clinics: [] });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Click outside listener to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions based on search term
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Do not fetch suggestions if location is not selected
      if (!selectedDistrict && (!latitude || !longitude)) {
        setSuggestions({ doctors: [], clinics: [] });
        return;
      }

      if (searchTerm.length < 2) {
        setSuggestions({ doctors: [], clinics: [] });
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        let url = `${API_BASE_URL}/search?${searchTerm.length >= 2 ? `name=${encodeURIComponent(searchTerm)}` : ''}`;
        
        if (latitude && longitude) {
          url += `&lat=${latitude}&lng=${longitude}&radius=60`;
        } else if (selectedDistrict) {
          url += `&district=${encodeURIComponent(selectedDistrict)}`;
          if (selectedState) url += `&state=${encodeURIComponent(selectedState)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'success') {
          setSuggestions(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, latitude, longitude, selectedDistrict, selectedState]);

  // Map frontend specialty display names to backend-stored specialty values
  const specialtyToBackendMap: Record<string, string[]> = {
    'ENT': ['ENT', 'Otolaryngologist'],
    'Cardiology': ['Cardiology', 'Cardiologist'],
    'Dermatology': ['Dermatology', 'Dermatologist'],
    'Orthopedics': ['Orthopedics', 'Orthopedic', 'Orthopaedic'],
    'Pediatrics': ['Pediatrics', 'Pediatrician', 'Paediatrician'],
    'Dentist': ['Dentist', 'Dental', 'Dentistry'],
    'Neurology': ['Neurology', 'Neurologist'],
    'Eye Specialist (Ophthalmologist)': ['Ophthalmologist', 'Eye Specialist', 'Eye', 'Ophthalmology'],
    'General Physician': ['General Physician', 'General Medicine', 'General Practitioner', 'Medicine']
  };

  // Exact doctor counts per specialty
  const [exactCounts, setExactCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchExactCounts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctors`);
        const data = await res.json();
        if (data.status === 'success') {
          const counts: Record<string, number> = {};
          
          // Pre-initialize counts with 0
          specialtiesList.forEach(s => {
            counts[s.name.toLowerCase()] = 0;
          });

          data.data.doctors.forEach((doc: any) => {
            const docSpec = (doc.specialty || '').toLowerCase().trim();
            for (const s of specialtiesList) {
              const specName = s.name.toLowerCase();
              // Use the same backend name mapping for consistency
              const backendNames = (specialtyToBackendMap[s.name] || [s.name]).map(n => n.toLowerCase());
              const isMatch = backendNames.some(name => 
                docSpec === name || docSpec.includes(name) || name.includes(docSpec)
              );
              if (isMatch) {
                counts[specName] = (counts[specName] || 0) + 1;
                break;
              }
            }
          });
          setExactCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching exact counts:', err);
      }
    };
    fetchExactCounts();
  }, []);

  // Smart Filters State
  const [filterExperience, setFilterExperience] = useState<string>('all');
  const [filterFee, setFilterFee] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterClinicType, setFilterClinicType] = useState<string>('all');

  // FAQ Expanded State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const specialtyFromQuery = searchParams.get('specialty')?.trim();
    if (specialtyFromQuery) {
      // Find matching case-insensitive
      const matched = specialtiesList.find(s => s.name.toLowerCase() === specialtyFromQuery.toLowerCase());
      if (matched) {
        setSelectedSpecialty(matched.name);
      }
    }
  }, [searchParams]);

  // Fetch doctors (simulated/actual combination)

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try fetching all doctors and filter client-side for better specialty matching
      const res = await fetch(`${API_BASE_URL}/doctors`);
      const data = await res.json();

      if (data.status === 'success') {
        const allDoctors = data.data.doctors;

        // Filter by specialty client-side for fuzzy matching
        const backendNames = specialtyToBackendMap[selectedSpecialty] || [selectedSpecialty];
        const matchingDoctors = selectedSpecialty
          ? allDoctors.filter((doc: any) => {
              const docSpec = (doc.specialty || '').toLowerCase().trim();
              return backendNames.some(name => {
                const lowerName = name.toLowerCase();
                return docSpec === lowerName || docSpec.includes(lowerName) || lowerName.includes(docSpec);
              });
            })
          : allDoctors;

        if (matchingDoctors.length > 0) {
          // Clean API results without dummy fallback metadata
          const enhancedDoctors = matchingDoctors.map((doc: any) => {
            return {
              ...doc,
              rating: doc.rating || 5.0,
              reviews: doc.reviews || doc.numReviews || 0,
              consultationFee: doc.consultationFee || 0,
              languages: doc.languages || ['Hindi', 'English'],
              gender: doc.gender || doc.user?.gender || 'Male',
              clinicType: doc.clinicType || 'Clinic',
              nextSlot: doc.nextSlot || 'Contact Clinic',
              isAvailableToday: doc.isAvailableToday || false,
              distance: doc.distance !== undefined ? doc.distance : 0,
              clinicName: doc.clinicName || doc.clinic?.clinicName || doc.branch_info?.[0]?.clinicName || doc.clinic_info?.[0]?.clinicName || '',
              emergencyConsultation: doc.emergencyConsultation || false,
              insuranceAccepted: doc.insuranceAccepted || false
            };
          });

          // Tag as fallback if user's currentLocation doesn't match doctor's district
          const finalDoctors = enhancedDoctors.map((doc: Doctor) => {
            const docDistrict = (doc.district || '').toLowerCase();
            const isLocalMatch = docDistrict.includes(currentLocation.toLowerCase()) || currentLocation.toLowerCase().includes(docDistrict);
            return {
              ...doc,
              isFallback: !isLocalMatch,
              distance: isLocalMatch ? (2000 + (Math.random() * 8000)) : (60000 + (Math.random() * 100000))
            };
          });

          setDoctors(finalDoctors);
        } else {
          // No matching doctors from API
          setDoctors([]);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch specialists');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSpecialty, currentLocation]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors, currentLocation]);

  // Client side matching filters
  const filteredDoctors = doctors.filter((doc: Doctor) => {
    // 1. Search text match
    const nameMatch = doc.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.clinicName && doc.clinicName.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!nameMatch) return false;

    // 2. Experience Filter
    if (filterExperience !== 'all') {
      if (filterExperience === '0-5' && doc.experience > 5) return false;
      if (filterExperience === '5-10' && (doc.experience < 5 || doc.experience > 10)) return false;
      if (filterExperience === '10+' && doc.experience < 10) return false;
    }

    // 3. Fee Filter
    if (filterFee !== 'all') {
      const fee = doc.consultationFee || 0;
      if (filterFee === '200-500' && (fee < 200 || fee > 500)) return false;
      if (filterFee === '500-1000' && (fee < 500 || fee > 1000)) return false;
      if (filterFee === '1000+' && fee < 1000) return false;
    }

    // 4. Availability Filter
    if (filterAvailability !== 'all') {
      if (filterAvailability === 'today' && !doc.isAvailableToday) return false;
      if (filterAvailability === 'tomorrow' && doc.isAvailableToday) {
        // Just general simulation logic
        if (doc.nextSlot && !doc.nextSlot.toLowerCase().includes('tomorrow')) return false;
      }
    }

    // 5. Language Filter
    if (filterLanguage !== 'all') {
      if (!doc.languages || !doc.languages.includes(filterLanguage)) return false;
    }

    // 6. Gender Filter
    if (filterGender !== 'all') {
      if (doc.gender !== filterGender) return false;
    }

    // 7. Clinic Type Filter
    if (filterClinicType !== 'all') {
      if (doc.clinicType !== filterClinicType) return false;
    }

    return true;
  });

  // Calculate quick dynamic statistics for Section 3
  const totalDoctorsFound = filteredDoctors.length;
  const availableTodayCount = filteredDoctors.filter(d => d.isAvailableToday).length;
  const averageFee = filteredDoctors.length > 0
    ? Math.round(filteredDoctors.reduce((acc, curr) => acc + (curr.consultationFee || 500), 0) / filteredDoctors.length)
    : 500;
  const minDistance = filteredDoctors.length > 0
    ? Math.round(Math.min(...filteredDoctors.map(d => d.distance || 8000)) / 1000)
    : 8;

  const faqs = [
    {
      q: `When should I visit an ${selectedSpecialty || 'ENT'} specialist?`,
      a: `You should visit an ${selectedSpecialty || 'ENT'} specialist if you experience persistent symptoms related to ears, nose, throat, sinus discomfort, throat pain, hearing issues, or breathing concerns.`
    },
    {
      q: "How do I book an appointment?",
      a: "Simply browse through our verified specialists, select your preferred date/time slot, click 'Book Appointment', fill in the basic patient information, and receive a confirmed slot instantly."
    },
    {
      q: "Can I reschedule my booking?",
      a: "Yes! You can reschedule or cancel your appointment free of charge up to 2 hours before the scheduled time through the profile dashboard or using the link in your SMS confirmation."
    },
    {
      q: `How much does an ${selectedSpecialty || 'ENT'} consultation cost?`,
      a: `Consultation fees range from ₹250 to ₹1000+ depending on the doctor's experience and clinic location. You can view all fees transparently on each doctor profile.`
    },
    {
      q: "Are doctors verified?",
      a: "Absolutely. Every doctor goes through a strict verification process including credentials, registry license check, and clinic audit before listing on BookMyDoctor."
    },
    {
      q: "Can I view doctor reviews before booking?",
      a: "Yes. All ratings and feedback displayed on doctor profiles are left by patients who booked through our portal and completed their check-up."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">

      {/* SECTION 1: HERO SECTION */}
      <section className="relative z-30 bg-[#F0FDFD] pt-10 pb-16 border-b border-[#00B5B5]/10">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        <Container className="relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="font-h1 text-slate-900 mb-6">
              Find Specialists <span className="text-[#00B5B5]">Near You</span>
            </h1>

            {/* Sub Heading */}
            <p className="font-body-primary text-slate-500 mx-auto mb-8">
              Explore verified doctors across multiple specialties, compare experience, consultation fees, and available appointment slots, then book instantly.
            </p>

            {/* Premium Search Bar with Auto-Suggestions */}
            <div className="relative w-full max-w-2xl mx-auto mb-12" ref={searchRef}>
              <div className="relative shadow-xl shadow-slate-200/50 rounded-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00B5B5]" />
                <input
                  type="text"
                  placeholder="Search by specialty, doctor name, symptom, or clinic..."
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-12 focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] transition-all font-medium text-sm text-slate-800 outline-none h-14"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-[#00B5B5] animate-spin" />
                  </div>
                )}
              </div>

              {/* Suggestions Panel Dropdown */}
              <AnimatePresence>
                {showSuggestions && searchTerm.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left"
                  >
                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                       {!selectedDistrict && (!latitude || !longitude) ? (
                        <div className="py-8 px-6 text-center text-slate-500 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                          <div className="w-12 h-12 bg-[#00B5B5]/10 text-[#00B5B5] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <MapPin className="w-6 h-6" />
                          </div>
                          <p className="text-base font-extrabold text-slate-900 mb-2">Location Required</p>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-md mx-auto mb-6">
                            To find doctors and clinics in your area, please select your location manually or allow auto-detection.
                          </p>
                          
                          {locationDetectError && (
                            <div className="mb-4 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-2.5 max-w-sm mx-auto">
                              {locationDetectError}
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-sm mx-auto">
                            <button
                              type="button"
                              onClick={handleAutoFetchLocation}
                              disabled={isDetectingLocation}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00B5B5] hover:bg-[#009b9b] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-[#00B5B5]/20 disabled:opacity-50"
                            >
                              <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                              {isDetectingLocation ? 'Detecting...' : 'Auto-Detect Location'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setIsManualModalOpen(true);
                                setShowSuggestions(false);
                              }}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-black flex items-center justify-center gap-2 transition-all"
                            >
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              Select Manually
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Fallback Location Notice */}
                          {(suggestions.doctors.some((d: any) => d.isFallback) || suggestions.clinics.some((c: any) => c.isFallback)) && (
                            <div className="p-3 bg-amber-50 text-amber-800 text-xs font-bold rounded-2xl border border-amber-100">
                              <p className="font-extrabold uppercase text-[9px] tracking-wide text-amber-600 mb-0.5">Notice</p>
                              <p>No clinics or doctors available in {selectedDistrict || 'this district'}. Showing nearby options:</p>
                            </div>
                          )}

                          {suggestions.clinics.length > 0 && (
                            <div>
                              <div className="px-3 py-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 rounded-lg mb-2">
                                Clinics & Medical Centers
                              </div>
                              {suggestions.clinics.map((clinic) => (
                                <button
                                  key={clinic._id}
                                  onClick={() => {
                                    window.location.href = `/clinics/${clinic.slug || clinic._id}`;
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full flex items-center gap-3.5 p-2.5 hover:bg-slate-50 rounded-xl transition-all group text-left"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all overflow-hidden font-bold shrink-0">
                                    {clinic.images?.[0] ? (
                                      <img src={resolveImageUrl(clinic.images[0]) || ''} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Search size={16} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-2">
                                      <span>{clinic.clinicName}</span>
                                      {clinic.isFallback && (
                                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Nearby</span>
                                      )}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{clinic.clinicType}</p>
                                  </div>
                                  <span className="px-2 py-1 bg-slate-50 rounded-md text-[9px] font-extrabold text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all uppercase">
                                    Visit
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {suggestions.doctors.length > 0 && (
                            <div>
                              <div className="px-3 py-1.5 text-[9px] font-black text-[#00B5B5] uppercase tracking-widest bg-[#00B5B5]/5 rounded-lg mb-2">
                                Doctors & Specialists
                              </div>
                              {suggestions.doctors.map((doc) => (
                                <button
                                  key={doc._id}
                                  onClick={() => {
                                    window.location.href = `/doctors/${doc._id}`;
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full flex items-center gap-3.5 p-2.5 hover:bg-slate-50 rounded-xl transition-all group text-left"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#00B5B5] group-hover:text-white transition-all overflow-hidden font-bold shrink-0">
                                    {doc.user.avatar ? (
                                      <img
                                        src={resolveImageUrl(doc.user.avatar) || getAvatarFallback(doc.user.name)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = getAvatarFallback(doc.user.name);
                                        }}
                                      />
                                    ) : (
                                      doc.user.name[0]
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-2">
                                      <span>Dr. {doc.user.name}</span>
                                      {doc.isFallback && (
                                        <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Nearby</span>
                                      )}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{doc.specialty}</p>
                                    {(doc.clinicName || doc.clinic?.clinicName || doc.branch_info?.[0]?.clinicName || doc.clinic_info?.[0]?.clinicName) && (
                                      <p className="text-[9px] font-bold text-[#00B5B5] truncate mt-0.5">
                                        {doc.clinicName || doc.clinic?.clinicName || doc.branch_info?.[0]?.clinicName || doc.clinic_info?.[0]?.clinicName}
                                      </p>
                                    )}
                                  </div>
                                  <span className="px-2 py-1 bg-slate-50 rounded-md text-[9px] font-extrabold text-slate-400 group-hover:bg-[#00B5B5]/10 group-hover:text-[#00B5B5] transition-all uppercase">
                                    Book
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {suggestions.doctors.length === 0 && suggestions.clinics.length === 0 && !isLoadingSuggestions && (
                            <div className="py-6 text-center text-slate-400">
                              <p className="text-xs font-bold mb-0.5">No exact matches found for "{searchTerm}"</p>
                              <p className="text-[10px] font-medium text-slate-300">Try searching with a broader name or check other filters.</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 2: POPULAR SPECIALTIES */}
      <Section className="bg-white">
        <Container>
          <SectionHeader 
            title="Popular Specialties"
            description="Choose a specialty to discover experienced doctors near your location."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialtiesList.map((specialty, index) => {
              const Icon = specialty.icon;
              const isActive = selectedSpecialty === specialty.name;
              return (
                <Card
                  key={index}
                  onClick={() => {
                    setSelectedSpecialty(specialty.name);
                    setTimeout(() => {
                      document.getElementById('doctor-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className={`bg-white rounded-[2rem] p-8 border border-slate-100 transition-all duration-500 group cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${isActive
                      ? 'border-[#00B5B5]/50 shadow-2xl shadow-[#00B5B5]/10 bg-gradient-to-b from-[#F0FDFD] to-white'
                      : 'hover:border-[#00B5B5]/30 hover:shadow-xl hover:shadow-[#00B5B5]/5 hover:-translate-y-2'
                    }`}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div>
                    {/* Top bar with Icon and Count */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${isActive
                          ? 'bg-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/30'
                          : 'bg-slate-50 text-[#00B5B5] border border-slate-100 group-hover:bg-[#00B5B5] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#00B5B5]/25 group-hover:scale-105'
                        }`}>
                        <Icon size={26} className="group-hover:rotate-12 transition-transform duration-500" />
                      </div>

                      <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        {exactCounts[specialty.name.toLowerCase()] !== undefined ? (
                          exactCounts[specialty.name.toLowerCase()] === 1 ? '1 Doctor' : `${exactCounts[specialty.name.toLowerCase()]} Doctors`
                        ) : `${specialty.count}+ Doctors`}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-extrabold mb-3 transition-colors relative z-10 leading-snug tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-900 group-hover:text-[#00B5B5]'
                      }`}>
                      {specialty.name}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6 relative z-10 transition-colors group-hover:text-slate-500">
                      {specialty.desc}
                    </p>
                  </div>

                  {/* Action Footer Button */}
                  <div className="pt-5 border-t border-slate-50 relative z-10">
                    <span className="text-[#00B5B5] text-xs font-black flex items-center gap-2 uppercase tracking-widest">
                      View Doctors
                      <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  {/* Glowing Bottom Border Accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00B5B5]/60 to-transparent transition-transform duration-500 scale-x-0 ${isActive ? 'scale-x-100' : 'group-hover:scale-x-100'
                    }`} />
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* MAIN BROWSER GRID: SECTION 3 (OVERVIEW), 4 (FILTERS) & 5 (DOCTORS) */}
      <Section id="doctor-listings" className="border-t border-slate-200/50 scroll-mt-20">
        <Container>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* SECTION 4: SMART FILTERS (LEFT 3 COLUMNS) */}
            <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <span className="text-md font-black text-slate-900 flex items-center gap-2">
                  <Filter size={18} className="text-[#00B5B5]" />
                  Refine Your Search
                </span>
                {(filterExperience !== 'all' || filterFee !== 'all' || filterAvailability !== 'all' || filterLanguage !== 'all' || filterGender !== 'all' || filterClinicType !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterExperience('all');
                      setFilterFee('all');
                      setFilterAvailability('all');
                      setFilterLanguage('all');
                      setFilterGender('all');
                      setFilterClinicType('all');
                    }}
                    className="text-xs font-bold text-[#00B5B5] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Experience */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">Experience</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Experience' },
                      { value: '0-5', label: '0-5 Years' },
                      { value: '5-10', label: '5-10 Years' },
                      { value: '10+', label: '10+ Years' }
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="exp"
                          checked={filterExperience === opt.value}
                          onChange={() => setFilterExperience(opt.value)}
                          className="w-4 h-4 text-[#00B5B5] focus:ring-[#00B5B5]/20 border-slate-200"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Consultation Fee */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">Consultation Fee</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Prices' },
                      { value: '200-500', label: '₹200 - ₹500' },
                      { value: '500-1000', label: '₹500 - ₹1000' },
                      { value: '1000+', label: '₹1000+' }
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="fee"
                          checked={filterFee === opt.value}
                          onChange={() => setFilterFee(opt.value)}
                          className="w-4 h-4 text-[#00B5B5] focus:ring-[#00B5B5]/20 border-slate-200"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">Availability</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'Any day' },
                      { value: 'today', label: 'Available Today' },
                      { value: 'tomorrow', label: 'Available Tomorrow' },
                      { value: 'week', label: 'This Week' }
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="avail"
                          checked={filterAvailability === opt.value}
                          onChange={() => setFilterAvailability(opt.value)}
                          className="w-4 h-4 text-[#00B5B5] focus:ring-[#00B5B5]/20 border-slate-200"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">Language</h4>
                  <div className="space-y-2">
                    {['all', 'Hindi', 'English', 'Bengali', 'Urdu'].map((lang) => (
                      <label key={lang} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="lang"
                          checked={filterLanguage === lang}
                          onChange={() => setFilterLanguage(lang)}
                          className="w-4 h-4 text-[#00B5B5] focus:ring-[#00B5B5]/20 border-slate-200"
                        />
                        <span>{lang === 'all' ? 'All Languages' : lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">Gender</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Genders' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' }
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={filterGender === opt.value}
                          onChange={() => setFilterGender(opt.value)}
                          className="w-4 h-4 text-[#00B5B5] focus:ring-[#00B5B5]/20 border-slate-200"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clinic Type */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">Clinic Type</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Clinics' },
                      { value: 'Private Clinic', label: 'Private Clinic' },
                      { value: 'Medical Center', label: 'Medical Center' }
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="clinicType"
                          checked={filterClinicType === opt.value}
                          onChange={() => setFilterClinicType(opt.value)}
                          className="w-4 h-4 text-[#00B5B5] focus:ring-[#00B5B5]/20 border-slate-200"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT MAIN LAYOUT: OVERVIEW & LISTINGS (RIGHT 9 COLUMNS) */}
            <div className="lg:col-span-9 space-y-8">

              {/* SECTION 3: SPECIALTY OVERVIEW */}
              <div className="bg-[#F6FCFC] border border-[#00B5B5]/15 rounded-[2.5rem] p-8">
                <h2 className="font-h2 text-slate-900 mb-2">
                  {selectedSpecialty} Specialists Near You
                </h2>
                <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                  Find experienced {selectedSpecialty} specialists for {selectedSpecialty.toLowerCase() === 'ent' ? 'ear infections, sinus issues, hearing concerns, throat disorders, allergies, and related treatments.' : 'related medical consultations, diagnostic monitoring, and preventative health treatments.'}
                </p>

                {/* Overview counter badges grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Doctors Found', value: `${totalDoctorsFound} Doctors` },
                    { label: 'Available Today', value: `${availableTodayCount} Available` },
                    { label: 'Average Consultation Fee', value: `₹${averageFee}` },
                    { label: 'Nearest Clinic Distance', value: `${minDistance} km Away` }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{stat.label}</p>
                      <p className="text-sm sm:text-md font-black text-slate-900 leading-none">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: LOCATION AWARE MESSAGE (Renders if no exact matching clinics in current location) */}
              {filteredDoctors.length > 0 && filteredDoctors.some(d => d.isFallback) && (
                <div className="bg-amber-50/50 border border-amber-200/40 rounded-[2rem] p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-800 font-bold text-sm">
                        No {selectedSpecialty} specialists are currently available in {currentLocation}.
                      </p>
                      <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                        Showing verified specialists from nearby cities based on distance and appointment availability.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nearby Locations:</span>
                        {['Ranchi', 'Patna', 'Gaya', 'Delhi'].map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setCurrentLocation(city);
                            }}
                            className="bg-white border border-slate-200 hover:border-[#00B5B5] hover:text-[#00B5B5] px-3 py-1 rounded-xl text-xs font-bold transition-all"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: DOCTOR LISTINGS */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <Loader2 className="w-12 h-12 text-[#00B5B5] animate-spin mb-4" />
                  <p className="text-slate-500 font-bold text-md">Assembling the directory...</p>
                </div>
              ) : filteredDoctors.length > 0 ? (
                <div className="space-y-6">
                  {filteredDoctors.map((doctor: Doctor) => (
                    <div
                      key={doctor._id}
                      className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-md hover:shadow-xl hover:shadow-[#00B5B5]/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-[#00B5B5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                      {/* Top badges bar */}
                      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                        {doctor.emergencyConsultation && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/50 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                            <PhoneCall size={10} />
                            Emergency Available
                          </span>
                        )}
                      </div>

                      {/* Info Row */}
                      <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                        {/* Avatar */}
                        <div className="relative shrink-0 mx-auto sm:mx-0">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 ring-4 ring-slate-100 shadow-md">
                            <img
                              src={resolveImageUrl(doctor.user.avatar) || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop'}
                              alt={`Dr. ${doctor.user.name}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow border border-slate-50">
                            <CheckCircle2 size={16} className="text-[#00B5B5] fill-[#F0FDFD]" />
                          </div>
                        </div>

                        {/* Text info */}
                        <div className="flex-grow w-full text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2 gap-2">
                            <div>
                              <h4 className="text-lg font-black text-slate-900 leading-tight">
                                Dr. {doctor.user.name}
                              </h4>
                              <p className="text-[#00B5B5] font-black text-[10px] uppercase tracking-widest mt-0.5">
                                {doctor.specialty} Specialist
                              </p>
                            </div>

                            {/* Rating */}
                            <div className="bg-[#F0FDFD] text-[#00B5B5] px-3 py-1 rounded-xl text-xs font-black flex items-center border border-[#E0F7F7] shrink-0">
                              <Star size={12} className="mr-1 fill-amber-500 text-amber-500" />
                              {doctor.rating?.toFixed(1) || '4.8'}
                              <span className="text-slate-400 font-bold ml-1">({doctor.reviews || '120'} Reviews)</span>
                            </div>
                          </div>

                          {/* Clinic Name */}
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 font-bold mb-3">
                            <Building2 size={13} className="text-slate-400" />
                            <span>{doctor.clinicName || 'Central Healthcare Clinic'}</span>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold justify-center sm:justify-start">
                              <Clock size={14} className="text-slate-400" />
                              <span>{doctor.experience} Yrs Exp</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold justify-center sm:justify-start">
                              <MapPin size={14} className="text-slate-400 shrink-0" />
                              <span className="truncate">{doctor.district}, {doctor.state}</span>
                            </div>

                            <div className="flex items-center gap-2 text-[#00B5B5] text-xs font-black uppercase tracking-wider justify-center sm:justify-start col-span-2 sm:col-span-1">
                              <Navigation size={12} />
                              <span>{doctor.distance ? `${Math.round(doctor.distance / 1000)} km Away` : '120 km Away'}</span>
                            </div>

                            <div className="col-span-2 sm:col-span-3 pt-2.5 border-t border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <span>Fee:</span>
                                <span className="text-slate-900 font-black">₹{doctor.consultationFee || 500}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold justify-center sm:justify-start">
                                <Languages size={12} className="text-slate-400" />
                                <span className="truncate">Languages: {doctor.languages ? doctor.languages.join(', ') : 'Hindi, English'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Availability & slot display */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                          <Calendar size={14} className="text-[#00B5B5]" />
                          <span>Next Available: <strong>Today • 4:30 PM</strong></span>
                        </div>

                        <div className="flex gap-2.5 w-full sm:w-auto">
                          <Link
                            href={`/doctors/${doctor.slug || doctor._id}`}
                            className="btn-secondary-custom flex-1 sm:flex-initial !h-10 px-4 text-center font-bold text-xs"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/appointments?doctorId=${doctor._id}`}
                            className="btn-primary-custom flex-[1.5] sm:flex-initial !h-10 px-5 text-center font-black text-xs"
                          >
                            Book Appointment
                          </Link>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Specialists Match Your Filters</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-6 text-xs">
                    Try adjusting your smart filters (e.g. experience, fee ranges) or clear search to find more healthcare professionals.
                  </p>
                  <button
                    onClick={() => {
                      setFilterExperience('all');
                      setFilterFee('all');
                      setFilterAvailability('all');
                      setFilterLanguage('all');
                      setFilterGender('all');
                      setFilterClinicType('all');
                      setSearchTerm('');
                    }}
                    className="bg-[#00B5B5] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#009A9A] transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 7: WHY CHOOSE OUR SPECIALISTS */}
      <Section className="bg-white border-t border-slate-100">
        <Container>
          <SectionHeader 
            title="Why Choose BookMyDoctor"
            description="Providing accessible, transparent, and direct in-clinic appointment scheduling."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: 'Verified Doctors', desc: 'Every specialist is verified before joining our platform.', icon: <CheckCircle2 className="w-6 h-6 text-[#00B5B5]" /> },
              { title: 'Transparent Fees', desc: 'Know the consultation cost before booking.', icon: <DollarSign className="w-6 h-6 text-[#00B5B5]" /> },
              { title: 'Trusted Reviews', desc: 'Read authentic feedback from patients.', icon: <Star className="w-6 h-6 text-[#00B5B5] fill-amber-400 text-amber-400" /> },
              { title: 'Easy Booking', desc: 'Book appointments within minutes.', icon: <Calendar className="w-6 h-6 text-[#00B5B5]" /> },
              { title: 'Nearby Access', desc: 'Find doctors closest to your location.', icon: <MapPin className="w-6 h-6 text-[#00B5B5]" /> }
            ].map((card, i) => (
              <Card key={i} className="flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
                    {card.icon}
                  </div>
                  <h3 className="font-h3 text-slate-900 mb-2">{card.title}</h3>
                  <p className="font-body-secondary text-slate-500">{card.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* SECTION 8: HEALTH CONDITIONS SECTION */}
      <Section className="bg-[#F6FCFC] border-t border-slate-200/30">
        <Container>
          <SectionHeader 
            title={`Healthcare Services`}
            description={`Find expert diagnosis and customized treatments for standard health issues.`}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {getConditionsBySpecialty(selectedSpecialty).map((condition, index) => (
              <div key={index} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-center font-bold text-slate-800 text-xs hover:border-[#00B5B5] transition-all">
                {condition}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* SECTION 9: FAQ SECTION */}
      <Section className="bg-white border-t border-slate-100">
        <Container className="max-w-3xl">
          <SectionHeader 
            title="Frequently Asked Questions"
          />

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-6 text-left font-extrabold text-slate-800 hover:text-[#00B5B5] transition-colors"
                >
                  <h3 className="font-h3 text-slate-900 m-0 p-0 flex-grow text-left">{faq.q}</h3>
                  {expandedFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-500 font-semibold leading-relaxed border-t border-slate-50 pt-4">
                    <p className="font-body-secondary text-slate-500">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* SECTION 10: CTA SECTION */}
      <Section className="bg-[#F0FDFD] border-t border-[#00B5B5]/10 text-center">
        <Container className="max-w-2xl">
          <h2 className="font-h2 text-slate-900 mb-4">Ready to Book Your Appointment?</h2>
          <p className="font-body-primary text-slate-500 mx-auto mb-8">
            Compare specialists, view available slots, and secure your appointment in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button
              onClick={() => {
                const resultsSection = document.querySelector('.lg:col-span-9');
                if (resultsSection) {
                  resultsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn-primary-custom w-full sm:w-auto"
            >
              Book Appointment
            </button>
            <button
              onClick={() => setSelectedSpecialty('')}
              className="btn-secondary-custom w-full sm:w-auto"
            >
              Browse All Specialties
            </button>
          </div>
        </Container>
      </Section>

      {/* LOCAL LOCATION SELECTOR MODAL (FOR MOBILE & DESKTOP SUITABILITY) */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-10 text-left p-6 sm:p-8"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#00B5B5]" />
                  <span className="text-base font-black text-slate-900">Select Your Location</span>
                </div>
                <button 
                  onClick={() => setIsManualModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5">
                {/* State Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                  <select 
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] transition-all outline-none"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    <option value="">Choose State</option>
                    {modalStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* District Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">District</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] transition-all outline-none disabled:opacity-50"
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                      }}
                      disabled={!selectedState || isLoadingModalLocations}
                    >
                      <option value="">{isLoadingModalLocations ? 'Loading...' : 'Choose District'}</option>
                      {modalDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {isLoadingModalLocations && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-[#00B5B5]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Pincode Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pincode</label>
                  <input 
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#00B5B5]/20 focus:border-[#00B5B5] transition-all outline-none"
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincode(val);
                      if (val.length === 6) {
                        setIsManualModalOpen(false);
                      }
                    }}
                  />
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  disabled={!selectedDistrict}
                  className="w-full mt-4 py-3.5 rounded-2xl bg-[#00B5B5] hover:bg-[#009b9b] text-white text-xs font-black transition-all shadow-md shadow-[#00B5B5]/20 disabled:opacity-40"
                >
                  Confirm Location
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SpecialtiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#00B5B5] animate-spin" /></div>}>
      <SpecialtiesList />
    </Suspense>
  );
}
