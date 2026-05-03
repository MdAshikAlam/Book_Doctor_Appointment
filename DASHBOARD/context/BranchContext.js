"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { clinicsApi } from '@/lib/api';
import { useAuth } from './AuthContext';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial load from localStorage
    const savedBranchId = localStorage.getItem('selectedBranchId');
    if (savedBranchId) {
      setSelectedBranchId(savedBranchId);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBranches();
    }
  }, [user]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await clinicsApi.getAll();
      let allClinics = response.data.clinics || [];
      
      let filteredBranches = [];

      if (user?.role === 'super_admin') {
        // Super Admin sees all branches
        filteredBranches = allClinics;
      } else if (user?.role === 'admin') {
        // Admin sees their assigned branches AND clinics they created
        const assignedIds = user.branchIds || (user.branchId ? [user.branchId] : []);
        filteredBranches = allClinics.filter(b => assignedIds.includes(b._id) || b.createdByAdminId === user._id || b.owner === user._id);
      } else {
        // Others see only their assigned branch
        filteredBranches = allClinics.filter(b => b._id === user?.branchId);
      }

      setBranches(filteredBranches);
      
      // Check if current selectedBranchId is valid for this user
      const isValid = filteredBranches.some(b => b._id === selectedBranchId);
      
      if (!selectedBranchId || !isValid) {
        if (filteredBranches.length > 0) {
          // Default to first available branch
          const defaultBranchId = filteredBranches[0]._id;
          setSelectedBranchId(defaultBranchId);
          localStorage.setItem('selectedBranchId', defaultBranchId);
        } else if (user?.role !== 'super_admin') {
          // If no branches assigned and not super_admin, clear selection
          setSelectedBranchId(null);
          localStorage.removeItem('selectedBranchId');
        }
      }
    } catch (err) {
      console.error('Failed to fetch branches', err);
    } finally {
      setLoading(false);
    }
  };

  const changeBranch = (branchId) => {
    if (branchId === 'all' && user?.role === 'super_admin') {
      setSelectedBranchId(null);
      localStorage.removeItem('selectedBranchId');
    } else {
      setSelectedBranchId(branchId);
      localStorage.setItem('selectedBranchId', branchId);
    }
    // Reload the page to refresh all data with the new branchId header
    window.location.reload();
  };

  return (
    <BranchContext.Provider value={{ 
      branches, 
      selectedBranchId, 
      loading, 
      fetchBranches, 
      changeBranch,
      selectedBranch: branches.find(b => b._id === selectedBranchId),
      isGlobalMode: user?.role === 'super_admin' && !selectedBranchId
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
