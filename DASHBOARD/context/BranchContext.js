"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { clinicsApi } from '@/lib/api';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
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

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await clinicsApi.getAll();
      const fetchedBranches = response.data.clinics;
      setBranches(fetchedBranches);
      
      // Check if current selectedBranchId is valid
      const isValid = fetchedBranches.some(b => b._id === selectedBranchId);
      
      if ((!selectedBranchId || !isValid) && fetchedBranches.length > 0) {
        changeBranch(fetchedBranches[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch branches', err);
    } finally {
      setLoading(false);
    }
  };

  const changeBranch = (branchId) => {
    setSelectedBranchId(branchId);
    localStorage.setItem('selectedBranchId', branchId);
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
      selectedBranch: branches.find(b => b._id === selectedBranchId)
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
