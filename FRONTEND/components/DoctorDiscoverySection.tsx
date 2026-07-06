'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Video, 
  Check, 
  X, 
  ShieldCheck, 
  Star, 
  Clock, 
  Filter, 
  ChevronDown, 
  ListFilter, 
  RotateCcw, 
  AlertCircle, 
  Building2, 
  Zap, 
  Calendar,
  Sparkles,
  Loader2,
  Stethoscope,
  Smile,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/context/LocationContext';
import DoctorCard from './DoctorCard';
import Section from './ui/Section';
import Container from './ui/Container';
import SectionHeader from './ui/SectionHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// Constants
const SPECIALTIES = [
  'All',
  'General Physician',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Urology',
  'Nephrology',
  'Oncology',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'Rheumatology',
  'Dentistry',
  'Physiotherapy',
  'General Surgery',
  'Plastic Surgery',
  'Emergency Medicine'
];

interface Doctor {
  _id: string;
  slug?: string;
  user: {
    name: string;
    avatar?: string;
    gender?: string;
  };
  specialty: string;
  experience: number;
  district: string;
  state: string;
  distance?: number;
  isFallback?: boolean;
  rating?: number;
  numReviews?: number;
  consultationFee?: number;
  languages?: string[];
  videoConsultation?: boolean;
  emergencyConsultation?: boolean;
  insuranceAccepted?: boolean;
  // API returns clinic data as arrays from aggregation lookups
  clinic?: any;
  clinic_info?: { clinicName?: string; [key: string]: any }[];
  branch_info?: { clinicName?: string; [key: string]: any }[];
  availability?: {
    day: string;
    slots: string[];
  }[];
}

export default function DoctorDiscoverySection() {
  const { 
    selectedState, 
    selectedDistrict, 
    setSelectedState, 
    setSelectedDistrict,
    clearLocation
  } = useLocation();

  // Location Geolocation Coords
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(5); // 5km default
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // States & Districts list for manual selection
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [showManualLocDropdown, setShowManualLocDropdown] = useState(false);

  // Search & Suggestions
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Filter state
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [gender, setGender] = useState('all');
  const [maxFee, setMaxFee] = useState<number>(5000);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [videoConsultation, setVideoConsultation] = useState(false);
  const [emergencyConsultation, setEmergencyConsultation] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);

  // Sorting
  const [sort, setSort] = useState('relevance');

  // Results State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  // Advanced Filters Panel toggles
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowManualLocDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch States list for Manual selector
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setIsLoadingLocations(true);
        const res = await fetch(`${API_BASE_URL}/utility/states`);
        const data = await res.json();
        if (data.status === 'success') {
          setStates(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch states:', err);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    if (showManualLocDropdown && states.length === 0) {
      fetchStates();
    }
  }, [showManualLocDropdown, states.length]);

  // Fetch Districts when State changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        return;
      }
      try {
        setIsLoadingLocations(true);
        const res = await fetch(`${API_BASE_URL}/utility/districts?state=${encodeURIComponent(selectedState)}`);
        const data = await res.json();
        if (data.status === 'success') {
          setDistricts(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    if (selectedState) {
      fetchDistricts();
    }
  }, [selectedState]);

  // Browser Geolocation Permission Request
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setShowManualLocDropdown(true);
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setIsLocating(false);
        setShowManualLocDropdown(false);
        // Clear manual context state
        clearLocation();
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please choose your city/district manually.');
        } else {
          setLocationError('Could not fetch GPS location. Please try manually.');
        }
        setShowManualLocDropdown(true);
      },
      { timeout: 10000 }
    );
  };

  // Search Autocomplete suggestions fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Do not fetch suggestions if location is not selected
      if (!lat && !lng && !selectedDistrict) {
        setSuggestions([]);
        return;
      }

      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        let url = `${API_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}`;
        
        // Context variables
        if (lat && lng) {
          url += `&lat=${lat}&lng=${lng}&radius=${radius}`;
        } else if (selectedDistrict) {
          url += `&district=${encodeURIComponent(selectedDistrict)}`;
          if (selectedState) url += `&state=${encodeURIComponent(selectedState)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'success') {
          const docSuggs = data.data.doctors.map((d: any) => ({
            type: 'doctor',
            id: d._id,
            name: `Dr. ${d.user.name}`,
            sub: d.specialty,
            clinicName: d.clinicName || d.clinic?.clinicName || d.branch_info?.[0]?.clinicName || d.clinic_info?.[0]?.clinicName || ''
          }));
          const clinicSuggs = data.data.clinics.map((c: any) => ({
            type: 'clinic',
            id: c._id,
            name: c.name,
            sub: c.clinicType
          }));
          setSuggestions([...docSuggs, ...clinicSuggs]);
        }
      } catch (err) {
        console.error('Suggestions error:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 350);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, lat, lng, radius, selectedDistrict, selectedState]);

  // Main Doctors API Fetch
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Search term
      if (searchTerm) {
        params.append('name', searchTerm);
      }

      // Specialty chip
      if (selectedSpecialty && selectedSpecialty !== 'All') {
        params.append('specialty', selectedSpecialty);
      }

      // Location queries
      if (lat && lng) {
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
        params.append('radius', radius.toString());
      } else if (selectedDistrict) {
        params.append('district', selectedDistrict);
        if (selectedState) {
          params.append('state', selectedState);
        }
        params.append('radius', radius.toString());
      }

      // Advanced filters
      if (gender !== 'all') params.append('gender', gender);
      if (maxFee < 5000) params.append('maxFee', maxFee.toString());
      if (minExperience > 0) params.append('minExperience', minExperience.toString());
      if (minRating > 0) params.append('minRating', minRating.toString());
      if (videoConsultation) params.append('videoConsultation', 'true');
      if (emergencyConsultation) params.append('emergencyConsultation', 'true');
      if (availableToday) params.append('availableToday', 'true');

      // Sorting
      if (sort) {
        params.append('sort', sort);
      }

      const url = `${API_BASE_URL}/doctors?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'success') {
        setDoctors(data.data.doctors);
        setApiMessage(data.message || null);
      } else {
        setDoctors([]);
        setApiMessage(null);
      }
    } catch (err) {
      console.error('Fetch doctors error:', err);
      setDoctors([]);
      setApiMessage(null);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedSpecialty,
    lat,
    lng,
    radius,
    selectedDistrict,
    selectedState,
    gender,
    maxFee,
    minExperience,
    minRating,
    videoConsultation,
    emergencyConsultation,
    availableToday,
    sort
  ]);

  // Fetch doctors on parameter changes
  useEffect(() => {
    fetchDoctors();
    setVisibleCount(6); // reset pagination when filters change
  }, [fetchDoctors]);

  // Smart suggestions selection click handler
  const handleSelectSuggestion = (item: any) => {
    setSearchTerm(item.name.replace('Dr. ', ''));
    setShowSuggestions(false);
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All');
    setGender('all');
    setMaxFee(5000);
    setMinExperience(0);
    setMinRating(0);
    setVideoConsultation(false);
    setEmergencyConsultation(false);
    setAvailableToday(false);
    setSort('relevance');
    setLat(null);
    setLng(null);
    clearLocation();
    setApiMessage(null);
  };

  // Has active filters checker
  const hasActiveFilters = 
    selectedSpecialty !== 'All' ||
    gender !== 'all' ||
    maxFee < 5000 ||
    minExperience > 0 ||
    minRating > 0 ||
    videoConsultation ||
    emergencyConsultation ||
    availableToday ||
    searchTerm !== '' ||
    lat !== null ||
    selectedDistrict !== '';

  return (
    <Section className="bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50 relative z-30" id="doctor-discovery">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#00B5B5]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <Container>
        
        {/* Title Block */}
        <SectionHeader 
          title="Trusted Doctors Near You"
          description="Explore verified doctors available across multiple specialties and healthcare facilities."
        />

        {/* Search, Location, Radius Bar */}
        <div className="bg-white rounded-3xl border border-slate-100 p-4 md:p-6 shadow-xl shadow-slate-100/70 mb-8 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Search Input field */}
            <div className="lg:col-span-5 relative" ref={searchRef}>
              <div className="flex items-center bg-slate-50 border border-transparent focus-within:border-[#00B5B5]/20 focus-within:bg-white focus-within:shadow-md focus-within:shadow-teal-500/5 rounded-2xl px-4 py-3 transition-all group">
                <Search size={18} className="text-slate-400 group-focus-within:text-[#00B5B5] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search doctor name, specialty, clinic, or symptoms..."
                  className="bg-transparent border-none focus:ring-0 outline-none w-full text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 px-3"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && searchTerm.length >= 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[300px] overflow-y-auto z-50 p-4"
                  >
                    {!lat && !lng && !selectedDistrict ? (
                      <div className="py-6 px-4 text-center text-slate-500 rounded-xl bg-slate-50/50 border border-slate-100/50">
                        <div className="w-10 h-10 bg-[#00B5B5]/10 text-[#00B5B5] rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-extrabold text-slate-900 mb-1">Location Required</p>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-4">
                          Please select your location manually or allow auto-detection to search doctors and clinics.
                        </p>
                        
                        {locationError && (
                          <div className="mb-3 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-2">
                            {locationError}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                          <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00B5B5] hover:bg-[#009b9b] text-white text-[10px] font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#00B5B5]/15 disabled:opacity-50"
                          >
                            <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                            {isLocating ? 'Detecting...' : 'Auto-Detect'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setShowManualLocDropdown(true);
                              setShowSuggestions(false);
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-black flex items-center justify-center gap-1.5 transition-all"
                          >
                            <MapPin className="w-3 h-3 text-slate-400" />
                            Select Manually
                          </button>
                        </div>
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-primary text-xs font-black">
                            {item.type === 'doctor' ? <Stethoscope size={16} /> : <Building2 size={16} />}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-extrabold text-slate-800">{item.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.sub}</p>
                            {item.type === 'doctor' && item.clinicName && (
                              <p className="text-[9px] font-bold text-[#00B5B5] truncate mt-0.5">{item.clinicName}</p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400">
                        <p className="text-xs font-bold mb-0.5">No exact matches found for "{searchTerm}"</p>
                        <p className="text-[10px] font-medium text-slate-300">Try searching with a broader name or check other filters.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location flow selector */}
            <div className="lg:col-span-4 relative" ref={locationDropdownRef}>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManualLocDropdown(!showManualLocDropdown)}
                  className="flex-grow flex items-center justify-between gap-2 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100/50 hover:border-slate-200 rounded-2xl px-4 py-3 transition-all text-left group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#00B5B5]" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5">Location</p>
                      <p className="text-xs sm:text-sm font-black text-slate-800 leading-tight truncate max-w-[150px]">
                        {lat && lng ? 'GPS Current' : selectedDistrict || 'Select Area'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="bg-[#E0F7F7] hover:bg-[#00B5B5] text-[#00B5B5] hover:text-white px-4 rounded-2xl transition-all flex items-center justify-center border border-transparent shadow-sm hover:shadow-lg hover:shadow-[#00B5B5]/15 disabled:opacity-50 shrink-0"
                  title="Use Current Geolocation"
                >
                  {isLocating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Navigation size={16} className="rotate-45" />
                  )}
                </button>
              </div>

              {/* Manual selection dropdown */}
              <AnimatePresence>
                {showManualLocDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-5 w-80 left-0"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Manual Location Selection</span>
                        <button onClick={() => setShowManualLocDropdown(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>

                      {locationError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[10px] font-bold leading-relaxed">
                          {locationError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                        <select 
                          className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#00B5B5]/20 outline-none"
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setLat(null);
                            setLng(null);
                          }}
                        >
                          <option value="">Choose State</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">District</label>
                        <div className="relative">
                          <select 
                            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#00B5B5]/20 outline-none disabled:opacity-50"
                            value={selectedDistrict}
                            onChange={(e) => {
                              setSelectedDistrict(e.target.value);
                              setLat(null);
                              setLng(null);
                              setShowManualLocDropdown(false);
                            }}
                            disabled={!selectedState || isLoadingLocations}
                          >
                            <option value="">{isLoadingLocations ? 'Loading Districts...' : 'Choose District'}</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      {(selectedDistrict || lat) && (
                        <button
                          onClick={() => {
                            setLat(null);
                            setLng(null);
                            clearLocation();
                            setShowManualLocDropdown(false);
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={12} /> Clear Location
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Radius Selector */}
            <div className="lg:col-span-3">
              <div
                className={`flex items-center rounded-2xl px-4 py-3 border transition-all duration-300 ${
                  lat
                    ? 'bg-teal-50/60 border-[#00B5B5]/30 shadow-sm shadow-teal-500/10'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                {/* Live GPS indicator dot */}
                <div className={`w-2 h-2 rounded-full mr-2 shrink-0 transition-all duration-500 ${
                  lat ? 'bg-[#00B5B5] animate-pulse' : 'bg-slate-300'
                }`} />
                <span className={`text-[10px] font-black uppercase tracking-wider mr-2 shrink-0 transition-colors ${
                  lat ? 'text-[#00B5B5]' : 'text-slate-400'
                }`}>Radius</span>
                <select
                  className={`bg-transparent border-none outline-none text-xs sm:text-sm font-black w-full focus:ring-0 transition-colors ${
                    lat ? 'text-teal-800' : 'text-slate-500'
                  }`}
                  value={radius}
                  onChange={(e) => {
                    setRadius(Number(e.target.value));
                    // Auto-trigger GPS if not already set
                    if (!lat) {
                      handleUseCurrentLocation();
                    }
                  }}
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                  <option value={70}>70 km</option>
                </select>
              </div>
              {/* GPS status hint below the radius box */}
              {!lat && (
                <p className="text-[10px] font-bold text-slate-400 mt-1.5 text-right px-1 flex items-center justify-end gap-1">
                  <Navigation size={10} className="text-slate-400" />
                  Select to auto-enable GPS
                </p>
              )}
              {lat && (
                <p className="text-[10px] font-black text-[#00B5B5] mt-1.5 text-right px-1 flex items-center justify-end gap-1">
                  <Navigation size={10} className="text-[#00B5B5]" />
                  GPS active · {radius} km range
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Filter Section - Specialty Chips & Sorting */}
        <div className="flex flex-col gap-5 mb-8">
          
          {/* Horizontal Specialty Chips */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="w-full overflow-x-auto flex gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-200">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap border ${
                    selectedSpecialty === spec
                      ? 'bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-teal-500/20'
                      : 'bg-white border-slate-200/60 text-slate-600 hover:border-[#00B5B5]/40 hover:bg-slate-50/50'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Quick Toggle Advanced button & Sorting */}
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border text-xs font-black transition-all ${
                  showAdvancedFilters 
                    ? 'bg-teal-50/80 border-[#00B5B5]/30 text-[#00B5B5]' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={14} />
                Filters
              </button>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
                <ListFilter size={13} className="text-slate-400 mr-2" />
                <select
                  className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating: High to Low</option>
                  <option value="experience">Experience: High to Low</option>
                  <option value="fee_asc">Price: Low to High</option>
                  <option value="fee_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50 mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Gender Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor Gender</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                      {['all', 'male', 'female'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                            gender === g 
                              ? 'bg-white text-slate-800 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Fee Filter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Max Consultation Fee</span>
                      <span className="text-slate-800 text-xs font-black">₹{maxFee === 5000 ? 'Any' : maxFee}</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="5000" 
                      step="100"
                      value={maxFee} 
                      onChange={(e) => setMaxFee(Number(e.target.value))}
                      className="w-full accent-primary bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>₹100</span>
                      <span>₹5,000</span>
                    </div>
                  </div>

                  {/* Experience Filter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Min Experience</span>
                      <span className="text-slate-800 text-xs font-black">{minExperience === 0 ? 'Any' : `${minExperience}+ years`}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="25" 
                      step="1"
                      value={minExperience} 
                      onChange={(e) => setMinExperience(Number(e.target.value))}
                      className="w-full accent-primary bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>0 yrs</span>
                      <span>25 yrs</span>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minimum Rating</label>
                    <div className="flex gap-2">
                      {[0, 3, 4, 4.5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setMinRating(star)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            minRating === star
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {star === 0 ? 'Any' : (
                            <>
                              <Star size={11} className="fill-amber-500 text-amber-500" />
                              {star}+
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode / Feature Toggles */}
                  <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                      <input 
                        type="checkbox" 
                        checked={availableToday} 
                        onChange={() => setAvailableToday(!availableToday)}
                        className="rounded text-primary focus:ring-primary w-4.5 h-4.5"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-800">Available Today</p>
                        <p className="text-[10px] text-slate-400 font-bold">Show doctors open today</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group">
                      <input 
                        type="checkbox" 
                        checked={emergencyConsultation} 
                        onChange={() => setEmergencyConsultation(!emergencyConsultation)}
                        className="rounded text-primary focus:ring-primary w-4.5 h-4.5"
                      />
                      <div>
                        <p className="text-xs font-black text-slate-800">Emergency Care</p>
                        <p className="text-[10px] text-slate-400 font-bold">Instant call availability</p>
                      </div>
                    </label>
                  </div>

                  {/* Reset Filters button inside panel */}
                  {hasActiveFilters && (
                    <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                      <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 px-4 py-2 rounded-xl"
                      >
                        <RotateCcw size={12} /> Reset All Filters
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Main Doctor Grid Results */}
         {loading ? (
          /* Skeleton Loader Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between h-[360px] animate-pulse">
                <div>
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl shrink-0" />
                    <div className="flex-grow space-y-3 pt-2">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                    </div>
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="h-10 bg-slate-50 rounded-2xl" />
                    <div className="h-10 bg-slate-50 rounded-2xl" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-50">
                  <div className="h-11 bg-slate-100 rounded-xl flex-1" />
                  <div className="h-11 bg-slate-100 rounded-xl flex-[1.5]" />
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <>
            {/* Fallback Area Notification */}
            {(doctors.some(d => d.isFallback) || (selectedDistrict && doctors.length > 0 && doctors.every(d => d.district?.toLowerCase() !== selectedDistrict.toLowerCase()))) && (
              <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 max-w-3xl mx-auto">
                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                <div>
                  <p className="text-amber-800 text-xs sm:text-sm font-bold">
                    {lat && lng
                      ? `No doctors found within ${radius} km of your GPS location. Showing nearest verified doctors:`
                      : `No specialists found directly in ${selectedDistrict || 'your area'}. Showing nearest available doctors:`
                    }
                  </p>
                  {lat && lng && (
                    <p className="text-amber-600 text-[10px] font-bold mt-0.5">
                      Try expanding the radius to 20 km, 50 km or 70 km — or clear GPS to browse all doctors nationally.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Doctors Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.slice(0, visibleCount).map((doc) => (
                <DoctorCard 
                  key={doc._id}
                  id={doc._id}
                  slug={doc.slug}
                  name={doc.user.name}
                  specialization={doc.specialty}
                  experience={doc.experience}
                  rating={doc.rating || 4.5}
                  reviews={doc.numReviews || 35}
                  avatarUrl={doc.user.avatar}
                  location={`${doc.district}, ${doc.state}`}
                  availability="Available Today"
                  distance={doc.distance}
                  consultationFee={doc.consultationFee}
                  languages={doc.languages}
                  videoConsultation={doc.videoConsultation}
                  emergencyConsultation={doc.emergencyConsultation}
                  insuranceAccepted={doc.insuranceAccepted}
                  clinicName={doc.clinic_info?.[0]?.clinicName || doc.branch_info?.[0]?.clinicName || 'Healthcare Clinic'}
                  nextSlot={doc.availability?.[0]?.slots?.[0] ? `Today, ${doc.availability[0].slots[0].split(' - ')[0]}` : 'Tomorrow, 10:00 AM'}
                  isAvailableToday={doc.availability?.some(a => ['Mon','Tue','Wed','Thu','Fri'].includes(a.day) && a.slots?.length > 0)}
                />
              ))}
            </div>

            {/* Pagination Load More CTA */}
            {visibleCount < doctors.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="bg-white hover:bg-slate-900 text-slate-800 hover:text-white px-8 py-3.5 rounded-2xl font-black text-xs transition-all border border-slate-200 hover:border-slate-950 shadow-md hover:shadow-xl shadow-slate-100 flex items-center gap-2 group"
                >
                  Load More Specialists
                  <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 max-w-lg mx-auto shadow-xl shadow-slate-100/50">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Doctors Found</h3>
            <p className="text-slate-400 text-xs sm:text-sm font-bold leading-relaxed max-w-sm mx-auto mb-6">
              {apiMessage || "We couldn't find any healthcare professionals matching your filters. Try clearing some active filters or expanding your radius."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="bg-[#00B5B5] hover:bg-[#009A9A] text-white px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-md shadow-[#00B5B5]/20"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

      </Container>
    </Section>
  );
}
