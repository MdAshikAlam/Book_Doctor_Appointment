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
    // Initialize from localStorage on client-side
    const storedState = localStorage.getItem('userState');
    const storedDistrict = localStorage.getItem('userDistrict');
    
    if (storedState) setSelectedState(storedState);
    if (storedDistrict) setSelectedDistrict(storedDistrict);
  }, []);

  const handleSetState = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict(''); 
    setLatitude(null);
    setLongitude(null);
    if (state) {
      localStorage.setItem('userState', state);
      localStorage.removeItem('userDistrict');
    } else {
      localStorage.removeItem('userState');
      localStorage.removeItem('userDistrict');
    }
  };

  const handleSetDistrict = async (district: string) => {
    setSelectedDistrict(district);
    if (district) {
      localStorage.setItem('userDistrict', district);
    } else {
      localStorage.removeItem('userDistrict');
    }
  };

  const clearLocation = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setLatitude(null);
    setLongitude(null);
    localStorage.removeItem('userState');
    localStorage.removeItem('userDistrict');
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
