"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, MapPin, Loader2, Search, ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import SpecialtyCard from '@/components/SpecialtyCard';
import DoctorCard from '@/components/DoctorCard';
import HowItWorks from '@/components/HowItWorks';
import Testimonial from '@/components/Testimonial';
import CTA from '@/components/CTA';
import { specialties, testimonials } from '@/data/mock';

import { useLocation } from '@/context/LocationContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function Home() {
  const { selectedDistrict, selectedState, latitude, longitude } = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default for browser locate

  const fetchDoctors = useCallback(async (lat?: number, lng?: number, searchName?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE_URL}/doctors`;
      const params = new URLSearchParams();
      
      if (searchName) {
        params.append('name', searchName);
      }

      if (lat && lng) {
        // From browser geolocation
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
        params.append('radius', searchRadius.toString());
      } else if (latitude && longitude) {
        // From selected city in navbar (fixed 60km limit)
        params.append('lat', latitude.toString());
        params.append('lng', longitude.toString());
        params.append('radius', '60000'); 
      } else if (selectedDistrict) {
        params.append('district', selectedDistrict);
        if (selectedState) params.append('state', selectedState);
      }
      
      const res = await fetch(`${url}${params.toString() ? '?' + params.toString() : ''}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        setDoctors(data.data.doctors);
      } else {
        throw new Error(data.message || 'Failed to fetch doctors');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchRadius, selectedDistrict, selectedState, latitude, longitude]);

  const handleSearch = (query: string, location: string) => {
    // If location is provided in search bar, we could geocode it or just pass as name/district
    // For now, let's just use query for name/specialty/clinic
    fetchDoctors(undefined, undefined, query);
  };

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors, selectedDistrict, selectedState, latitude, longitude]);

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchDoctors(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Could not get your location. Please check permissions.');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero onSearch={handleSearch} />

      {/* Specialties Overview */}
      <section className="py-28 bg-gradient-to-b from-white via-slate-50/30 to-white relative overflow-hidden">
        {/* Soft Radial Background Accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#00B5B5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00B5B5]/10 border border-[#00B5B5]/20 text-[#00B5B5] text-[10px] font-black uppercase tracking-widest mb-4">
                Clinical Expertise
              </div>
              <h3 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
                Specialists trained in <br />
                <span className="bg-gradient-to-r from-[#00B5B5] to-[#008F8F] bg-clip-text text-transparent">modern medicine</span>
              </h3>
            </div>
            
            <button className="bg-white hover:bg-slate-900 text-slate-900 hover:text-white px-8 h-14 rounded-2xl font-black transition-all duration-300 border border-slate-100 hover:border-slate-900 shadow-md hover:shadow-xl shadow-slate-200/50 flex items-center gap-3 shrink-0 group">
              View All Specialties
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => (
              <SpecialtyCard key={index} {...specialty} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Doctors */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-black text-[#00B5B5] uppercase tracking-[0.2em] mb-4">Top Rated</h2>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1]">
                {isLocating ? 'Finding Nearby...' : <>Meet our highly <br /><span className="text-[#00B5B5]">experienced</span> doctors</>}
              </h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                <select 
                  className="bg-transparent px-4 py-2 text-sm font-bold outline-none"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                >
                  <option value={1000}>1 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={50000}>50 km</option>
                </select>
                <button 
                  onClick={handleFindNearby}
                  disabled={isLocating}
                  className="bg-[#00B5B5] text-white px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 hover:bg-[#009A9A] disabled:opacity-70 shadow-lg shadow-[#00B5B5]/20"
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  Find Nearby
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Searching for best results...</p>
            </div>
          ) : doctors.length > 0 ? (
            <>
              {doctors.some((d: any) => d.isFallback) && (
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                  <p className="text-amber-800 font-bold">
                    No doctors currently available in {selectedDistrict || 'your selected area'}. 
                    Showing nearest available specialists:
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {doctors.map((doctor: any) => (
                  <DoctorCard 
                    key={doctor._id}
                    id={doctor._id}
                    slug={doctor.slug}
                    name={doctor.user.name}
                    specialization={doctor.specialty}
                    experience={doctor.experience}
                    rating={4.8} // Mocked as not in schema
                    reviews={120} // Mocked as not in schema
                    avatarUrl={doctor.user.avatar}
                    location={`${doctor.district}, ${doctor.state}`}
                    availability="Available Today"
                    distance={doctor.distance}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Doctors Found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                We couldn't find any healthcare professionals in this area. Try increasing your search radius or searching by specialty.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-healthcare-blue/30 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-black text-[#00B5B5] uppercase tracking-[0.2em] mb-4">Patient Stories</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Real results from real patients</h3>
            <p className="text-slate-500 text-lg font-medium">Hear what our patients have to say about their exceptional care experience with HouseMed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <CTA />
    </div>
  );
}
