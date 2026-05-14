"use client"

import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  Users,
  Building2,
  Calendar,
  History
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';

export default function TrashBinPage() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeAdminId, setActiveAdminId] = useState(null);

  const fetchTrashBin = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getTrashBin();
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchTrashBin();
    }
  }, [currentUser]);

  const handleRestore = async () => {
    if (!activeAdminId) return;
    try {
      setIsProcessing(true);
      await usersApi.restoreFromTrash(activeAdminId);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      fetchTrashBin();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
      setActiveAdminId(null);
    }
  };

  const openConfirmModal = (adminId) => {
    setActiveAdminId(adminId);
    setShowConfirmModal(true);
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2">Only Super Admins can access the Trash Bin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Trash2 className="text-red-500" size={32} /> Trash Bin
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Deleted administrators and records are kept here for 60 days before permanent removal.</p>
      </div>

      {/* Warning Info */}
      <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-amber-900 font-bold text-lg">Auto-Deletion Policy</h3>
          <p className="text-amber-700 font-medium">
            Every item in this vault is set to be permanently erased 60 days after its deletion date. 
            Restoring an administrator will automatically recover all associated clinics and staff members.
          </p>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white p-20 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
             <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
             <p className="font-bold text-slate-400">Searching the vault...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
             <RefreshCw size={40} className="text-slate-300 mx-auto mb-4" />
             <p className="font-bold text-slate-400 text-xl">The trash bin is empty.</p>
             <p className="text-slate-300 font-medium mt-2">Any future deletions will appear here for 60 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {Array.from(new Set(items.map(i => i.adminId))).map(adminId => {
                const adminItem = items.find(i => i.originalId === adminId && i.collectionName === 'users');
                if (!adminItem) return null;
                
                const relatedClinics = items.filter(i => i.adminId === adminId && i.collectionName === 'clinics');
                const relatedStaff = items.filter(i => i.adminId === adminId && i.collectionName === 'users' && i.originalId !== adminId);
                const relatedDoctors = items.filter(i => i.adminId === adminId && i.collectionName === 'doctors');

                return (
                  <div key={adminId} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center font-black text-3xl text-slate-600 border border-slate-100 shadow-inner">
                          {adminItem.data.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-slate-900">{adminItem.data.name}</h3>
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">ADMIN</span>
                          </div>
                          <p className="text-slate-500 font-bold mt-1">{adminItem.data.email}</p>
                          <div className="flex items-center gap-4 mt-3">
                             <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                               <Calendar size={14} /> Deleted on {new Date(adminItem.deletedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                             </p>
                             <p className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                               <History size={14} /> Purge in {Math.max(0, 60 - Math.floor((new Date().getTime() - new Date(adminItem.deletedAt).getTime()) / (1000 * 60 * 60 * 24)))} days
                             </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button 
                          onClick={() => openConfirmModal(adminId)}
                          disabled={isProcessing}
                          className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                        >
                          {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <RotateCcw size={20} />}
                          Restore Administrator & Data
                        </Button>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinics</p>
                        <p className="text-xl font-black text-slate-900">{relatedClinics.length}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Staff Members</p>
                        <p className="text-xl font-black text-slate-900">{relatedStaff.length}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor Profiles</p>
                        <p className="text-xl font-black text-slate-900">{relatedDoctors.length}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Objects</p>
                        <p className="text-xl font-black text-blue-600">{relatedClinics.length + relatedStaff.length + relatedDoctors.length + 1}</p>
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
              <RotateCcw size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center">Confirm Restoration</h3>
            <p className="text-slate-500 mt-2 text-center font-medium">
              Are you sure you want to restore all data for this administrator? This will recover all linked clinics and staff members.
            </p>
            <div className="flex gap-4 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 h-14 rounded-2xl font-bold border-slate-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRestore}
                disabled={isProcessing}
                className="flex-[2] h-14 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100"
              >
                {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Yes, Restore All'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <RefreshCw size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Restoration Complete</h3>
            <p className="text-slate-500 mt-2 font-medium">
              The administrator and all associated data have been successfully recovered from the vault.
            </p>
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-8 h-14 bg-slate-900 text-white font-bold rounded-2xl"
            >
              Great, Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
