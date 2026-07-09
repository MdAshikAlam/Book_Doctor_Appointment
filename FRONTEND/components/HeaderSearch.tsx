'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, Loader2, Navigation } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarFallback, resolveImageUrl } from '@/lib/resolveImageUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

interface ClinicSuggestion {
  _id: string;
  slug?: string;
  clinicName: string;
  clinicType: string;
  images?: string[];
}

interface DoctorSuggestion {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  specialty: string;
  clinicName?: string;
  clinic?: {
    clinicName?: string;
  };
  branch_info?: {
    clinicName?: string;
  }[];
  clinic_info?: {
    clinicName?: string;
  }[];
}

export default function HeaderSearch({ mobile = false }: { mobile?: boolean } = {}) {
  const { selectedState, selectedDistrict, pincode, setSelectedState, setSelectedDistrict, setPincode, latitude, longitude, updateLocation } = useLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
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
            setIsLocationOpen(false);
          } else {
            alert('Failed to resolve coordinates to address details.');
          }
        } catch (err) {
          console.error(err);
          alert('Failed to connect to geocoding service.');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        alert(`Location permission denied or retrieval failed: ${error.message}`);
      }
    );
  };
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ doctors: DoctorSuggestion[], clinics: ClinicSuggestion[] }>({ doctors: [], clinics: [] });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to external triggers to open the location dropdown
  useEffect(() => {
    const handleOpenHeaderLocation = () => {
      setIsLocationOpen(true);
      if (locationRef.current) {
        locationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('open-header-location', handleOpenHeaderLocation);
    return () => {
      window.removeEventListener('open-header-location', handleOpenHeaderLocation);
    };
  }, []);

  // Fetch States on mount
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
    fetchStates();
  }, []);

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

  // Fetch Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      // If no location selected, don't fetch suggestions
      if (!latitude && !longitude && !selectedDistrict) {
        setSuggestions({ doctors: [], clinics: [] });
        return;
      }
      // If query is too short, don't fetch suggestions
      if (query.length < 2) {
        setSuggestions({ doctors: [], clinics: [] });
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        // Fetch Search Suggestions (Doctors and Clinics)
        let url = `${API_BASE_URL}/search?${query.length >= 2 ? `name=${encodeURIComponent(query)}` : ''}`;
        
        // Add geographical filters if available
        if (latitude && longitude) {
          url += `&lat=${latitude}&lng=${longitude}&radius=60`; // 60km radius
        } else {
          if (pincode) url += `&pincode=${encodeURIComponent(pincode)}`;
          if (selectedDistrict) url += `&district=${encodeURIComponent(selectedDistrict)}`;
          if (selectedState) url += `&state=${encodeURIComponent(selectedState)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'success') {
          // Combine or store separately. Let's store separately in suggestions.
          // We'll update the render logic below.
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
  }, [query, latitude, longitude, selectedDistrict, selectedState, pincode]);

  return (
    <div className={mobile ? "flex flex-col gap-3 w-full" : "hidden lg:flex items-center gap-2"}>
      {/* Location Selector */}
      <div className="relative" ref={locationRef}>
        <button 
          onClick={() => setIsLocationOpen(!isLocationOpen)}
          className={`flex items-center gap-2 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-2xl px-4 py-2.5 transition-all group ${mobile ? 'w-full justify-between' : ''}`}
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <MapPin size={16} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">Your Location</p>
            <p className="text-sm font-extrabold text-gray-900 leading-none truncate max-w-[120px]">
              {pincode ? (selectedState ? `${pincode}, ${selectedState}` : pincode) : (selectedDistrict || selectedState || 'Select District')}
            </p>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`} />
        </button>

        {isLocationOpen && (
          <div 
            className={`absolute top-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[60] ${mobile ? 'left-0 right-0 w-full' : 'left-0 w-80'}`}
          >
            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetecting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary/5 hover:bg-primary/10 px-4 py-2.5 text-xs font-black text-primary transition-all disabled:opacity-50 border border-primary/10"
              >
                <Navigation size={14} className={isDetecting ? 'animate-spin' : ''} />
                {isDetecting ? 'Detecting Location...' : 'Use Current Location'}
              </button>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase">State</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">Choose State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase">District</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                    }}
                    disabled={!selectedState || isLoadingLocations}
                  >
                    <option value="">{isLoadingLocations ? 'Loading...' : 'Choose District'}</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {isLoadingLocations && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Pincode</label>
                <div className="relative">
                  <input 
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincode(val);
                      if (val.length === 6) {
                        setIsLocationOpen(false);
                      }
                    }}
                  />
                </div>
              </div>

              {!pincode && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl text-primary border border-primary/10">
                  <Navigation size={18} />
                  <p className="text-xs font-bold leading-tight">
                    Please select your location to find nearby specialists.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Search Bar */}
      <div className={`relative ${mobile ? 'w-full' : 'w-80 xl:w-96'}`} ref={searchRef}>
        <div className="flex items-center bg-gray-50 border border-transparent focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary/5 rounded-2xl px-4 py-2.5 transition-all group">
          <Search size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search doctors, specialities..."
            className="bg-transparent border-none focus:ring-0 outline-none w-full text-sm font-bold text-gray-900 placeholder:text-gray-400 px-3"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {isLoadingSuggestions && <Loader2 size={16} className="animate-spin text-primary ml-2" />}
        </div>

        <AnimatePresence>
          {showSuggestions && query.length >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
            >
              <div className="max-h-[400px] overflow-y-auto p-2">
                {!latitude && !longitude && !selectedDistrict ? (
                  <div className="p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                      <MapPin size={24} />
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-1 uppercase tracking-tight">Location Required</p>
                    <p className="text-[11px] font-bold text-gray-400 leading-relaxed px-4">
                      Please select your state and district first to find specialists in your area.
                    </p>
                  </div>
                ) : (
                  <>
                    {(suggestions.doctors.length > 0 || suggestions.clinics.length > 0) ? (
                      <>
                        {/* Fallback indicator message */}
                        {(suggestions.doctors.some((d: any) => d.isFallback) || suggestions.clinics.some((c: any) => c.isFallback)) && (
                          <div className="px-4 py-3 bg-amber-50 text-amber-800 text-xs font-bold rounded-2xl mb-3 mx-1 border border-amber-100 flex flex-col gap-1">
                            <p className="font-extrabold uppercase text-[10px] tracking-wide text-amber-600">Notice</p>
                            <p>No clinics or doctors available in {selectedDistrict || 'this district'}. Showing nearby options:</p>
                          </div>
                        )}

                        {/* Clinics Section */}
                        {suggestions.clinics.length > 0 && (
                          <div className="mb-4">
                            <div className="px-4 py-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 rounded-xl mb-2 mx-1">
                              Clinics & Medical Centers
                            </div>
                            {suggestions.clinics.map((clinic) => (
                              <button 
                                key={clinic._id}
                                onClick={() => {
                                  window.location.href = `/clinics/${clinic.slug || clinic._id}`;
                                  setShowSuggestions(false);
                                }}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group text-left"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all overflow-hidden font-bold">
                                  {clinic.images?.[0] ? (
                                    <img src={resolveImageUrl(clinic.images[0]) || ''} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Search size={20} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-extrabold text-gray-900 truncate flex items-center gap-2">
                                    <span>{clinic.clinicName}</span>
                                    {(clinic as any).isFallback && (
                                      <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Nearby</span>
                                    )}
                                  </p>
                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{clinic.clinicType}</p>
                                </div>
                                <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-extrabold text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                  VISIT
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
 
                        {/* Doctors Section */}
                        {suggestions.doctors.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 rounded-xl mb-2 mx-1">
                              Doctors & Specialists
                            </div>
                            {suggestions.doctors.map((doc) => (
                              <button 
                                key={doc._id}
                                onClick={() => {
                                  window.location.href = `/doctors/${doc._id}`;
                                  setShowSuggestions(false);
                                }}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group text-left"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all overflow-hidden font-bold">
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
                                  <p className="text-sm font-extrabold text-gray-900 truncate flex items-center gap-2">
                                    <span>Dr. {doc.user.name}</span>
                                    {(doc as any).isFallback && (
                                      <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Nearby</span>
                                    )}
                                  </p>
                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{doc.specialty}</p>
                                  {(doc.clinicName || doc.clinic?.clinicName || doc.branch_info?.[0]?.clinicName || doc.clinic_info?.[0]?.clinicName) && (
                                    <p className="text-[10px] font-bold text-primary truncate mt-0.5">
                                      {doc.clinicName || doc.clinic?.clinicName || doc.branch_info?.[0]?.clinicName || doc.clinic_info?.[0]?.clinicName}
                                    </p>
                                  )}
                                </div>
                                <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-extrabold text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                  BOOK
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : !isLoadingSuggestions && (
                      <div className="p-8 text-center">
                        <p className="text-sm font-bold text-gray-400 mb-1">No matches found for &ldquo;{query}&rdquo;</p>
                        <p className="text-[11px] font-medium text-gray-300">
                          Try searching with a broader name or check in another location.
                        </p>
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
  );
}
