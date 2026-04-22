'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, Loader2, X, Navigation } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarFallback, resolveImageUrl } from '@/lib/resolveImageUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function HeaderSearch() {
  const { selectedCountry, selectedCity, setSelectedCountry, setSelectedCity, latitude, longitude } = useLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingLocations(true);
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
        const data = await res.json();
        if (!data.error) {
          setCountries(data.data.map((c: any) => c.name).sort());
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    if (isLocationOpen && countries.length === 0) {
      fetchCountries();
    }
  }, [isLocationOpen, countries.length]);

  // Fetch Cities when Country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry) {
        setCities([]);
        return;
      }
      try {
        setIsLoadingLocations(true);
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: selectedCountry }),
        });
        const data = await res.json();
        if (!data.error) {
          setCities(data.data.sort());
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    if (selectedCountry) {
      fetchCities();
    }
  }, [selectedCountry]);

  // Fetch Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        setIsLoadingSuggestions(true);
        let url = `${API_BASE_URL}/doctors?name=${encodeURIComponent(query)}`;
        
        // Add geographical filters if available
        if (latitude && longitude) {
          url += `&lat=${latitude}&lng=${longitude}&radius=60000`; // 60km radius
        } else if (selectedCity) {
          url += `&city=${encodeURIComponent(selectedCity)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'success') {
          setSuggestions(data.data.doctors.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, latitude, longitude, selectedCity]);

  return (
    <div className="hidden lg:flex items-center gap-2">
      {/* Location Selector */}
      <div className="relative" ref={locationRef}>
        <button 
          onClick={() => setIsLocationOpen(!isLocationOpen)}
          className="flex items-center gap-2 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-2xl px-4 py-2.5 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <MapPin size={16} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">Your Location</p>
            <p className="text-sm font-extrabold text-gray-900 leading-none truncate max-w-[120px]">
              {selectedCity || 'Select City'}
            </p>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isLocationOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
            >
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Country</label>
                  <select 
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="">Choose Country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">City</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setIsLocationOpen(false);
                      }}
                      disabled={!selectedCountry || isLoadingLocations}
                    >
                      <option value="">{isLoadingLocations ? 'Loading...' : 'Choose City'}</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {isLoadingLocations && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                {!selectedCity && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl text-primary border border-primary/10">
                    <Navigation size={18} />
                    <p className="text-xs font-bold leading-tight">
                      Please select your location to find nearby specialists.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Search Bar */}
      <div className="relative w-80 xl:w-96" ref={searchRef}>
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
                {suggestions.length > 0 ? (
                  suggestions.map((doc) => (
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
                        <p className="text-sm font-extrabold text-gray-900 truncate">Dr. {doc.user.name}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{doc.specialty}</p>
                      </div>
                      <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-extrabold text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        VIEW
                      </div>
                    </button>
                  ))
                ) : !isLoadingSuggestions && (
                  <div className="p-8 text-center">
                    <p className="text-sm font-bold text-gray-400">No matches found for "{query}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
