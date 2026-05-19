"use client"

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Users, 
  ChevronRight, 
  Loader2, 
  Home,
  Plus,
  ArrowRight,
  Stethoscope,
  X,
  Upload,
  Clock,
  Globe,
  Mail,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Lock,
  Trash2,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { clinicsApi, doctorsApi, usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

const CLINIC_TYPES = ['Private Clinic', 'Diagnostic Center'];
const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SERVICES = ['OPD', 'Emergency', 'Lab Test', 'Pharmacy'];
const FACILITIES = ['ICU', 'Ambulance', 'Parking', 'Wheelchair Access'];

export default function ClinicsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState(null);
  
  // Registration Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Password Reset State
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingClinic, setResettingClinic] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);



  // Slot Modal State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);
  const [slotFormData, setSlotFormData] = useState({
    doctorId: '',
    days: [],
    startTime: '',
    endTime: '',
    duration: 20,
    breakStart: '',
    breakEnd: ''
  });
  const [slotFormError, setSlotFormError] = useState(null);
  const [slotSuccessMsg, setSlotSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    clinicName: '',
    legalName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    clinicType: 'Private Clinic',
    description: '',
    images: [],
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    alternatePhone: '',
    email: '',
    openingTime: '09:00',
    closingTime: '21:00',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    emergencyAvailable: false,
    receptionAssistantMode: false,
    doctors: [],
    services: [],
    facilities: [],
    registrationFee: '',
    registrationNumber: '',
    registrationProof: '',
    addressProof: ''
  });

  const handleApprove = async (id) => {
    try {
      await clinicsApi.updateStatus(id, 'approved');
      setSuccessMsg('Clinic approved successfully!');
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to approve clinic: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason === null) return; // Cancelled

    try {
      await clinicsApi.updateStatus(id, 'rejected', reason);
      setSuccessMsg('Clinic rejected successfully');
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to reject clinic: ' + err.message);
    }
  };

  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    try {
      setIsDeleting(true);
      await clinicsApi.delete(clinicToDelete._id);
      setSuccessMsg('Clinic moved to trash bin successfully!');
      fetchData();
      setIsDeleteModalOpen(false);
      setClinicToDelete(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to delete clinic: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetOwnerPassword = async () => {
    if (!resettingClinic || !newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    try {
      setIsResetting(true);
      // Resetting the clinic's owner password
      await usersApi.resetPassword(resettingClinic.owner?._id || resettingClinic.owner, newPassword);
      setSuccessMsg(`Password for ${resettingClinic.clinicName}'s owner has been reset!`);
      setShowResetPasswordModal(false);
      setNewPassword('');
      setResettingClinic(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to reset password: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await clinicsApi.updateStatus(id, status);
      setSuccessMsg(`Clinic ${status === 'suspended' ? 'paused' : 'reactivated'} successfully!`);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update status: ' + err.message);
    }
  };



  const handleEdit = (clinic) => {
    setEditingClinicId(clinic._id);
    setFieldErrors({});
    setFormData({
      clinicName: clinic.clinicName || '',
      legalName: clinic.legalName || '',
      ownerName: clinic.ownerName || '',
      ownerPhone: clinic.ownerPhone || '',
      ownerEmail: clinic.ownerEmail || '',
      clinicType: clinic.clinicType || 'Private Clinic',
      description: clinic.description || '',
      images: clinic.images || [],
      address: clinic.address || '',
      addressLine2: clinic.addressLine2 || '',
      city: clinic.city || '',
      state: clinic.state || '',
      pincode: clinic.pincode || '',
      country: clinic.country || 'India',
      phone: clinic.phone || '',
      alternatePhone: clinic.alternatePhone || '',
      email: clinic.email || '',
      openingTime: clinic.openingTime || '09:00',
      closingTime: clinic.closingTime || '21:00',
      workingDays: clinic.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      emergencyAvailable: clinic.emergencyAvailable || false,
      receptionAssistantMode: clinic.receptionAssistantMode || false,
      doctors: clinic.doctors?.map(d => typeof d === 'object' ? d._id : d) || [],
      services: clinic.services || [],
      facilities: clinic.facilities || [],
      registrationFee: clinic.registrationFee || '',
      registrationNumber: clinic.registrationNumber || '',
      registrationProof: clinic.registrationProof || '',
      addressProof: clinic.addressProof || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingClinicId(null);
    setFieldErrors({});
    setFormData({
      clinicName: user?.clinicName || '',
      legalName: user?.clinicName || '',
      ownerName: user?.name || '',
      ownerPhone: user?.phone || '',
      ownerEmail: user?.email || '',
      clinicType: 'Private Clinic',
      description: '',
      images: [],
      address: '',
      addressLine2: '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: '',
      country: 'India',
      phone: user?.phone || '',
      alternatePhone: '',
      email: user?.email || '',
      openingTime: '09:00',
      closingTime: '21:00',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      emergencyAvailable: false,
      receptionAssistantMode: false,
      doctors: [],
      services: [],
      facilities: [],
      registrationFee: '',
      registrationNumber: '',
      registrationProof: '',
      addressProof: ''
    });
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let params = {
        status: statusFilter,
        isDashboard: true
      };
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        params = {
          ...params,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius: 100000 // 100km radius
        };
      } catch (geoErr) {
        console.warn('Geolocation access denied or timed out:', geoErr.message);
      }

      const [clinicsRes, doctorsRes] = await Promise.all([
        clinicsApi.getAll(params),
        doctorsApi.getAll()
      ]);
      setClinics(clinicsRes.data.clinics || []);
      setDoctors(doctorsRes.data.doctors || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter(c => 
    c.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDoctorsInClinic = (clinicId) => {
    return doctors.filter(d => d.clinic?._id === clinicId || (Array.isArray(d.clinics) && d.clinics.includes(clinicId)));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setFormError(null);
      const uploadData = new FormData();
      uploadData.append('image', file);
      
      const res = await doctorsApi.upload(uploadData);
      
      if (field === 'images') {
        setFormData(prev => ({ ...prev, images: [res.data.url] }));
      } else {
        setFormData(prev => ({ ...prev, [field]: res.data.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setFormError('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    if (!slotFormData.doctorId || slotFormData.days.length === 0 || !slotFormData.startTime || !slotFormData.endTime) {
      setSlotFormError('Please fill in all required fields.');
      return;
    }
    
    setIsGeneratingSlots(true);
    setSlotFormError(null);
    try {
      await doctorsApi.generateAvailability(slotFormData.doctorId, {
        days: slotFormData.days,
        startTime: slotFormData.startTime,
        endTime: slotFormData.endTime,
        duration: Number(slotFormData.duration),
        breakStart: slotFormData.breakStart || undefined,
        breakEnd: slotFormData.breakEnd || undefined,
      });
      setSlotSuccessMsg('Time slots successfully generated and saved!');
      setTimeout(() => {
        setIsSlotModalOpen(false);
        setSlotSuccessMsg(null);
        fetchData();
      }, 2000);
    } catch (err) {
      setSlotFormError(err.message || 'Failed to generate slots');
    } finally {
      setIsGeneratingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = {
        ...formData,
        registrationFee: formData.registrationFee ? Number(formData.registrationFee) : undefined,
      };
      
      if (editingClinicId) {
        await clinicsApi.update(editingClinicId, payload);
        setSuccessMsg('Clinic updated successfully!');
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
          setEditingClinicId(null);
          fetchData();
        }, 2000);
      } else {
        await clinicsApi.create(payload);
        setSuccessMsg('Clinic registered successfully! Redirecting to add doctors...');
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
          router.push('/dashboard/doctors');
        }, 2000);
      }
    } catch (err) {
      let parsedErrors = null;
      try {
        parsedErrors = JSON.parse(err.message);
      } catch (e) {
        // Not a JSON error
      }

      if (Array.isArray(parsedErrors)) {
        const errorsMap = {};
        const errorMessages = [];
        parsedErrors.forEach(errorItem => {
          if (errorItem.path && Array.isArray(errorItem.path) && errorItem.path.length > 0) {
            const fieldPath = errorItem.path.join('.');
            errorsMap[fieldPath] = errorItem.message;

            const fieldName = errorItem.path[errorItem.path.length - 1];
            const humanFieldName = fieldName
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
            errorMessages.push(`${humanFieldName}: ${errorItem.message}`);
          } else {
            errorMessages.push(errorItem.message);
          }
        });
        setFieldErrors(errorsMap);
        setFormError(errorMessages);

        // Scroll and focus the first invalid field
        const firstErrorField = parsedErrors[0]?.path?.[0];
        if (firstErrorField) {
          setTimeout(() => {
            const element = document.getElementsByName(firstErrorField)[0];
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }, 150);
        }
      } else {
        setFormError(err.message || 'Failed to process request');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved': return { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle };
      case 'pending': return { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock };
      case 'rejected': return { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle };
      case 'suspended': return { color: 'bg-slate-50 text-slate-600 border-slate-100', icon: AlertTriangle };
      default: return { color: 'bg-slate-50 text-slate-400', icon: Clock };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Home className="text-blue-600" size={32} /> Clinic Directory
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-lg">Search for partner clinics and view their registered medical teams.</p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 flex items-center gap-2"
          >
            <Plus size={20} /> Register Clinic
          </Button>
        )}
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search clinics by name, city or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm"
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto custom-scrollbar">
           {['all', 'approved', 'pending', 'rejected'].map((tab) => (
             <button
               key={tab}
               onClick={() => setStatusFilter(tab)}
               className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                 statusFilter === tab 
                   ? 'bg-white text-blue-600 shadow-sm' 
                   : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-slate-400 mt-4 font-bold text-lg">Fetching medical facilities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredClinics.length > 0 ? filteredClinics.map((clinic) => {
            const clinicDoctors = getDoctorsInClinic(clinic._id);
            const statusCfg = getStatusConfig(clinic.clinicStatus);
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={clinic._id}
                className="group bg-white rounded-[2.5rem] border-2 transition-all overflow-hidden border-slate-100 hover:border-blue-200 shadow-xl shadow-slate-100"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 overflow-hidden bg-slate-900">
                        {clinic.images?.[0] ? (
                          <img src={getFullImageUrl(clinic.images[0])} alt={clinic.clinicName} className="w-full h-full object-cover" />
                        ) : (
                          <Home size={32} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-slate-900 leading-tight">{clinic.clinicName}</h3>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${statusCfg.color}`}>
                            <StatusIcon size={12} />
                            {clinic.clinicStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
                          <MapPin size={14} /> {clinic.city}, {clinic.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(user?.role === 'admin' || user?.role === 'super_admin' || clinic.owner === user?._id) && (
                        <>
                          <button 
                            onClick={() => handleEdit(clinic)}
                            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
                            title="Edit Clinic"
                          >
                            <Pencil size={20} />
                          </button>
                          {user?.role === 'super_admin' && (
                            <>
                              {clinic.clinicStatus === 'suspended' ? (
                                <button 
                                  onClick={() => handleUpdateStatus(clinic._id, 'approved')}
                                  className="w-12 h-12 rounded-2xl bg-slate-50 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
                                  title="Resume Clinic"
                                >
                                  <PlayCircle size={20} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateStatus(clinic._id, 'suspended')}
                                  className="w-12 h-12 rounded-2xl bg-slate-50 text-amber-400 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center transition-all shadow-sm"
                                  title="Pause Clinic"
                                >
                                  <PauseCircle size={20} />
                                </button>
                              )}
                            </>
                          )}

                          <button 
                            onClick={() => {
                              setResettingClinic(clinic);
                              setShowResetPasswordModal(true);
                            }}
                            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm"
                            title="Reset Owner Password"
                          >
                            <KeyRound size={20} />
                          </button>

                          <button 
                            onClick={() => {
                              setClinicToDelete(clinic);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all shadow-sm"
                            title="Delete Clinic"
                          >
                            <Trash2 size={20} />
                          </button>

                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-blue-50/50 flex items-center gap-3 border border-blue-100/50">
                       <ShieldCheck size={18} className="text-blue-600" />
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Admins</p>
                         <p className="text-sm font-bold text-slate-900">{clinic.adminCount || 0}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50/50 flex items-center gap-3 border border-amber-100/50">
                       <Stethoscope size={18} className="text-amber-600" />
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Doctors</p>
                         <p className="text-sm font-bold text-slate-900">{clinic.doctorCount || 0}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 flex items-center gap-3 border border-emerald-100/50">
                       <Users size={18} className="text-emerald-600" />
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reception</p>
                         <p className="text-sm font-bold text-slate-900">{clinic.receptionistCount || 0}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 flex items-center gap-3">
                       <CreditCard size={18} className="text-slate-500" />
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reg. Fee</p>
                         <p className="text-sm font-bold text-slate-900">₹{clinic.registrationFee || '0'}</p>
                       </div>
                    </div>
                  </div>


                  <div className="pt-6 border-t border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                             <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                  <Clock size={14} /> Working Hours
                                </h4>
                                <p className="text-sm font-bold text-slate-700">{clinic.openingTime} - {clinic.closingTime}</p>
                                <p className="text-xs text-slate-500">{clinic.workingDays?.join(', ')}</p>
                             </div>
                             <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                  <ShieldCheck size={14} /> Verification Action
                                </h4>
                                <div className="flex items-center gap-3">
                                  {clinic.clinicStatus !== 'approved' && (user?.role === 'super_admin') && (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleApprove(clinic._id)}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 flex items-center gap-2"
                                      >
                                        <CheckCircle size={14} /> Approve
                                      </button>
                                      <button 
                                        onClick={() => handleReject(clinic._id)}
                                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-all flex items-center gap-2"
                                      >
                                        <XCircle size={14} /> Reject
                                      </button>
                                    </div>
                                  )}
                                  {clinic.clinicStatus === 'approved' && (
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                                      <CheckCircle2 size={16} /> Verified by System
                                    </span>
                                  )}
                                  {clinic.clinicStatus === 'pending' && user?.role !== 'super_admin' && (
                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-2">
                                      <Clock size={16} /> Awaiting Verification
                                    </span>
                                  )}
                                </div>
                             </div>
                          </div>

                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Stethoscope size={14} /> Doctors in this Clinic
                            </h4>
                            {clinicDoctors.length > 0 && clinic.clinicStatus === 'approved' && (
                              <button 
                                onClick={() => {
                                  setSelectedClinic(clinic);
                                  setSlotFormData(prev => ({...prev, doctorId: clinicDoctors[0]._id}));
                                  setIsSlotModalOpen(true);
                                }}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider"
                              >
                                <Clock size={12} /> Set Time Slots
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            {clinicDoctors.length > 0 ? clinicDoctors.map((doc) => (
                              <div key={doc._id} className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between group/doc">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm">
                                    {doc.user?.avatar ? (
                                      <img src={getFullImageUrl(doc.user.avatar)} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-blue-600 font-bold">{doc.user?.name?.charAt(0)}</div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 group-hover/doc:text-blue-600 transition-colors">Dr. {doc.user?.name}</p>
                                    <p className="text-xs font-medium text-slate-500">{doc.specialty}</p>
                                  </div>
                                </div>
                                <ArrowRight size={18} className="text-slate-300 group-hover/doc:text-blue-500 group-hover/doc:translate-x-1 transition-all" />
                              </div>
                            )) : (
                              <p className="text-sm text-slate-400 font-medium py-4 text-center italic">No doctors currently linked to this facility.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
            );
          }) : (
            <div className="col-span-2 text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <Filter size={64} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-xl">No {statusFilter !== 'all' ? statusFilter : ''} clinics found matching "{searchTerm}"</p>
              <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="text-blue-600 font-bold mt-2 hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      )}

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingClinicId ? 'Edit Clinic' : 'Register New Clinic'}</h2>
                  <p className="text-sm text-slate-500 font-medium">Fill in the clinical and administrative details below.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-12">
                                   {/* 1. Basic Info */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      1. Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Clinic Display Name" 
                        name="clinicName" 
                        placeholder="e.g. Apollo Healthcare" 
                        value={formData.clinicName} 
                        onChange={handleInputChange} 
                        error={fieldErrors.clinicName}
                        required 
                      />
                      <Input 
                        label="Legal Registered Name" 
                        name="legalName" 
                        placeholder="e.g. Apollo Hospitals Enterprise Ltd" 
                        value={formData.legalName} 
                        onChange={handleInputChange} 
                        error={fieldErrors.legalName}
                        required 
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Clinic Type</label>
                        <select 
                          name="clinicType"
                          value={formData.clinicType}
                          onChange={handleInputChange}
                          className={`w-full h-11 px-4 rounded-xl bg-slate-50 border-2 transition-all outline-none font-bold text-sm ${
                            fieldErrors.clinicType 
                              ? 'border-red-500 focus:bg-white focus:border-red-500' 
                              : 'border-transparent focus:bg-white focus:border-blue-600'
                          }`}
                        >
                          {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {fieldErrors.clinicType && (
                          <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.clinicType}</p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Description (About Clinic)</label>
                        <textarea 
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className={`w-full p-4 rounded-xl bg-slate-50 border-2 transition-all outline-none font-bold text-sm min-h-[100px] ${
                            fieldErrors.description 
                              ? 'border-red-500 focus:bg-white focus:border-red-500' 
                              : 'border-transparent focus:bg-white focus:border-blue-600'
                          }`}
                          placeholder="Briefly describe the clinic and its history..."
                        />
                        {fieldErrors.description && (
                          <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.description}</p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-sm font-bold text-slate-700 ml-1">Clinic Logo / Image</label>
                         <div className="flex items-center gap-4">
                            {formData.images?.[0] && (
                               <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                                  <img src={getFullImageUrl(formData.images[0])} alt="Logo" className="w-full h-full object-cover" />
                               </div>
                            )}
                            <label className="flex-1">
                               <div className={`w-full h-12 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold ${
                                 fieldErrors.images 
                                   ? 'border-red-500 bg-red-50/50 text-red-600 hover:border-red-600' 
                                   : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-500 hover:text-blue-600'
                               }`}>
                                  {isUploading ? (
                                     <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                                   ) : (
                                     <><Upload size={18} /> {formData.images?.[0] ? 'Change Image' : 'Upload Image'}</>
                                   )}
                               </div>
                               <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'images')} />
                            </label>
                         </div>
                         {fieldErrors.images && (
                           <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.images}</p>
                         )}
                      </div>
                    </div>
                  </section>

                  {/* 2. Location */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      2. Location Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Input label="Detailed Address" name="address" value={formData.address} onChange={handleInputChange} error={fieldErrors.address} required />
                      </div>
                      <Input label="Building/Floor (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} error={fieldErrors.addressLine2} />
                      <Input label="City" name="city" value={formData.city} onChange={handleInputChange} error={fieldErrors.city} required />
                      <Input label="State" name="state" value={formData.state} onChange={handleInputChange} error={fieldErrors.state} required />
                      <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} error={fieldErrors.pincode} required />
                      <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} error={fieldErrors.country} required />
                    </div>
                  </section>


                  {/* 4. Contact Details */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      4. Clinic Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Public Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} error={fieldErrors.phone} icon={Phone} required />
                       <Input label="Alternate Phone" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange} error={fieldErrors.alternatePhone} icon={Phone} />
                       <Input label="Public Email Address" name="email" value={formData.email} onChange={handleInputChange} error={fieldErrors.email} icon={Mail} required />
                    </div>
                  </section>

                  {/* 5. Timing */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      5. Working Hours
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Opening Time" name="openingTime" type="time" value={formData.openingTime} onChange={handleInputChange} error={fieldErrors.openingTime} icon={Clock} required />
                       <Input label="Closing Time" name="closingTime" type="time" value={formData.closingTime} onChange={handleInputChange} error={fieldErrors.closingTime} icon={Clock} required />
                       <div className="md:col-span-2 space-y-3">
                          <label className="text-sm font-bold text-slate-700 ml-1">Working Days</label>
                          <div className="flex flex-wrap gap-2">
                             {WORKING_DAYS.map(day => (
                               <button
                                 key={day}
                                 type="button"
                                 onClick={() => {
                                    handleArrayToggle('workingDays', day);
                                    if (fieldErrors.workingDays) {
                                      setFieldErrors(prev => {
                                        const next = { ...prev };
                                        delete next.workingDays;
                                        return next;
                                      });
                                    }
                                 }}
                                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                   formData.workingDays.includes(day) ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                 }`}
                               >
                                 {day}
                               </button>
                             ))}
                          </div>
                          {fieldErrors.workingDays && (
                            <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.workingDays}</p>
                          )}
                       </div>
                       <div className="md:col-span-2 flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                          <input 
                            type="checkbox" 
                            name="emergencyAvailable" 
                            checked={formData.emergencyAvailable}
                            onChange={handleInputChange}
                            className="w-5 h-5 rounded-lg text-red-600"
                          />
                          <label className="text-sm font-bold text-red-900">Emergency Available (24/7 Support)</label>
                       </div>
                    </div>
                  </section>

                  {/* 6. Doctors Mapping */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      6. Doctors Mapping
                    </h3>
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Select Available Doctors</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                           {doctors.map(doc => (
                              <button
                                key={doc._id}
                                type="button"
                                onClick={() => {
                                  handleArrayToggle('doctors', doc._id);
                                  if (fieldErrors.doctors) {
                                    setFieldErrors(prev => {
                                      const next = { ...prev };
                                      delete next.doctors;
                                      return next;
                                    });
                                  }
                                }}
                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                                  formData.doctors.includes(doc._id) ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-slate-100 hover:border-blue-200'
                                }`}
                              >
                                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 font-bold text-xs border border-slate-200">
                                    {doc.user?.name?.charAt(0)}
                                 </div>
                                 <span className="text-xs font-bold text-slate-700">Dr. {doc.user?.name}</span>
                              </button>
                           ))}
                        </div>
                        {fieldErrors.doctors && (
                          <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.doctors}</p>
                        )}
                    </div>
                  </section>

                  {/* 7. Facilities & Services */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      7. Facilities & Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Available Services</label>
                          <div className="flex flex-wrap gap-2">
                             {SERVICES.map(s => (
                               <button
                                 key={s} type="button"
                                 onClick={() => {
                                   handleArrayToggle('services', s);
                                   if (fieldErrors.services) {
                                     setFieldErrors(prev => {
                                       const next = { ...prev };
                                       delete next.services;
                                       return next;
                                     });
                                   }
                                 }}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                   formData.services.includes(s) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                                 }`}
                               >
                                 {s}
                               </button>
                             ))}
                          </div>
                          {fieldErrors.services && (
                            <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.services}</p>
                          )}
                       </div>
                       <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Common Facilities</label>
                          <div className="flex flex-wrap gap-2">
                             {FACILITIES.map(f => (
                               <button
                                 key={f} type="button"
                                 onClick={() => {
                                   handleArrayToggle('facilities', f);
                                   if (fieldErrors.facilities) {
                                     setFieldErrors(prev => {
                                       const next = { ...prev };
                                       delete next.facilities;
                                       return next;
                                     });
                                   }
                                 }}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                   formData.facilities.includes(f) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                                 }`}
                               >
                                 {f}
                               </button>
                             ))}
                          </div>
                          {fieldErrors.facilities && (
                            <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.facilities}</p>
                          )}
                       </div>
                    </div>
                  </section>

                  {/* 8. Fee Settings */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      8. Fee Settings
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                       <Input label="Registration Fee" name="registrationFee" type="number" value={formData.registrationFee} onChange={handleInputChange} error={fieldErrors.registrationFee} icon={CreditCard} />
                    </div>
                  </section>

                  {/* 8.5 Operations Settings */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      8.5 Operations Settings
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                       <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <input 
                            type="checkbox" 
                            name="receptionAssistantMode" 
                            checked={formData.receptionAssistantMode || false}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                receptionAssistantMode: e.target.checked
                              }));
                            }}
                            className="w-5 h-5 rounded-lg text-blue-600"
                          />
                          <div>
                            <label className="text-sm font-black text-slate-800">Enable Reception Assistant Mode</label>
                            <p className="text-xs text-slate-500 font-bold mt-1">When enabled, receptionists can help doctors prepare patient consults by drafting clinical records (status Draft Prepared).</p>
                          </div>
                       </div>
                    </div>
                  </section>

                  {/* 9. Verification Details */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      9. Verification Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Registration Number (GST/License)" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} error={fieldErrors.registrationNumber} required />
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Registration Proof (Mandatory)</label>
                           <div className="flex items-center gap-4">
                             {formData.registrationProof && formData.registrationProof.match(/\.(jpg|jpeg|png|webp|gif)$|image/i) && (
                                <div className="w-11 h-11 rounded-lg overflow-hidden border border-emerald-200 shadow-sm flex-shrink-0">
                                   <img src={getFullImageUrl(formData.registrationProof)} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                             )}
                             <label className="flex-1 block">
                                <div className={`w-full h-11 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold ${
                                  fieldErrors.registrationProof 
                                    ? 'bg-red-50 border-red-200 text-red-600 hover:border-red-600' 
                                    : formData.registrationProof 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
                                }`}>
                                   {isUploading ? (
                                      <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                                   ) : formData.registrationProof ? (
                                      <><CheckCircle2 size={18} /> Proof Attached</>
                                   ) : (
                                      <><Upload size={18} /> Upload Proof (PDF/IMG)</>
                                   )}
                                </div>
                                <input type="file" className="hidden" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'registrationProof')} />
                             </label>
                           </div>
                           {fieldErrors.registrationProof && (
                             <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.registrationProof}</p>
                           )}
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Address Proof (Optional)</label>
                           <div className="flex items-center gap-4">
                             {formData.addressProof && formData.addressProof.match(/\.(jpg|jpeg|png|webp|gif)$|image/i) && (
                                <div className="w-11 h-11 rounded-lg overflow-hidden border border-blue-200 shadow-sm flex-shrink-0">
                                   <img src={getFullImageUrl(formData.addressProof)} alt="Address Proof" className="w-full h-full object-cover" />
                                </div>
                             )}
                             <label className="flex-1 block">
                                <div className={`w-full h-11 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold ${
                                  fieldErrors.addressProof 
                                    ? 'bg-red-50 border-red-200 text-red-600 hover:border-red-600' 
                                    : formData.addressProof 
                                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
                                }`}>
                                   {isUploading ? (
                                      <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                                   ) : formData.addressProof ? (
                                      <><CheckCircle2 size={18} /> Address Proof Attached</>
                                   ) : (
                                      <><Upload size={18} /> Upload Address Proof</>
                                   )}
                                </div>
                                <input type="file" className="hidden" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'addressProof')} />
                             </label>
                           </div>
                           {fieldErrors.addressProof && (
                             <p className="text-xs font-medium text-red-500 ml-1">{fieldErrors.addressProof}</p>
                           )}
                       </div>
                    </div>
                  </section>

                  {formError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex flex-col gap-2">
                       <div className="flex items-center gap-3">
                          <AlertCircle size={20} className="shrink-0" />
                          <span>Please correct the following errors:</span>
                       </div>
                       <ul className="list-disc pl-8 space-y-1 font-medium text-xs">
                          {Array.isArray(formError) ? (
                            formError.map((err, idx) => <li key={idx}>{err}</li>)
                          ) : (
                            <li>{formError}</li>
                          )}
                       </ul>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold flex items-center gap-3">
                       <CheckCircle2 size={20} /> {successMsg}
                    </div>
                  )}

                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex gap-4 sticky bottom-0 z-10">
                <Button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-[2] h-14 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={24} className="animate-spin" /> : editingClinicId ? 'Save Changes' : 'Register Clinic'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Set Doctor Time Slots Modal */}
      <AnimatePresence>
        {isSlotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSlotModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">👉 Set Doctor Time Slots</h2>
                  <p className="text-sm text-slate-500 font-medium">Generate availability slots for the selected doctor.</p>
                </div>
                <button 
                  onClick={() => setIsSlotModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={handleSlotSubmit} className="space-y-6">
                  {/* Doctor Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Doctor Name</label>
                    <select
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm"
                      value={slotFormData.doctorId}
                      onChange={(e) => setSlotFormData({...slotFormData, doctorId: e.target.value})}
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.filter(d => selectedClinic && (d.clinic?._id === selectedClinic._id || (Array.isArray(d.clinics) && d.clinics.includes(selectedClinic._id)))).map(doc => (
                        <option key={doc._id} value={doc._id}>Dr. {doc.user?.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Available Days */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {WORKING_DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSlotFormData(prev => ({
                              ...prev,
                              days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
                            }))
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            slotFormData.days.includes(day) ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Time & End Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Start Time" name="startTime" type="time" required value={slotFormData.startTime} onChange={e => setSlotFormData({...slotFormData, startTime: e.target.value})} />
                    <Input label="End Time" name="endTime" type="time" required value={slotFormData.endTime} onChange={e => setSlotFormData({...slotFormData, endTime: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Slot Duration (minutes)</label>
                    <input 
                      type="number" 
                      min="5" max="120"
                      required
                      value={slotFormData.duration}
                      onChange={e => setSlotFormData({...slotFormData, duration: Number(e.target.value)})}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm"
                      placeholder="Custom duration..."
                    />
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[10, 15, 20, 30, 45, 60].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setSlotFormData({...slotFormData, duration: mins})}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            slotFormData.duration === mins 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {mins} mins
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Breaks */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">⚙️ Optional Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Break Start Time" name="breakStart" type="time" value={slotFormData.breakStart} onChange={e => setSlotFormData({...slotFormData, breakStart: e.target.value})} />
                      <Input label="Break End Time" name="breakEnd" type="time" value={slotFormData.breakEnd} onChange={e => setSlotFormData({...slotFormData, breakEnd: e.target.value})} />
                    </div>
                  </div>

                  {slotFormError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
                       <AlertCircle size={20} /> {slotFormError}
                    </div>
                  )}
                  {slotSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold flex items-center gap-3">
                       <CheckCircle2 size={20} /> {slotSuccessMsg}
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex gap-4 sticky bottom-0 z-10">
                <Button 
                  onClick={() => setIsSlotModalOpen(false)}
                  className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSlotSubmit}
                  disabled={isGeneratingSlots || slotFormData.days.length === 0}
                  className="flex-[2] h-14 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingSlots ? <Loader2 size={24} className="animate-spin" /> : '🔥 Generate & Save Slots'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Move Clinic to Trash Bin"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
            <Trash2 size={40} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Move to Trash?</h3>
          <p className="text-slate-500 mt-2 font-medium">
            Are you sure you want to delete <span className="text-slate-900 font-bold">{clinicToDelete?.clinicName}</span>? 
            It will be kept in the trash bin for 60 days before permanent removal.
          </p>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-14 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={handleDeleteClinic} 
              disabled={isDeleting}
              className="flex-1 h-14 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : 'Yes, Move to Trash'}
            </Button>
          </div>
        </div>
      </Modal>


      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        title="Reset Clinic Owner Password"
      >
        <div className="space-y-6 p-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
            <Lock className="text-amber-500 shrink-0" size={24} />
            <p className="text-sm text-amber-700 font-medium">
              You are resetting the password for the administrator of <strong>{resettingClinic?.clinicName}</strong>. 
              This will log them out from all devices.
            </p>
          </div>
          <Input 
            label="New Secure Password"
            type="password"
            placeholder="At least 8 characters..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={() => setShowResetPasswordModal(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={handleResetOwnerPassword}
              disabled={!newPassword || isResetting}
              className="flex-[2] h-12 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100"
            >
              {isResetting ? <Loader2 className="animate-spin" /> : 'Confirm Reset'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={24} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}

