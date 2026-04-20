'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  selectedCountry: string;
  selectedCity: string;
  latitude: number | null;
  longitude: number | null;
  setSelectedCountry: (country: string) => void;
  setSelectedCity: (city: string) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    // Load from localStorage
    const country = localStorage.getItem('selectedCountry');
    const city = localStorage.getItem('selectedCity');
    const lat = localStorage.getItem('latitude');
    const lng = localStorage.getItem('longitude');
    
    if (country) setSelectedCountry(country);
    if (city) setSelectedCity(city);
    if (lat) setLatitude(parseFloat(lat));
    if (lng) setLongitude(parseFloat(lng));
  }, []);

  const handleSetCountry = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity(''); 
    setLatitude(null);
    setLongitude(null);
    localStorage.setItem('selectedCountry', country);
    localStorage.removeItem('selectedCity');
    localStorage.removeItem('latitude');
    localStorage.removeItem('longitude');
  };

  const handleSetCity = async (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);

    // Fetch coordinates for the new city
    if (city && selectedCountry) {
      try {
        const res = await fetch(`${API_BASE_URL}/utils/geocode?city=${encodeURIComponent(city)}&country=${encodeURIComponent(selectedCountry)}`);
        const data = await res.json();
        if (data.status === 'success') {
          const { lat, lng } = data.data;
          setLatitude(lat);
          setLongitude(lng);
          localStorage.setItem('latitude', lat.toString());
          localStorage.setItem('longitude', lng.toString());
        }
      } catch (err) {
        console.error('Failed to geocode city:', err);
      }
    }
  };

  const clearLocation = () => {
    setSelectedCountry('');
    setSelectedCity('');
    setLatitude(null);
    setLongitude(null);
    localStorage.removeItem('selectedCountry');
    localStorage.removeItem('selectedCity');
    localStorage.removeItem('latitude');
    localStorage.removeItem('longitude');
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCountry,
        selectedCity,
        latitude,
        longitude,
        setSelectedCountry: handleSetCountry,
        setSelectedCity: handleSetCity,
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
