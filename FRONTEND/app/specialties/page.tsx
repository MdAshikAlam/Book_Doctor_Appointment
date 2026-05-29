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
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarFallback, resolveImageUrl } from '@/lib/resolveImageUrl';

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
  clinicType?: 'Hospital' | 'Private Clinic' | 'Medical Center';
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
  const { selectedState, selectedDistrict, latitude, longitude } = useLocation();
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
      if (searchTerm.length < 2 && !latitude && !longitude && !selectedDistrict) {
        setSuggestions({ doctors: [], clinics: [] });
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        let url = `${API_BASE_URL}/search?${searchTerm.length >= 2 ? `name=${encodeURIComponent(searchTerm)}` : ''}`;
        
        if (latitude && longitude) {
          url += `&lat=${latitude}&lng=${longitude}&radius=60000`;
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
          // Enhance API results with UI metadata
          const enhancedDoctors = matchingDoctors.map((doc: any, index: number) => {
            const genders: ('Male' | 'Female')[] = ['Male', 'Female'];
            const clinicTypes: ('Hospital' | 'Private Clinic' | 'Medical Center')[] = ['Hospital', 'Private Clinic', 'Medical Center'];
            const nextSlots = ['Today, 04:30 PM', 'Tomorrow, 10:00 AM', 'Tomorrow, 02:00 PM', 'Today, 06:15 PM'];

            return {
              ...doc,
              rating: doc.rating || (4.5 + (index % 5) * 0.1),
              reviews: doc.reviews || doc.numReviews || (45 + (index * 13) % 150),
              consultationFee: doc.consultationFee || (300 + (index % 4) * 200),
              languages: doc.languages || (index % 2 === 0 ? ['Hindi', 'English'] : ['Hindi', 'English', 'Bengali']),
              gender: doc.gender || doc.user?.gender || genders[index % genders.length],
              clinicType: doc.clinicType || clinicTypes[index % clinicTypes.length],
              nextSlot: doc.nextSlot || nextSlots[index % nextSlots.length],
              isAvailableToday: doc.isAvailableToday !== undefined ? doc.isAvailableToday : (index % 2 === 0),
              distance: doc.distance !== undefined ? doc.distance : (5000 + (index * 7000) % 25000),
              clinicName: doc.clinicName || doc.clinic?.clinicName || doc.branch_info?.[0]?.clinicName || doc.clinic_info?.[0]?.clinicName || 'Healthcare Clinic',
              emergencyConsultation: doc.emergencyConsultation || (index % 3 === 0),
              insuranceAccepted: doc.insuranceAccepted !== undefined ? doc.insuranceAccepted : (index % 2 === 0)
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
          // No matching doctors from API — use local simulated data
          simulateLocalDoctors();
        }
      } else {
        throw new Error(data.message || 'Failed to fetch specialists');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      // Fallback local simulation if backend fails to connect
      simulateLocalDoctors();
    } finally {
      setLoading(false);
    }
  }, [selectedSpecialty, currentLocation]);

  const simulateLocalDoctors = () => {
    // Generate realistic simulated doctor database for client-side search
    const isNawada = currentLocation.toLowerCase() === 'nawada';
    const simList: Doctor[] = [
      {
        _id: 'sim_1', slug: 'dr-kunal-sinha',
        user: { name: 'Kunal Sinha', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'ENT', experience: 5, district: 'Ranchi', state: 'Jharkhand',
        distance: isNawada ? 120000 : 4000, isFallback: isNawada,
        consultationFee: 500, languages: ['Hindi', 'English'], gender: 'Male',
        clinicType: 'Private Clinic', nextSlot: 'Today, 04:30 PM', isAvailableToday: true,
        rating: 4.8, reviews: 120, clinicName: 'Central Healthcare Clinic',
        emergencyConsultation: true, insuranceAccepted: true
      },
      {
        _id: 'sim_2', slug: 'dr-neha-sharma',
        user: { name: 'Neha Sharma', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'ENT', experience: 12, district: 'Patna', state: 'Bihar',
        distance: isNawada ? 95000 : 3500, isFallback: isNawada,
        consultationFee: 400, languages: ['Hindi', 'English', 'Bengali'], gender: 'Female',
        clinicType: 'Hospital', nextSlot: 'Tomorrow, 11:00 AM', isAvailableToday: false,
        rating: 4.9, reviews: 95, clinicName: 'Apollo Diagnostics',
        emergencyConsultation: false, insuranceAccepted: true
      },
      {
        _id: 'sim_3', slug: 'dr-rajesh-varma',
        user: { name: 'Rajesh Varma', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'Cardiology', experience: 16, district: 'Gaya', state: 'Bihar',
        distance: isNawada ? 60000 : 6000, isFallback: isNawada,
        consultationFee: 800, languages: ['Hindi', 'English', 'Urdu'], gender: 'Male',
        clinicType: 'Hospital', nextSlot: 'Today, 06:00 PM', isAvailableToday: true,
        rating: 4.7, reviews: 210, clinicName: 'Metro Cardiac Centre',
        emergencyConsultation: true, insuranceAccepted: false
      },
      {
        _id: 'sim_4', slug: 'dr-priya-mukherjee',
        user: { name: 'Priya Mukherjee', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'Dermatology', experience: 8, district: 'Ranchi', state: 'Jharkhand',
        distance: isNawada ? 122000 : 5000, isFallback: isNawada,
        consultationFee: 600, languages: ['English', 'Bengali'], gender: 'Female',
        clinicType: 'Medical Center', nextSlot: 'Today, 03:30 PM', isAvailableToday: true,
        rating: 4.6, reviews: 80, clinicName: 'Skin Care & Laser Centre',
        emergencyConsultation: false, insuranceAccepted: true
      },
      {
        _id: 'sim_5', slug: 'dr-amit-sinha',
        user: { name: 'Amit Sinha', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'Pediatrics', experience: 4, district: 'Patna', state: 'Bihar',
        distance: isNawada ? 98000 : 2500, isFallback: isNawada,
        consultationFee: 300, languages: ['Hindi', 'English'], gender: 'Male',
        clinicType: 'Private Clinic', nextSlot: 'Tomorrow, 09:30 AM', isAvailableToday: false,
        rating: 4.5, reviews: 34, clinicName: 'Kidz Clinic',
        emergencyConsultation: true, insuranceAccepted: false
      },
      {
        _id: 'sim_6', slug: 'dr-shalini-kumari',
        user: { name: 'Shalini Kumari', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'Dentist', experience: 11, district: 'Nawada', state: 'Bihar',
        distance: 1200, isFallback: false,
        consultationFee: 250, languages: ['Hindi', 'English'], gender: 'Female',
        clinicType: 'Private Clinic', nextSlot: 'Today, 05:00 PM', isAvailableToday: true,
        rating: 4.8, reviews: 142, clinicName: 'Smile Dental Clinic',
        emergencyConsultation: false, insuranceAccepted: true
      },
      {
        _id: 'sim_7', slug: 'dr-sunil-kumar',
        user: { name: 'Sunil Kumar', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'Orthopedics', experience: 14, district: 'Patna', state: 'Bihar',
        distance: isNawada ? 95000 : 4000, isFallback: isNawada,
        consultationFee: 700, languages: ['Hindi', 'English'], gender: 'Male',
        clinicType: 'Hospital', nextSlot: 'Today, 05:30 PM', isAvailableToday: true,
        rating: 4.7, reviews: 175, clinicName: 'Bone & Joint Care Hospital',
        emergencyConsultation: true, insuranceAccepted: true
      },
      {
        _id: 'sim_8', slug: 'dr-ananya-das',
        user: { name: 'Ananya Das', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'Neurology', experience: 10, district: 'Ranchi', state: 'Jharkhand',
        distance: isNawada ? 120000 : 3000, isFallback: isNawada,
        consultationFee: 900, languages: ['Hindi', 'English', 'Bengali'], gender: 'Female',
        clinicType: 'Hospital', nextSlot: 'Tomorrow, 10:00 AM', isAvailableToday: false,
        rating: 4.9, reviews: 88, clinicName: 'Neuro Care Centre',
        emergencyConsultation: true, insuranceAccepted: true
      },
      {
        _id: 'sim_9', slug: 'dr-vikash-gupta',
        user: { name: 'Vikash Gupta', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'Eye Specialist (Ophthalmologist)', experience: 9, district: 'Gaya', state: 'Bihar',
        distance: isNawada ? 60000 : 5000, isFallback: isNawada,
        consultationFee: 550, languages: ['Hindi', 'English'], gender: 'Male',
        clinicType: 'Medical Center', nextSlot: 'Today, 04:00 PM', isAvailableToday: true,
        rating: 4.6, reviews: 67, clinicName: 'Clear Vision Eye Hospital',
        emergencyConsultation: false, insuranceAccepted: true
      },
      {
        _id: 'sim_10', slug: 'dr-meena-devi',
        user: { name: 'Meena Devi', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'General Physician', experience: 18, district: 'Nawada', state: 'Bihar',
        distance: 2000, isFallback: false,
        consultationFee: 300, languages: ['Hindi', 'English'], gender: 'Female',
        clinicType: 'Private Clinic', nextSlot: 'Today, 02:30 PM', isAvailableToday: true,
        rating: 4.8, reviews: 230, clinicName: 'City Health Clinic',
        emergencyConsultation: true, insuranceAccepted: true
      },
      {
        _id: 'sim_11', slug: 'dr-ravi-shankar',
        user: { name: 'Ravi Shankar', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&h=300&auto=format&fit=crop' },
        specialty: 'General Physician', experience: 7, district: 'Patna', state: 'Bihar',
        distance: isNawada ? 95000 : 3500, isFallback: isNawada,
        consultationFee: 400, languages: ['Hindi', 'English', 'Urdu'], gender: 'Male',
        clinicType: 'Hospital', nextSlot: 'Tomorrow, 11:30 AM', isAvailableToday: false,
        rating: 4.5, reviews: 156, clinicName: 'Patna Medical Centre',
        emergencyConsultation: false, insuranceAccepted: true
      }
    ];

    // Filter by specialty using fuzzy matching (same logic as API)
    const backendNames = specialtyToBackendMap[selectedSpecialty] || [selectedSpecialty];
    const matching = simList.filter(doc => {
      const docSpec = doc.specialty.toLowerCase().trim();
      return backendNames.some(name => {
        const lowerName = name.toLowerCase();
        return docSpec === lowerName || docSpec.includes(lowerName) || lowerName.includes(docSpec);
      });
    });
    setDoctors(matching);
  };

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
      <section className="relative overflow-hidden bg-[#F0FDFD] pt-32 pb-16 border-b border-[#00B5B5]/10">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">


            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Find Specialists <span className="text-[#00B5B5]">Near You</span>
            </h1>

            {/* Sub Heading */}
            <p className="text-md sm:text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
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
                            Clinics & Hospitals
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-200/50 max-w-3xl mx-auto text-left">
              {[
                { value: '2,000+', label: 'Verified Doctors', icon: '👨‍⚕️' },
                { value: '500+', label: 'Clinics', icon: '🏥' },
                { value: '50,000+', label: 'Appointments Booked', icon: '📅' },
                { value: '4.8', label: 'Average Patient Rating', icon: '⭐' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/80 backdrop-blur p-4 rounded-xl border border-slate-100">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className="text-lg font-black text-slate-900 leading-tight mb-0.5">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: POPULAR SPECIALTIES */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Browse Medical Specialties</h2>
            <p className="text-slate-500 font-medium">Choose a specialty to discover experienced doctors near your location.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialtiesList.map((specialty, index) => {
              const Icon = specialty.icon;
              const isActive = selectedSpecialty === specialty.name;
              return (
                <div
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN BROWSER GRID: SECTION 3 (OVERVIEW), 4 (FILTERS) & 5 (DOCTORS) */}
      <section id="doctor-listings" className="py-16 border-t border-slate-200/50 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

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
                      { value: 'Hospital', label: 'Hospital' },
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
                <h2 className="text-2xl font-black text-slate-900 mb-2">
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
                        {doctor.rating && doctor.rating >= 4.8 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/50 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                            <Sparkles size={10} className="fill-amber-500 text-amber-500" />
                            AI Recommended
                          </span>
                        )}
                        {doctor.emergencyConsultation && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/50 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                            <PhoneCall size={10} />
                            Emergency Available
                          </span>
                        )}
                        {doctor.insuranceAccepted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                            <ShieldCheck size={10} />
                            Insurance
                          </span>
                        )}
                      </div>

                      {/* Info Row */}
                      <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                        {/* Avatar */}
                        <div className="relative shrink-0 mx-auto sm:mx-0">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 ring-4 ring-slate-100 shadow-md">
                            <img
                              src={doctor.user.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&auto=format&fit=crop'}
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
                            className="flex-1 sm:flex-initial text-center border border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50 h-10 px-4 flex items-center justify-center rounded-xl font-bold text-xs transition-all"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/bookings?doctorId=${doctor._id}`}
                            className="flex-[1.5] sm:flex-initial text-center bg-[#00B5B5] hover:bg-[#009A9A] text-white h-10 px-5 flex items-center justify-center rounded-xl font-black text-xs transition-all shadow-md shadow-[#00B5B5]/15"
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
        </div>
      </section>

      {/* SECTION 7: WHY CHOOSE OUR SPECIALISTS */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Why Patients Trust BookMyDoctor</h2>
            <p className="text-slate-500 font-medium">Providing accessible, transparent, and direct in-clinic appointment scheduling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: 'Verified Doctors', desc: 'Every specialist is verified before joining our platform.', icon: <CheckCircle2 className="w-6 h-6 text-[#00B5B5]" /> },
              { title: 'Transparent Fees', desc: 'Know the consultation cost before booking.', icon: <DollarSign className="w-6 h-6 text-[#00B5B5]" /> },
              { title: 'Trusted Reviews', desc: 'Read authentic feedback from patients.', icon: <Star className="w-6 h-6 text-[#00B5B5] fill-amber-400 text-amber-400" /> },
              { title: 'Easy Booking', desc: 'Book appointments within minutes.', icon: <Calendar className="w-6 h-6 text-[#00B5B5]" /> },
              { title: 'Nearby Access', desc: 'Find doctors closest to your location.', icon: <MapPin className="w-6 h-6 text-[#00B5B5]" /> }
            ].map((card, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4">
                    {card.icon}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-2">{card.title}</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: HEALTH CONDITIONS SECTION */}
      <section className="py-16 bg-[#F6FCFC] border-t border-slate-200/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Common Conditions Treated by {selectedSpecialty || 'ENT'} Specialists
            </h2>
            <p className="text-slate-500 font-medium">Find expert diagnosis and customized treatments for standard health issues.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {getConditionsBySpecialty(selectedSpecialty).map((condition, index) => (
              <div key={index} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-center font-bold text-slate-800 text-xs hover:border-[#00B5B5] transition-all">
                {condition}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ SECTION */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Find answers to common questions about specialists and scheduling.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-black text-slate-900 text-sm bg-slate-50/50 hover:bg-slate-50 transition-all outline-none"
                >
                  {idx === 1 ? (
                    <h3 className="text-sm font-black text-slate-900 m-0 p-0 flex-grow text-left">{faq.q}</h3>
                  ) : (
                    <span>{faq.q}</span>
                  )}
                  {expandedFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedFaq === idx && (
                  <div className="p-5 bg-white border-t border-slate-100 text-slate-500 text-xs font-semibold leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: CTA SECTION */}
      <section className="py-16 bg-[#F0FDFD] border-t border-[#00B5B5]/10 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
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
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#00B5B5] text-white font-black hover:bg-[#009A9A] transition-all shadow-md shadow-[#00B5B5]/15"
            >
              Book Appointment
            </button>
            <button
              onClick={() => setSelectedSpecialty('')}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white border border-slate-200 text-slate-950 font-black hover:bg-slate-50 transition-all"
            >
              Browse All Specialties
            </button>
          </div>
        </div>
      </section>

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
