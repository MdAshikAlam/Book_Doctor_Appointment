"use client"

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Info
} from 'lucide-react';
import { usersApi } from '@/lib/api';
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

export default function AdminRequestsPage() {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getAdminRequests('pending');
      setRequests(res.data.admins || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchRequests();
    }
  }, [currentUser]);

  const handleAction = async (id, status) => {
    try {
      setIsProcessing(true);
      await usersApi.updateStatus(id, status, status === 'rejected' ? rejectionReason : undefined);
      setSelectedRequest(null);
      setShowRejectModal(false);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.clinicName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Registration Requests</h1>
          <p className="text-slate-500 mt-1 font-medium">Review and approve new clinic administrator applications.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
          <UserPlus size={20} className="shrink-0" />
          <span className="font-bold text-sm">{requests.length} Pending Requests</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative group max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email or clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
          />
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 animate-pulse h-64"></div>
          ))
        ) : filteredRequests.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <p className="font-bold text-slate-500">No pending requests at the moment.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <motion.div 
              layout
              key={req._id}
              className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl border border-blue-100 overflow-hidden">
                    {req.avatar ? <img src={getFullImageUrl(req.avatar)} className="w-full h-full object-cover" /> : req.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">{req.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{req.email}</p>
                    <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-100">
                      Pending Approval
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 py-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <Building2 size={16} className="text-blue-500" />
                  <span className="truncate">{req.clinicName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <MapPin size={16} className="text-slate-300" />
                  {req.city}, {req.state}
                </div>
              </div>

              <div className="pt-6 flex gap-2">
                <Button 
                  onClick={() => setSelectedRequest(req)}
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:border-blue-200 group-hover:text-blue-600"
                >
                  <Eye size={18} /> Review
                </Button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(req._id, 'approved')}
                    className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }}
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
        isOpen={!!selectedRequest && !showRejectModal}
        onClose={() => setSelectedRequest(null)}
        title="Review Admin Application"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-8 py-2">
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-3xl font-black text-blue-600 mb-4 border border-slate-100">
                 {selectedRequest.name?.charAt(0)}
               </div>
               <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedRequest.name}</h3>
               <p className="text-slate-500 font-medium">{selectedRequest.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identity Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identity Verification</h4>
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-bold uppercase">ID Type</p>
                    <p className="text-sm font-black text-slate-900">{selectedRequest.governmentIdType}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-bold uppercase">ID Number</p>
                    <p className="text-sm font-black text-slate-900">{selectedRequest.governmentIdNumber}</p>
                  </div>
                  {selectedRequest.idProofDocument && (
                    <a 
                      href={getFullImageUrl(selectedRequest.idProofDocument)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-all font-bold"
                    >
                      <FileText size={20} /> View ID Document
                    </a>
                  )}
                </div>
              </div>

              {/* Clinic Intent */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Clinic</h4>
                <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 truncate">{selectedRequest.clinicName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Primary Location</p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                      <MapPin size={16} className="text-slate-300" />
                      {selectedRequest.city}, {selectedRequest.state}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                      <Phone size={16} className="text-slate-300" />
                      {selectedRequest.phoneNumber || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                      <Calendar size={16} className="text-slate-300" />
                      Applied: {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectModal(true)}
                className="flex-1 h-14 rounded-2xl font-bold border-red-100 text-red-500 hover:bg-red-50 transition-all"
              >
                Reject Application
              </Button>
              <Button 
                onClick={() => handleAction(selectedRequest._id, 'approved')}
                disabled={isProcessing}
                className="flex-[2] h-14 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> Approve & Grant Access</>}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Admin Application"
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
            <ShieldAlert className="text-red-500 shrink-0" size={24} />
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              You are about to reject the application for <strong>{selectedRequest?.name}</strong>. Please provide a reason for the rejection.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Reason</label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid ID proof, mismatch in clinic details..."
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-500 transition-all outline-none font-medium resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={() => handleAction(selectedRequest._id, 'rejected')}
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
