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
  PlayCircle,
  Navigation
} from 'lucide-react';
import { clinicsApi, doctorsApi, usersApi, utilityApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

const CLINIC_TYPES = ['Private Clinic'];
const CLINIC_SPECIALTIES = [
  'General Physician',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Urology',
  'Nephrology',
  'Oncology',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'Rheumatology',
  'Dentistry',
  'Physiotherapy',
  'General Surgery',
  'Plastic Surgery',
  'Emergency Medicine'
];
const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SERVICES = ['OPD', 'Emergency', 'Lab Test', 'Pharmacy'];
const FACILITIES = ['ICU', 'Ambulance', 'Parking', 'Wheelchair Access'];

export default function ClinicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clinicTypeFilter, setClinicTypeFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  
  // Registration Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
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

  // Registration Form State
  const [formData, setFormData] = useState({
    clinicName: '',
    legalName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    clinicType: 'Private Clinic',
    specialties: [],
    description: '',
    images: [],
    address: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    alternatePhone: '',
    email: '',
    website: '',
    openingTime: '09:00',
    closingTime: '21:00',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    emergencyAvailable: false,
    receptionAssistantMode: false,
    doctors: [],
    services: [],
    facilities: [],
    registrationNumber: '',
    registrationProof: '',
    addressProof: ''
  });

  // Geolocation & dropdown states
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await utilityApi.getStates();
        setStatesList(res.data || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.state) {
        setDistrictsList([]);
        return;
      }
      try {
        const res = await utilityApi.getDistricts(formData.state);
        setDistrictsList(res.data || []);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    };
    fetchDistricts();
  }, [formData.state]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/utility/reverse-geocode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await res.json();
          if (data.status === 'success') {
            const { pincode, district, state } = data.data;
            setFormData(prev => ({
              ...prev,
              state,
              district,
              pincode: pincode || prev.pincode
            }));
          } else {
            alert('Failed to resolve coordinates to location details.');
          }
        } catch (err) {
          console.error(err);
          alert('Failed to connect to geocoding service.');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        alert(`Location permission denied or retrieval failed: ${error.message}`);
      }
    );
  };



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
      specialties: clinic.specialties || [],
      description: clinic.description || '',
      images: clinic.images || [],
      address: clinic.address || '',
      addressLine2: clinic.addressLine2 || '',
      city: clinic.city || '',
      district: clinic.district || '',
      state: clinic.state || '',
      pincode: clinic.pincode || '',
      country: clinic.country || 'India',
      phone: clinic.phone || '',
      alternatePhone: clinic.alternatePhone || '',
      email: clinic.email || '',
      website: clinic.website || '',
      openingTime: clinic.openingTime || '09:00',
      closingTime: clinic.closingTime || '21:00',
      workingDays: clinic.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      emergencyAvailable: clinic.emergencyAvailable || false,
      receptionAssistantMode: clinic.receptionAssistantMode || false,
      doctors: clinic.doctors?.map(d => typeof d === 'object' ? d._id : d) || [],
      services: clinic.services || [],
      facilities: clinic.facilities || [],
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
      specialties: [],
      description: '',
      images: [],
      address: '',
      addressLine2: '',
      city: user?.city || '',
      district: '',
      state: user?.state || '',
      pincode: '',
      country: 'India',
      phone: user?.phone || '',
      alternatePhone: '',
      email: user?.email || '',
      website: '',
      openingTime: '09:00',
      closingTime: '21:00',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      emergencyAvailable: false,
      receptionAssistantMode: false,
      doctors: [],
      services: [],
      facilities: [],
      registrationNumber: '',
      registrationProof: '',
      addressProof: ''
    });
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, clinicTypeFilter, specialtyFilter]);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      resetForm();
      setWizardStep(1);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let params = {
        status: statusFilter,
        isDashboard: true,
        clinicType: clinicTypeFilter,
        specialty: specialtyFilter
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

      let clinicsData = [];
      let doctorsData = [];
      
      try {
        const clinicsRes = await clinicsApi.getAll(params);
        clinicsData = clinicsRes.data.clinics || [];
      } catch (err) {
        console.error('Failed to fetch clinics:', err);
      }

      try {
        const doctorsRes = await doctorsApi.getAll();
        doctorsData = doctorsRes.data.doctors || [];
      } catch (err) {
        console.warn('Failed to fetch doctors (possibly due to missing clinic context):', err.message);
      }

      setClinics(clinicsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter(c => 
    c.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.pincode && c.pincode.toLowerCase().includes(searchTerm.toLowerCase()))
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
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), res.data.url] }));
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

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
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
      <div className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search clinics by name, pincode or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-14 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm"
          />
        </div>

        {/* Clinic Type Dropdown Filter */}
        <div className="w-full xl:w-auto">
          <select 
            value={clinicTypeFilter}
            onChange={(e) => setClinicTypeFilter(e.target.value)}
            className="w-full xl:w-48 h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200/50 focus:bg-white focus:border-blue-600 outline-none font-bold text-xs cursor-pointer text-slate-700"
          >
            <option value="all">All Clinic Types</option>
            {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Specialty Dropdown Filter */}
        <div className="w-full xl:w-auto">
          <select 
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="w-full xl:w-56 h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200/50 focus:bg-white focus:border-blue-600 outline-none font-bold text-xs cursor-pointer text-slate-700"
          >
            <option value="all">All Specialties</option>
            {CLINIC_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full xl:w-auto overflow-x-auto custom-scrollbar">
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
                          <MapPin size={14} /> {clinic.state} - {clinic.pincode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Clinic Admin / Owner Actions */}
                      {user?.role === 'admin' && (
                        <>
                          <button 
                            onClick={() => handleEdit(clinic)}
                            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
                            title="Edit Clinic"
                          >
                            <Pencil size={20} />
                          </button>
                          
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

                      {/* Super Admin Actions */}
                      {user?.role === 'super_admin' && (
                        <>
                          {clinic.clinicStatus !== 'approved' && (
                            <button 
                              onClick={() => handleApprove(clinic._id)}
                              className="w-12 h-12 rounded-2xl bg-slate-50 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
                              title="Approve Clinic"
                            >
                              <CheckCircle size={20} />
                            </button>
                          )}
                          
                          {clinic.clinicStatus !== 'rejected' && clinic.clinicStatus !== 'suspended' && (
                            <button 
                              onClick={() => handleReject(clinic._id)}
                              className="w-12 h-12 rounded-2xl bg-slate-50 text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all shadow-sm"
                              title="Reject Clinic"
                            >
                              <XCircle size={20} />
                            </button>
                          )}

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
                              title="Pause/Suspend Clinic"
                            >
                              <PauseCircle size={20} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              <p className="text-slate-500 font-bold text-xl">No {statusFilter !== 'all' ? statusFilter : ''} clinics found matching &quot;{searchTerm}&quot;</p>
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
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header & Progress Indicator */}
              <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{editingClinicId ? 'Edit Clinic Workspace' : 'Add New Clinic Workspace'}</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Separate from user account registration</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Wizard Steps Tracker */}
                {!editingClinicId && (
                  <div className="flex items-center justify-between relative max-w-xl mx-auto pt-2 pb-1">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-150 -translate-y-1/2 z-0" />
                    <div 
                      className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
                      style={{ width: `${((wizardStep - 1) / 3) * 100}%` }}
                    />
                    {[
                      { num: 1, label: 'Basic Info' },
                      { num: 2, label: 'Location' },
                      { num: 3, label: 'Verification' },
                      { num: 4, label: 'Review' }
                    ].map((stepObj) => (
                      <div key={stepObj.num} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-350 ${
                          wizardStep > stepObj.num 
                            ? 'bg-emerald-500 text-white' 
                            : wizardStep === stepObj.num 
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                              : 'bg-slate-200 text-slate-500'
                        }`}>
                          {wizardStep > stepObj.num ? <CheckCircle2 size={14} /> : stepObj.num}
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 mt-1.5">{stepObj.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wizard Form Sections */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  
                  {/* STEP 1: Basic Information */}
                  {(editingClinicId || wizardStep === 1) && (
                    <motion.div 
                      initial={editingClinicId ? {} : { opacity: 0, x: 20 }}
                      animate={editingClinicId ? {} : { opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Step 1. Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                          label="Clinic Name" 
                          name="clinicName" 
                          placeholder="e.g. Metro Healthcare Centre" 
                          value={formData.clinicName} 
                          onChange={(e) => {
                            handleInputChange(e);
                            setFormData(prev => ({ ...prev, legalName: e.target.value }));
                          }} 
                          error={fieldErrors.clinicName}
                          required 
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Clinic Type *</label>
                          <select 
                            name="clinicType"
                            value={formData.clinicType}
                            onChange={handleInputChange}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm"
                          >
                            {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>

                        {/* Specialties Searchable Multi-Select Component */}
                        <div className="space-y-2 relative md:col-span-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Specialties Offered *</label>
                          
                          {/* Selected Chips */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {formData.specialties && formData.specialties.length > 0 ? (
                              formData.specialties.map(spec => (
                                <span key={spec} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-extrabold text-[10px] uppercase tracking-wider border border-blue-100">
                                  {spec}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        specialties: prev.specialties.filter(s => s !== spec)
                                      }));
                                    }}
                                    className="text-blue-400 hover:text-red-500 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic ml-1">No specialties selected yet.</span>
                            )}
                          </div>

                          {/* Search Input */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Type to search and select medical specialties..."
                              value={specialtySearch}
                              onChange={(e) => {
                                setSpecialtySearch(e.target.value);
                                setIsSpecialtyDropdownOpen(true);
                              }}
                              onFocus={() => setIsSpecialtyDropdownOpen(true)}
                              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm"
                            />
                            {isSpecialtyDropdownOpen && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSpecialtyDropdownOpen(false);
                                  setSpecialtySearch('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wider"
                              >
                                Done
                              </button>
                            )}
                          </div>

                          {/* Dropdown Options */}
                          {isSpecialtyDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 custom-scrollbar divide-y divide-slate-50">
                              {CLINIC_SPECIALTIES.filter(spec => 
                                spec.toLowerCase().includes(specialtySearch.toLowerCase())
                              ).length > 0 ? (
                                CLINIC_SPECIALTIES.filter(spec => 
                                  spec.toLowerCase().includes(specialtySearch.toLowerCase())
                                ).map(spec => {
                                  const isSelected = formData.specialties?.includes(spec);
                                  return (
                                    <div
                                      key={spec}
                                      onClick={() => {
                                        setFormData(prev => {
                                          const current = prev.specialties || [];
                                          const updated = current.includes(spec)
                                            ? current.filter(s => s !== spec)
                                            : [...current, spec];
                                          return { ...prev, specialties: updated };
                                        });
                                      }}
                                      className={`px-4 py-2.5 hover:bg-slate-50 cursor-pointer font-bold text-xs flex items-center justify-between transition-colors ${
                                        isSelected ? 'bg-blue-50/35 text-blue-600' : 'text-slate-600'
                                      }`}
                                    >
                                      <span>{spec}</span>
                                      {isSelected && <CheckCircle size={14} className="text-blue-600" />}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="px-4 py-3 text-xs text-slate-400 font-bold italic">No matching specialties found</div>
                              )}
                            </div>
                          )}
                        </div>

                        <Input 
                          label="Primary Contact Number" 
                          name="phone" 
                          placeholder="e.g. +91 98765 43210" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          error={fieldErrors.phone}
                          required 
                        />

                        <Input 
                          label="Official Email" 
                          name="email" 
                          placeholder="e.g. contact@metrohealth.com" 
                          type="email"
                          value={formData.email} 
                          onChange={handleInputChange} 
                          error={fieldErrors.email}
                          required 
                        />

                        <Input 
                          label="Website URL (Optional)" 
                          name="website" 
                          placeholder="e.g. https://www.metrohealth.com" 
                          value={formData.website} 
                          onChange={handleInputChange} 
                          error={fieldErrors.website}
                        />

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Description (About Clinic)</label>
                          <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe clinic services, healthcare focus, or custom details..."
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm min-h-[100px]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Location Details */}
                  {(editingClinicId || wizardStep === 2) && (
                    <motion.div 
                      initial={editingClinicId ? {} : { opacity: 0, x: 20 }}
                      animate={editingClinicId ? {} : { opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          Step 2. Location Details
                        </h3>
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={isDetecting}
                          className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-xs transition-all disabled:opacity-50 border border-blue-100 shadow-sm"
                        >
                          <Navigation size={14} className={isDetecting ? 'animate-spin' : ''} />
                          {isDetecting ? 'Detecting...' : 'Use Current Location'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Input label="Detailed Address" name="address" placeholder="e.g. 123 Health Ave, Suite 4" value={formData.address} onChange={handleInputChange} error={fieldErrors.address} required />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">State *</label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm"
                          >
                            <option value="">Choose State</option>
                            {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">District *</label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            disabled={!formData.state}
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm disabled:opacity-50"
                          >
                            <option value="">Choose District</option>
                            {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>

                        <Input label="Pincode" name="pincode" placeholder="e.g. 110001" value={formData.pincode} onChange={handleInputChange} error={fieldErrors.pincode} required />
                        <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} error={fieldErrors.country} required />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Verification */}
                  {(editingClinicId || wizardStep === 3) && (
                    <motion.div 
                      initial={editingClinicId ? {} : { opacity: 0, x: 20 }}
                      animate={editingClinicId ? {} : { opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Step 3. Verification Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Clinic Registration Number" name="registrationNumber" placeholder="e.g. REG-783921" value={formData.registrationNumber} onChange={handleInputChange} error={fieldErrors.registrationNumber} required />
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Clinic Logo</label>
                          <div className="flex items-center gap-4">
                            {formData.images?.[0] && (
                              <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                <img src={getFullImageUrl(formData.images[0])} alt="Logo" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <label className="flex-1 block">
                              <div className="w-full h-11 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                                {isUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Choose Logo Image</>}
                              </div>
                              <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'images')} />
                            </label>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Supporting / Registration Document (GST / License Proof)</label>
                          <div className="flex items-center gap-4">
                            {formData.registrationProof && (
                              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ShieldCheck size={20} />
                              </div>
                            )}
                            <label className="flex-1 block">
                              <div className="w-full h-11 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                                {isUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : formData.registrationProof ? 'Proof Attached. Replace?' : <><Upload size={16} /> Upload Document (PDF/IMG)</>}
                              </div>
                              <input type="file" className="hidden" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'registrationProof')} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!editingClinicId && wizardStep === 4 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Step 4. Review & Submit
                      </h3>
                      
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200/65">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic Name</span>
                          <span className="text-xs font-black text-slate-800">{formData.clinicName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200/65">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic Type</span>
                          <span className="text-xs font-black text-slate-800">{formData.clinicType}</span>
                        </div>
                        <div className="flex flex-col py-2.5 border-b border-slate-200/65 gap-1.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Specialties Offered</span>
                          <div className="flex flex-wrap gap-1">
                            {formData.specialties?.map(spec => (
                              <span key={spec} className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-extrabold text-[9px] uppercase tracking-wider border border-blue-100">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200/65">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Number</span>
                          <span className="text-xs font-black text-slate-800">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200/65">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Email</span>
                          <span className="text-xs font-black text-slate-800">{formData.email}</span>
                        </div>
                        {formData.website && (
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200/65">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website</span>
                            <span className="text-xs font-black text-slate-800">{formData.website}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200/65">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                          <span className="text-xs font-black text-slate-800 truncate max-w-sm">{formData.address}, {formData.state} - {formData.pincode}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200/65">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reg Number</span>
                          <span className="text-xs font-black text-slate-800">{formData.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supporting File</span>
                          <span className="text-xs font-black text-emerald-600">{formData.registrationProof ? 'Uploaded successfully' : 'Not uploaded'}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-blue-700">
                        <AlertCircle className="shrink-0" size={20} />
                        <p className="text-xs font-medium leading-relaxed">
                          Your clinic request will enter <strong>Pending Verification</strong> status. It will not be publicly visible or bookable until Super Admin review and approval.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {formError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex flex-col gap-1.5 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>Form errors found:</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 font-medium">
                        {Array.isArray(formError) ? formError.map((err, idx) => <li key={idx}>{err}</li>) : <li>{formError}</li>}
                      </ul>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold flex items-center gap-3 animate-in fade-in">
                      <CheckCircle2 size={20} /> {successMsg}
                    </div>
                  )}

                </form>
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-slate-100 bg-white flex gap-4 sticky bottom-0 z-10">
                {editingClinicId ? (
                  <>
                    <Button 
                      onClick={() => setIsModalOpen(false)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex-[2] h-12 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    {wizardStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setWizardStep(prev => prev - 1)}
                        className="px-6 h-12 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
                      >
                        Back
                      </button>
                    )}
                    
                    {wizardStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setWizardStep(prev => prev + 1);
                        }}
                        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2"
                      >
                        Continue
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <Button 
                        onClick={handleSubmit}
                        disabled={isSaving || !formData.registrationProof}
                        className="flex-1 h-12 bg-emerald-500 text-white font-extrabold rounded-xl hover:bg-emerald-600 shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Submit Application'}
                      </Button>
                    )}
                  </>
                )}
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

