'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  selectedState: string;
  selectedDistrict: string;
  latitude: number | null;
  longitude: number | null;
  setSelectedState: (state: string) => void;
  setSelectedDistrict: (district: string) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    // Load from localStorage
    const state = localStorage.getItem('selectedState');
    const district = localStorage.getItem('selectedDistrict');
    const lat = localStorage.getItem('latitude');
    const lng = localStorage.getItem('longitude');
    
    if (state) setSelectedState(state);
    if (district) setSelectedDistrict(district);
    if (lat) setLatitude(parseFloat(lat));
    if (lng) setLongitude(parseFloat(lng));
  }, []);

  const handleSetState = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict(''); 
    setLatitude(null);
    setLongitude(null);
    localStorage.setItem('selectedState', state);
    localStorage.removeItem('selectedDistrict');
    localStorage.removeItem('latitude');
    localStorage.removeItem('longitude');
  };

  const handleSetDistrict = async (district: string) => {
    setSelectedDistrict(district);
    localStorage.setItem('selectedDistrict', district);
    
    // We'll leave geocoding for later or remove if not needed. 
    // The user didn't provide a way to geocode from state/district yet.
  };

  const clearLocation = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setLatitude(null);
    setLongitude(null);
    localStorage.removeItem('selectedState');
    localStorage.removeItem('selectedDistrict');
    localStorage.removeItem('latitude');
    localStorage.removeItem('longitude');
  };

  return (
    <LocationContext.Provider
      value={{
        selectedState,
        selectedDistrict,
        latitude,
        longitude,
        setSelectedState: handleSetState,
        setSelectedDistrict: handleSetDistrict,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
