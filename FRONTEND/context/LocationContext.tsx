'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  selectedState: string;
  selectedDistrict: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  setSelectedState: (state: string) => void;
  setSelectedDistrict: (district: string) => void;
  setPincode: (pincode: string) => void;
  setCoordinates: (lat: number | null, lng: number | null) => void;
  updateLocation: (state: string, district: string, pincode: string, lat: number | null, lng: number | null) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    // Initialize from localStorage on client-side
    const storedState = localStorage.getItem('userState');
    const storedDistrict = localStorage.getItem('userDistrict');
    const storedPincode = localStorage.getItem('userPincode');
    const storedLat = localStorage.getItem('userLat');
    const storedLng = localStorage.getItem('userLng');
    
    console.log('[LocationContext] Init from localStorage:', { storedState, storedDistrict, storedPincode, storedLat, storedLng });

    if (storedState) setSelectedState(storedState);
    if (storedDistrict) setSelectedDistrict(storedDistrict);
    if (storedPincode) setPincode(storedPincode);
    if (storedLat) setLatitude(parseFloat(storedLat));
    if (storedLng) setLongitude(parseFloat(storedLng));
  }, []);

  const handleSetState = (state: string) => {
    console.log('[LocationContext] handleSetState called with:', state);
    setSelectedState(state);
    setSelectedDistrict(''); 
    setPincode('');
    setLatitude(null);
    setLongitude(null);
    localStorage.removeItem('userLat');
    localStorage.removeItem('userLng');
    localStorage.removeItem('userPincode');
    if (state) {
      localStorage.setItem('userState', state);
      localStorage.removeItem('userDistrict');
    } else {
      localStorage.removeItem('userState');
      localStorage.removeItem('userDistrict');
    }
  };

  const handleSetDistrict = async (district: string) => {
    console.log('[LocationContext] handleSetDistrict called with:', district);
    setSelectedDistrict(district);
    if (district) {
      localStorage.setItem('userDistrict', district);
    } else {
      localStorage.removeItem('userDistrict');
    }
  };

  const handleSetPincode = (pin: string) => {
    console.log('[LocationContext] handleSetPincode called with:', pin);
    setPincode(pin);
    if (pin) {
      localStorage.setItem('userPincode', pin);
    } else {
      localStorage.removeItem('userPincode');
    }
  };

  const setCoordinates = (lat: number | null, lng: number | null) => {
    console.log('[LocationContext] setCoordinates called with:', { lat, lng });
    setLatitude(lat);
    setLongitude(lng);
    if (lat !== null && lng !== null) {
      localStorage.setItem('userLat', lat.toString());
      localStorage.setItem('userLng', lng.toString());
    } else {
      localStorage.removeItem('userLat');
      localStorage.removeItem('userLng');
    }
  };

  const updateLocation = (state: string, district: string, pin: string, lat: number | null, lng: number | null) => {
    console.log('[LocationContext] updateLocation called with:', { state, district, pin, lat, lng });
    setSelectedState(state);
    setSelectedDistrict(district);
    setPincode(pin);
    setLatitude(lat);
    setLongitude(lng);
    if (state) localStorage.setItem('userState', state);
    if (district) localStorage.setItem('userDistrict', district);
    if (pin) localStorage.setItem('userPincode', pin);
    if (lat !== null && lng !== null) {
      localStorage.setItem('userLat', lat.toString());
      localStorage.setItem('userLng', lng.toString());
    }
  };

  const clearLocation = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setPincode('');
    setLatitude(null);
    setLongitude(null);
    localStorage.removeItem('userState');
    localStorage.removeItem('userDistrict');
    localStorage.removeItem('userPincode');
    localStorage.removeItem('userLat');
    localStorage.removeItem('userLng');
  };

  return (
    <LocationContext.Provider
      value={{
        selectedState,
        selectedDistrict,
        pincode,
        latitude,
        longitude,
        setSelectedState: handleSetState,
        setSelectedDistrict: handleSetDistrict,
        setPincode: handleSetPincode,
        setCoordinates,
        updateLocation,
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
