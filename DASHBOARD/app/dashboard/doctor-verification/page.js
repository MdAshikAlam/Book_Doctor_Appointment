"use client"

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Eye,
  FileText,
  MapPin,
  Phone,
  GraduationCap,
  Briefcase,
  Check,
  X,
  User,
  Info,
  BadgeCheck,
  Building
} from 'lucide-react';
import { doctorsApi } from '@/lib/api';
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

export default function DoctorVerificationPage() {
  const { user: currentUser } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorsApi.getPending();
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchDoctors();
    }
  }, [currentUser]);

  const handleAction = async (id, status) => {
    try {
      setIsProcessing(true);
      const targetStatus = status === 'verified' ? 'verified' : 'rejected';
      await doctorsApi.updateStatus(id, targetStatus, status === 'rejected' ? rejectionReason : undefined);
      setSelectedDoctor(null);
      setShowRejectModal(false);
      setRejectionReason('');
      fetchDoctors();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can verify doctors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Verification</h1>
          <p className="text-slate-500 mt-1 font-medium">Verify medical licenses and credentials of new practitioners.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
          <BadgeCheck size={20} className="shrink-0" />
          <span className="font-bold text-sm">{doctors.length} Pending Credentials</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative group max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, specialty or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 transition-all outline-none font-medium text-sm"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 animate-pulse h-64"></div>
          ))
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <p className="font-bold text-slate-500">No doctors awaiting verification.</p>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <motion.div 
              layout
              key={doc._id}
              className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-200/30 transition-all group overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl border border-indigo-100 overflow-hidden shadow-inner shrink-0">
                  {doc.user?.avatar ? <img src={getFullImageUrl(doc.user.avatar)} className="w-full h-full object-cover" /> : <Stethoscope size={28} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-lg text-slate-900 leading-tight truncate">Dr. {doc.user?.name}</h3>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{doc.specialty}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <FileText size={14} className="text-slate-400" />
                  <span>License: {doc.licenseNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Building size={14} className="text-slate-400" />
                  <span className="truncate">{doc.medicalCouncil}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Briefcase size={14} className="text-slate-400" />
                  <span>{doc.experience} Years Experience</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setSelectedDoctor(doc)}
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  <Eye size={18} /> Review
                </Button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(doc._id, 'verified')}
                    className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 shadow-lg shadow-indigo-200 transition-all"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => { setSelectedDoctor(doc); setShowRejectModal(true); }}
                    className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedDoctor && !showRejectModal}
        onClose={() => setSelectedDoctor(null)}
        title="Review Practitioner Credentials"
        size="lg"
      >
        {selectedDoctor && (
          <div className="space-y-8 py-2">
            <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                 <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                   Awaiting Verification
                 </div>
               </div>
               <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-3xl font-black text-indigo-600 border border-slate-100 overflow-hidden shrink-0">
                 {selectedDoctor.user?.avatar ? <img src={getFullImageUrl(selectedDoctor.user.avatar)} className="w-full h-full object-cover" /> : <Stethoscope size={40} />}
               </div>
               <div>
                 <h3 className="text-3xl font-black text-slate-900 leading-tight">Dr. {selectedDoctor.user?.name}</h3>
                 <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mt-1">{selectedDoctor.specialty}</p>
                 <div className="flex items-center gap-4 mt-3">
                   <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                     <Mail size={14} /> {selectedDoctor.user?.email}
                   </div>
                   <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                     <Phone size={14} /> {selectedDoctor.user?.phone}
                   </div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional License</h4>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                      <p className="text-xs text-slate-400 font-bold uppercase">License Number</p>
                      <p className="text-sm font-black text-slate-900">{selectedDoctor.licenseNumber}</p>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                      <p className="text-xs text-slate-400 font-bold uppercase">Medical Council</p>
                      <p className="text-sm font-black text-slate-900">{selectedDoctor.medicalCouncil}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-bold uppercase">Experience</p>
                      <p className="text-sm font-black text-slate-900">{selectedDoctor.experience} Years</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Qualifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.qualifications?.map((q, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 font-bold text-xs">
                        <GraduationCap size={16} /> {q}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Practice Details</h4>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                      <p className="text-xs text-slate-400 font-bold uppercase">Consultation Fee</p>
                      <p className="text-sm font-black text-emerald-600">₹{selectedDoctor.consultationFee}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-slate-300 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">
                        {selectedDoctor.address},<br />
                        {selectedDoctor.district}, {selectedDoctor.state}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional Bio</h4>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                      "{selectedDoctor.bio || 'No bio provided.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectModal(true)}
                className="flex-1 h-14 rounded-2xl font-bold border-red-100 text-red-500 hover:bg-red-50 transition-all"
              >
                Reject Credentials
              </Button>
              <Button 
                onClick={() => handleAction(selectedDoctor._id, 'verified')}
                disabled={isProcessing}
                className="flex-[2] h-14 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={24} /> Verify Practitioner</>}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Doctor Credentials"
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
            <ShieldAlert className="text-red-500 shrink-0" size={24} />
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              You are about to reject the credentials for <strong>Dr. {selectedDoctor?.user?.name}</strong>. This will prevent them from practicing in the system.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Reason</label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Expired medical license, invalid medical council registration..."
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-500 transition-all outline-none font-medium resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={() => handleAction(selectedDoctor._id, 'rejected')}
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
