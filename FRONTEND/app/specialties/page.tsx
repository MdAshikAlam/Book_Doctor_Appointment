"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Stethoscope, 
  Search, 
  Loader2, 
  AlertCircle, 
  Users,
  LayoutGrid,
  Filter,
  MapPin
} from 'lucide-react';
import SpecialtyCard from '@/components/SpecialtyCard';
import DoctorCard from '@/components/DoctorCard';
import { specialties } from '@/data/mock';

import { useLocation } from '@/context/LocationContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function SpecialtiesPage() {
  const searchParams = useSearchParams();
  const { selectedDistrict, selectedState, latitude, longitude } = useLocation();
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const specialtyFromQuery = searchParams.get('specialty')?.trim();
    if (specialtyFromQuery) {
      setSelectedSpecialty(specialtyFromQuery);
    }
  }, [searchParams]);

  const fetchDoctors = useCallback(async (specialtyParam?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE_URL}/doctors`;
      const params = new URLSearchParams();
      
      const category = specialtyParam !== undefined ? specialtyParam : selectedSpecialty;
      if (category) {
        params.append('specialty', category);
      }

      if (latitude && longitude) {
        params.append('lat', latitude.toString());
        params.append('lng', longitude.toString());
        params.append('radius', '60000'); // 60km limit
      } else if (selectedDistrict) {
        params.append('district', selectedDistrict);
        if (selectedState) params.append('state', selectedState);
      }
      
      const requestUrl = `${url}${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Fetching doctors from:', requestUrl);
      
      const res = await fetch(requestUrl);
      const data = await res.json();
      
      if (data.status === 'success') {
        setDoctors(data.data.doctors);
      } else {
        throw new Error(data.message || 'Failed to fetch specialists');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSpecialty, selectedDistrict, selectedState, latitude, longitude]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors, selectedDistrict, selectedState, latitude, longitude]);

  const handleSpecialtySelect = (name: string) => {
    if (selectedSpecialty === name) {
      setSelectedSpecialty(''); // Toggle off
    } else {
      setSelectedSpecialty(name);
    }
  };

  const filteredDoctors = doctors.filter((doc: any) => 
    doc.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Page Header / Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDFD] via-[#F6FCFC] to-slate-50/50 pt-36 pb-20 border-b border-slate-100">
        {/* Subtle Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2300B5B5' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00B5B5]/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-5 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#00B5B5]/20 text-[#00B5B5] text-sm font-bold shadow-sm mb-6 animate-in fade-in duration-700">
              <Stethoscope className="w-4 h-4" />
              <span>Expert Medical Directory</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
              Find the Right <span className="text-[#00B5B5] italic">Specialist</span> for Your Health
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
              Browse through our network of certified healthcare professionals across various medical specialties.
            </p>
          </div>
        </div>
      </section>

      {/* Specialty Selector Section */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100/80">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00B5B5]/10 rounded-xl flex items-center justify-center text-[#00B5B5]">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Explore Categories</h3>
              </div>
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#00B5B5] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search specialists by name or role..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#00B5B5]/20 focus:bg-white transition-all font-medium text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SpecialtyCard 
                name="All Experts"
                icon={Users}
                count={730}
                isActive={selectedSpecialty === ''}
                onClick={() => setSelectedSpecialty('')}
              />

              {specialties.map((specialty, index) => (
                <div key={index} className="h-full">
                  <SpecialtyCard 
                    {...specialty} 
                    isActive={selectedSpecialty === specialty.name}
                    onClick={() => handleSpecialtySelect(specialty.name)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                {selectedSpecialty ? `${selectedSpecialty} Specialists` : 'All Specialists'}
              </h2>
              <p className="text-gray-500 font-medium">Found {filteredDoctors.length} matched experts</p>
            </div>
            <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-gray-500 font-bold text-lg">Assembling the directory...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-[2.5rem] p-20 text-center border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">{error}</p>
              <button 
                onClick={() => fetchDoctors()}
                className="bg-red-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <>
              {filteredDoctors.some((d: any) => d.isFallback) && (
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2.5rem] mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                  <p className="text-amber-800 font-bold">
                    No specialists currently available in {selectedDistrict || 'your selected area'}. 
                    Showing nearest available experts:
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDoctors.map((doctor: any) => (
                  <DoctorCard 
                    key={doctor._id}
                    id={doctor._id}
                    slug={doctor.slug}
                    name={doctor.user.name}
                    specialization={doctor.specialty}
                    experience={doctor.experience}
                    rating={4.8} // Default since not in schema
                    reviews={120} // Default since not in schema
                    avatarUrl={doctor.user.avatar}
                    location={`${doctor.district}, ${doctor.state}`}
                    availability="Available Today"
                    distance={doctor.distance}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-32 text-center border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Specialists Found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-8">
                We couldn't find any {selectedSpecialty ? `${selectedSpecialty}` : 'healthcare'} professionals in your selected area at the moment.
              </p>
              <button 
                onClick={() => setSelectedSpecialty('')}
                className="text-primary font-bold hover:underline"
              >
                View all categories
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
