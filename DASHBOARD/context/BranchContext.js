"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { clinicsApi } from '@/lib/api';
import { useAuth } from './AuthContext';

const ClinicContext = createContext();

export const ClinicProvider = ({ children }) => {
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial load from localStorage
    const savedClinicId = localStorage.getItem('selectedClinicId');
    if (savedClinicId) {
      setSelectedClinicId(savedClinicId);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchClinics();
    }
  }, [user]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await clinicsApi.getAll({ isDashboard: true });
      let allClinics = response.data.clinics || [];
      
      let filteredClinics = [];

      if (user?.role === 'super_admin') {
        // Super Admin sees all clinics
        filteredClinics = allClinics;
      } else if (user?.role === 'admin') {
        // Admin sees their assigned clinics AND clinics they created
        const assignedIds = user.branchIds || (user.branchId ? [user.branchId] : []);
        filteredClinics = allClinics.filter(b => assignedIds.includes(b._id) || b.createdByAdminId === user._id || b.owner === user._id);
      } else {
        // Others see only their assigned clinic
        filteredClinics = allClinics.filter(b => b._id === user?.branchId);
      }

      setClinics(filteredClinics);
      
      // Check if current selectedClinicId is valid for this user
      const isValid = filteredClinics.some(b => b._id === selectedClinicId);
      
      if (!selectedClinicId || !isValid) {
        if (user?.role === 'super_admin') {
          // Super Admin defaults to Global Mode (null)
          setSelectedClinicId(null);
          localStorage.removeItem('selectedClinicId');
        } else if (filteredClinics.length > 0) {
          // Others default to first available clinic
          const defaultClinicId = filteredClinics[0]._id;
          setSelectedClinicId(defaultClinicId);
          localStorage.setItem('selectedClinicId', defaultClinicId);
        } else {
          // If no clinics assigned, clear selection
          setSelectedClinicId(null);
          localStorage.removeItem('selectedClinicId');
        }
      }
    } catch (err) {
      console.error('Failed to fetch clinics', err);
    } finally {
      setLoading(false);
    }
  };

  const changeClinic = (clinicId) => {
    if (clinicId === 'all' && user?.role === 'super_admin') {
      setSelectedClinicId(null);
      localStorage.removeItem('selectedClinicId');
    } else {
      setSelectedClinicId(clinicId);
      localStorage.setItem('selectedClinicId', clinicId);
    }
  };


  return (
    <ClinicContext.Provider value={{ 
      clinics, 
      selectedClinicId, 
      loading, 
      fetchClinics, 
      changeClinic,
      selectedClinic: clinics.find(b => b._id === selectedClinicId),
      isGlobalMode: user?.role === 'super_admin' && !selectedClinicId
    }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
