"use client"

import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Eye,
  FileText,
  Calendar,
  Check,
  X,
  User,
  Building2,
  Stethoscope,
  ExternalLink,
  RefreshCw,
  Filter
} from 'lucide-react';
import { clinicsApi, doctorsApi } from '@/lib/api';
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

export default function KYCVerificationPage() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isResubmissionRequest, setIsResubmissionRequest] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [entityFilter, setEntityFilter] = useState('all'); // 'all', 'clinic', 'doctor'

  const fetchKYCData = async () => {
    try {
      setLoading(true);
      
      // Map API statuses
      // Clinics statuses: 'pending' (pending verification), 'approved', 'rejected', 'suspended'
      // Doctors statuses: 'submitted' (pending verification), 'verified' (approved), 'rejected'
      let clinicStatus = 'pending';
      let doctorStatus = 'submitted';
      
      if (activeTab === 'approved') {
        clinicStatus = 'approved';
        doctorStatus = 'verified';
      } else if (activeTab === 'rejected') {
        clinicStatus = 'rejected';
        doctorStatus = 'rejected';
      }

      const [clinicsRes, doctorsRes] = await Promise.all([
        clinicsApi.getPending(clinicStatus).catch(err => ({ data: { clinics: [] } })),
        doctorsApi.getPending(doctorStatus).catch(err => ({ data: { doctors: [] } }))
      ]);

      const formattedClinics = (clinicsRes.data?.clinics || []).map(clinic => ({
        ...clinic,
        id: clinic._id,
        entityType: 'clinic',
        applicantName: clinic.clinicName,
        subName: clinic.legalName,
        submittedAt: clinic.createdAt,
        status: clinic.clinicStatus,
        documents: [
          { name: 'Registration Proof', path: clinic.registrationProof, type: 'pdf/image' },
          { name: 'Address Proof', path: clinic.addressProof, type: 'pdf/image' }
        ]
      }));

      const formattedDoctors = (doctorsRes.data?.doctors || []).map(doctor => ({
        ...doctor,
        id: doctor._id,
        entityType: 'doctor',
        applicantName: doctor.user?.name || 'Dr. Unknown',
        subName: doctor.specialty,
        submittedAt: doctor.createdAt,
        status: doctor.status,
        documents: [
          { name: 'License Certificate', path: doctor.licenseDocument, type: 'pdf/image' }
        ]
      }));

      setItems([...formattedClinics, ...formattedDoctors].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
    } catch (err) {
      console.error('Failed to fetch KYC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchKYCData();
    }
  }, [currentUser, activeTab]);

  const handleAction = async (item, actionType) => {
    try {
      setIsProcessing(true);
      const isClinic = item.entityType === 'clinic';
      
      // Determine final status
      let targetStatus;
      if (actionType === 'verify') {
        targetStatus = isClinic ? 'approved' : 'verified';
      } else {
        // rejection or request resubmission
        targetStatus = 'rejected';
      }

      const reason = (actionType === 'reject' || actionType === 'resubmit') ? rejectionReason : undefined;

      if (isClinic) {
        await clinicsApi.updateStatus(item.id, targetStatus, reason);
      } else {
        await doctorsApi.updateStatus(item.id, targetStatus, reason);
      }

      setSelectedItem(null);
      setShowRejectModal(false);
      setRejectionReason('');
      fetchKYCData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.registrationNumber || item.licenseNumber)?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = entityFilter === 'all' || item.entityType === entityFilter;
    
    return matchesSearch && matchesEntity;
  });

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can verify KYC documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">KYC Verification</h1>
          <p className="text-slate-500 mt-1 font-medium">Govern and audit doctor licenses and clinic registration papers.</p>
        </div>
        <button 
          onClick={fetchKYCData}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-colors font-bold text-sm"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit shrink-0">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'approved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Verified
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'rejected' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Rejected
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full lg:max-w-xl">
          <div className="relative group flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, specialty, license number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all outline-none font-medium text-sm border"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 shrink-0">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4 cursor-pointer"
            >
              <option value="all">All Entities</option>
              <option value="clinic">Clinics Only</option>
              <option value="doctor">Doctors Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 animate-pulse h-64"></div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 text-slate-350 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <p className="font-bold text-slate-500">No KYC verification requests found.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <motion.div 
              layout
              key={item.id}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.entityType === 'clinic' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {item.entityType === 'clinic' ? <Building2 size={24} /> : <Stethoscope size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${item.entityType === 'clinic' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {item.entityType}
                      </span>
                      <span className="text-slate-400 text-xs font-medium">Submitted {new Date(item.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mt-2">{item.applicantName}</h3>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">{item.subName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Reg/License No.</span>
                  <span className="text-slate-900 font-extrabold">{item.registrationNumber || item.licenseNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-t border-slate-200/50 pt-2">
                  <span>Documents Loaded</span>
                  <span className="text-slate-900 font-extrabold">{item.documents.filter(d => d.path).length} / {item.documents.length}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setSelectedItem(item)}
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                  <Eye size={18} /> Review
                </Button>
                {activeTab === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(item, 'verify')}
                      className="px-5 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all flex items-center gap-1.5 text-sm"
                    >
                      <Check size={16} /> Verify
                    </button>
                    <button 
                      onClick={() => { setSelectedItem(item); setIsResubmissionRequest(true); setShowRejectModal(true); }}
                      className="px-4 rounded-xl bg-amber-50 text-amber-600 font-bold border border-amber-100 hover:bg-amber-500 hover:text-white transition-all text-xs"
                    >
                      Resubmit
                    </button>
                    <button 
                      onClick={() => { setSelectedItem(item); setIsResubmissionRequest(false); setShowRejectModal(true); }}
                      className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Review Details Modal */}
      <Modal
        isOpen={!!selectedItem && !showRejectModal}
        onClose={() => setSelectedItem(null)}
        title={`${selectedItem?.entityType === 'clinic' ? 'Clinic' : 'Doctor'} KYC Assessment`}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-6 py-2">
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedItem.entityType === 'clinic' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {selectedItem.entityType === 'clinic' ? <Building2 size={24} /> : <Stethoscope size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedItem.applicantName}</h3>
                <p className="text-sm font-semibold text-slate-500">{selectedItem.subName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Submitted Verification Files</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedItem.documents.map((doc, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center mb-3">
                      <FileText size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">{doc.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-4">Official Regulatory Record</p>
                    {doc.path ? (
                      <a 
                        href={getFullImageUrl(doc.path)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all"
                      >
                        <ExternalLink size={12} /> Open Document
                      </a>
                    ) : (
                      <div className="py-2 px-3 bg-rose-50 text-rose-500 rounded-xl font-bold text-[9px] uppercase w-full">Missing File</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {activeTab === 'pending' && (
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsResubmissionRequest(true); setShowRejectModal(true); }}
                  className="flex-1 h-12 rounded-xl font-bold text-amber-600 border-amber-100 hover:bg-amber-50"
                >
                  Request Resubmission
                </Button>
                <Button 
                  onClick={() => handleAction(selectedItem, 'verify')}
                  disabled={isProcessing}
                  className="flex-1 h-12 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> Verify KYC</>}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject / Resubmit Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={isResubmissionRequest ? "Request Documents Resubmission" : "Reject KYC Verification"}
        size="md"
      >
        <div className="space-y-5 py-2">
          <div className={`p-4 rounded-xl border flex gap-3 ${isResubmissionRequest ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
            <ShieldAlert shrink-0 size={24} />
            <p className="text-xs font-medium leading-relaxed">
              {isResubmissionRequest ? (
                <span>Explain what details or documents are incorrect/blurry. The user will be requested to upload these documents again.</span>
              ) : (
                <span>Confirming rejection of this verification request. This action suspends/rejects their entry. Please supply a reason.</span>
              )}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Reason for action</label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. License document has expired, or address verification file is unreadable..."
              className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 transition-all outline-none font-medium resize-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1 h-11 rounded-xl font-bold">Cancel</Button>
            <Button 
              onClick={() => handleAction(selectedItem, isResubmissionRequest ? 'resubmit' : 'reject')}
              disabled={!rejectionReason || isProcessing}
              className={`flex-1 h-11 text-white font-bold rounded-xl transition-all ${isResubmissionRequest ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-500 hover:bg-rose-600'} disabled:opacity-50`}
            >
              {isResubmissionRequest ? 'Send Request' : 'Reject KYC'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
