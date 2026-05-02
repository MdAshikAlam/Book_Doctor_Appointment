"use client"

import React, { useEffect } from 'react';
import { useBranch } from '@/context/BranchContext';
import { MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const BranchSelector = () => {
  const { branches, selectedBranchId, changeBranch, fetchBranches, loading } = useBranch();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBranches();
    }
  }, [user]);

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  const selectedBranch = branches.find(b => b._id === selectedBranchId);

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-transparent hover:border-primary/20 hover:bg-white transition-all cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <MapPin size={18} />
        </div>
        <div className="text-left pr-2">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none mb-1">Branch</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold text-slate-900 leading-none">
              {loading ? 'Loading...' : (selectedBranch?.name || (user.role === 'super_admin' && !selectedBranchId ? 'All Branches' : 'Select Branch'))}
            </p>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-border py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left scale-95 group-hover:scale-100">
        <div className="px-4 py-2 border-b border-border mb-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Switch Context</p>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {user?.role === 'super_admin' && (
            <button
              onClick={() => changeBranch('all')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                !selectedBranchId 
                  ? 'bg-primary/5 text-primary font-bold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${!selectedBranchId ? 'bg-primary' : 'bg-transparent'}`}></div>
              All Branches (Global Mode)
            </button>
          )}
          
          {branches.map((branch) => (
            <button
              key={branch._id}
              onClick={() => changeBranch(branch._id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                selectedBranchId === branch._id 
                  ? 'bg-primary/5 text-primary font-bold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedBranchId === branch._id ? 'bg-primary' : 'bg-transparent'}`}></div>
              {branch.name}
              <span className="ml-auto text-[10px] font-medium text-slate-400">{branch.district}</span>
            </button>
          ))}
          {branches.length === 0 && !loading && (
            <p className="px-4 py-3 text-xs text-slate-500 italic">No branches found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchSelector;
