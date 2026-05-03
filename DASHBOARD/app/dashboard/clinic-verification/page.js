"use client"

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Eye,
  FileText,
  MapPin,
  Phone,
  Calendar,
  Check,
  X,
  User,
  Info,
  Mail,
  ExternalLink,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import { clinicsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function ClinicVerificationPage() {
  const { user: currentUser } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const res = await clinicsApi.getPending();
      setClinics(res.data.clinics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchClinics();
    }
  }, [currentUser]);

  const handleAction = async (id, status) => {
    try {
      setIsProcessing(true);
      await clinicsApi.updateStatus(id, status, status === 'rejected' ? rejectionReason : undefined);
      setSelectedClinic(null);
      setShowRejectModal(false);
      setRejectionReason('');
      fetchClinics();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredClinics = clinics.filter(c => 
    c.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can verify clinics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinic Verification</h1>
          <p className="text-slate-500 mt-1 font-medium">Approve new clinic branches for system operations.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
          <Building2 size={20} className="shrink-0" />
          <span className="font-bold text-sm">{clinics.length} Pending Verifications</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative group max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by clinic name, legal name or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-600 transition-all outline-none font-medium text-sm"
          />
        </div>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 animate-pulse h-64"></div>
          ))
        ) : filteredClinics.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <p className="font-bold text-slate-500">No clinics awaiting verification.</p>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <motion.div 
              layout
              key={clinic._id}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-200/20 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-2xl border border-emerald-100 overflow-hidden shadow-inner">
                    {clinic.images?.[0] ? <img src={getFullImageUrl(clinic.images[0])} className="w-full h-full object-cover" /> : <Building2 size={32} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-slate-900 leading-tight mb-1">{clinic.clinicName}</h3>
                    <p className="text-xs font-bold text-slate-400 mb-2">{clinic.legalName}</p>
                    <div className="flex flex-wrap items-center gap-2 text-slate-400 font-bold text-sm">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider">{clinic.clinicType}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="flex items-center gap-1"><Award size={14} className="text-emerald-500" /> {clinic.registrationNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
                    <MapPin size={12} /> Location
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate">{clinic.city}, {clinic.state}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
                    <User size={12} /> Owner
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate">{clinic.ownerName}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setSelectedClinic(clinic)}
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  <Eye size={20} /> Review Documents
                </Button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(clinic._id, 'approved')}
                    className="px-6 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                  >
                    <Check size={20} /> Verify
                  </button>
                  <button 
                    onClick={() => { setSelectedClinic(clinic); setShowRejectModal(true); }}
                    className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedClinic && !showRejectModal}
        onClose={() => setSelectedClinic(null)}
        title="Review Clinic Registration"
        size="xl"
      >
        {selectedClinic && (
          <div className="space-y-8 py-2">
            {/* Top Info Banner */}
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
               <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-3xl font-black text-emerald-600 border border-slate-100 overflow-hidden shrink-0">
                 {selectedClinic.images?.[0] ? <img src={getFullImageUrl(selectedClinic.images[0])} className="w-full h-full object-cover" /> : <Building2 size={40} />}
               </div>
               <div className="text-center md:text-left flex-1">
                 <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedClinic.clinicName}</h3>
                 <p className="text-emerald-600 font-bold text-sm mb-2">{selectedClinic.legalName}</p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                       <MapPin size={16} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-600">{selectedClinic.city}, {selectedClinic.state}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                       <Award size={16} className="text-emerald-500" />
                       <span className="text-xs font-bold text-slate-600">{selectedClinic.registrationNumber}</span>
                    </div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Docs & Identity */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Verification Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Registration Proof */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                          <FileText size={24} />
                       </div>
                       <p className="text-sm font-black text-slate-900 mb-1">Registration Proof</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">GST / License / Certificate</p>
                       {selectedClinic.registrationProof ? (
                         <a 
                           href={getFullImageUrl(selectedClinic.registrationProof)} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                         >
                           <ExternalLink size={14} /> Open Document
                         </a>
                       ) : (
                         <div className="py-3 px-4 bg-red-50 text-red-500 rounded-xl font-bold text-[10px] uppercase w-full">Missing Document</div>
                       )}
                    </div>

                    {/* Address Proof */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                          <ImageIcon size={24} />
                       </div>
                       <p className="text-sm font-black text-slate-900 mb-1">Address Proof</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Utility Bill / Lease Agreement</p>
                       {selectedClinic.addressProof ? (
                         <a 
                           href={getFullImageUrl(selectedClinic.addressProof)} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                         >
                           <ExternalLink size={14} /> Open Document
                         </a>
                       ) : (
                         <div className="py-3 px-4 bg-slate-50 text-slate-400 rounded-xl font-bold text-[10px] uppercase w-full italic">Not Provided</div>
                       )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Clinical Address</h4>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                         <MapPin size={20} />
                      </div>
                      <div className="text-sm font-bold text-slate-700 leading-relaxed">
                        <p className="text-slate-900">{selectedClinic.address}</p>
                        {selectedClinic.addressLine2 && <p className="text-slate-500 text-xs">{selectedClinic.addressLine2}</p>}
                        <p className="mt-1">{selectedClinic.city}, {selectedClinic.state} - {selectedClinic.pincode}</p>
                        <p className="text-xs text-slate-400 mt-2 font-black uppercase tracking-widest">{selectedClinic.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Owner & Contact */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Owner Details</h4>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Owner Name</p>
                        <p className="text-sm font-black text-slate-900">{selectedClinic.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Owner Phone</p>
                        <p className="text-sm font-black text-slate-900">{selectedClinic.ownerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Mail size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Owner Email</p>
                        <p className="text-sm font-black text-slate-900 truncate">{selectedClinic.ownerEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Info</h4>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-400">Clinic Email</span>
                       <span className="text-xs font-black text-slate-900">{selectedClinic.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-400">Public Phone</span>
                       <span className="text-xs font-black text-slate-900">{selectedClinic.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-400">Working Hours</span>
                       <span className="text-xs font-black text-slate-900">{selectedClinic.openingTime} - {selectedClinic.closingTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Services</h4>
                   <div className="flex flex-wrap gap-2">
                     {selectedClinic.services?.map((s, i) => (
                       <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">{s}</span>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 py-4">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectModal(true)}
                className="flex-1 h-14 rounded-2xl font-bold border-red-100 text-red-500 hover:bg-red-50 transition-all"
              >
                Reject Application
              </Button>
              <Button 
                onClick={() => handleAction(selectedClinic._id, 'approved')}
                disabled={isProcessing}
                className="flex-[2] h-14 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} /> Verify & Approve Clinic</>}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Clinic Application"
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
            <ShieldAlert className="text-red-500 shrink-0" size={24} />
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              You are about to reject the application for <strong>{selectedClinic?.clinicName}</strong>. Please provide a reason for the rejection.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Reason</label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid license certificate, incomplete address information..."
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-500 transition-all outline-none font-medium resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={() => handleAction(selectedClinic._id, 'rejected')}
              disabled={!rejectionReason || isProcessing}
              className="flex-1 h-12 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 disabled:opacity-50"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
