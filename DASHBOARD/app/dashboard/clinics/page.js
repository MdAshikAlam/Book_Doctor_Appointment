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
  Pencil
} from 'lucide-react';
import { clinicsApi, doctorsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
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
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  
  // Registration Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleApprove = async (id) => {
    try {
      await clinicsApi.approve(id);
      setSuccessMsg('Clinic approved successfully!');
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to approve clinic: ' + err.message);
    }
  };

  const handleEdit = (clinic) => {
    setEditingClinicId(clinic._id);
    setFormData({
      name: clinic.name || '',
      clinicType: clinic.clinicType || 'Private Clinic',
      description: clinic.description || '',
      images: clinic.images || [],
      addressLine1: clinic.addressLine1 || '',
      addressLine2: clinic.addressLine2 || '',
      district: clinic.district || '',
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
      doctors: clinic.doctors?.map(d => typeof d === 'object' ? d._id : d) || [],
      services: clinic.services || [],
      facilities: clinic.facilities || [],
      registrationFee: clinic.registrationFee || '',
      registrationNumber: clinic.registrationNumber || '',
      registrationCertificate: clinic.registrationCertificate || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingClinicId(null);
    setFormData({
      name: '',
      clinicType: 'Private Clinic',
      description: '',
      images: [],
      addressLine1: '',
      addressLine2: '',
      district: '',
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
      doctors: [],
      services: [],
      facilities: [],
      registrationFee: '',
      registrationNumber: '',
      registrationCertificate: ''
    });
  };

  const [formData, setFormData] = useState({
    name: '',
    clinicType: 'Private Clinic',
    description: '',
    images: [],
    addressLine1: '',
    addressLine2: '',
    district: '',
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
    doctors: [],
    services: [],
    facilities: [],
    registrationFee: '',
    registrationNumber: '',
    registrationCertificate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let params = {};
      
      // Try to get user's location for proximity sorting
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        params = {
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
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.addressLine1 && c.addressLine1.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.district && c.district.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDoctorsInClinic = (clinicId) => {
    return doctors.filter(d => d.clinic?._id === clinicId || (Array.isArray(d.clinics) && d.clinics.includes(clinicId)));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        // Set images as an array containing the uploaded URL
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...formData,
        registrationFee: formData.registrationFee ? Number(formData.registrationFee) : undefined,
      };
      
      if (editingClinicId) {
        await clinicsApi.update(editingClinicId, payload);
        setSuccessMsg('Clinic updated successfully!');
      } else {
        await clinicsApi.create(payload);
        setSuccessMsg('Clinic registered successfully!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        setEditingClinicId(null);
        fetchData();
      }, 2000);
    } catch (err) {
      setFormError(err.message || 'Failed to process request');
    } finally {
      setIsSaving(false);
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
        <Button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <Plus size={20} /> Register Clinic
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100">
        <div className="relative group max-w-2xl mx-auto">
          <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search clinics by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-14 pr-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-lg shadow-inner"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-slate-400 mt-4 font-bold text-lg">Fetching medical facilities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredClinics.length > 0 ? filteredClinics.map((clinic) => {
            const clinicDoctors = getDoctorsInClinic(clinic._id);
            const isSelected = selectedClinic?._id === clinic._id;

            return (
              <motion.div 
                layout
                key={clinic._id}
                className={`group bg-white rounded-[2.5rem] border-2 transition-all overflow-hidden ${isSelected ? 'border-blue-500 shadow-2xl shadow-blue-100 ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-200 shadow-xl shadow-slate-100'}`}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 overflow-hidden ${isSelected ? 'bg-blue-600' : 'bg-slate-900'}`}>
                        {clinic.images?.[0] ? (
                          <img src={getFullImageUrl(clinic.images[0])} alt={clinic.name} className="w-full h-full object-cover" />
                        ) : (
                          <Home size={32} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{clinic.name}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
                          <MapPin size={14} /> {clinic.district}, {clinic.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(user?.role === 'admin' || user?.role === 'super_admin' || clinic.owner === user?._id) && (
                        <button 
                          onClick={() => handleEdit(clinic)}
                          className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-all"
                          title="Edit Clinic"
                        >
                          <Pencil size={20} />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedClinic(isSelected ? null : clinic)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white rotate-90' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-slate-50 flex items-center gap-3">
                       <Users size={18} className="text-blue-500" />
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Staff</p>
                         <p className="text-sm font-bold text-slate-900">{clinicDoctors.length} Specialists</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 flex items-center gap-3">
                       <Phone size={18} className="text-emerald-500" />
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                         <p className="text-sm font-bold text-slate-900">{clinic.phone}</p>
                       </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
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
                                  <ShieldCheck size={14} /> Verification
                                </h4>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                    clinic.verificationStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {clinic.verificationStatus}
                                  </span>
                                  {clinic.verificationStatus !== 'Approved' && (user?.role === 'admin' || user?.role === 'super_admin') && (
                                    <button 
                                      onClick={() => handleApprove(clinic._id)}
                                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                                    >
                                      Approve
                                    </button>
                                  )}
                                </div>
                             </div>
                          </div>

                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Stethoscope size={14} /> Doctors in this Clinic
                          </h4>
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-2 text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <Home size={64} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-xl">No clinics found matching "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')} className="text-blue-600 font-bold mt-2 hover:underline">Clear search</button>
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
                  <h2 className="text-2xl font-black text-slate-900">Register New Clinic</h2>
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
                        label="Clinic Name" 
                        name="name" 
                        placeholder="e.g. Apollo Healthcare" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Clinic Type</label>
                        <select 
                          name="clinicType"
                          value={formData.clinicType}
                          onChange={handleInputChange}
                          className="w-full h-11 px-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm"
                        >
                          {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Description (About Clinic)</label>
                        <textarea 
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm min-h-[100px]"
                          placeholder="Briefly describe the clinic and its history..."
                        />
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
                               <div className="w-full h-12 px-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
                                  {isUploading ? (
                                     <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                                   ) : (
                                     <><Upload size={18} /> {formData.images?.[0] ? 'Change Image' : 'Upload Image'}</>
                                   )}
                               </div>
                               <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'images')} />
                            </label>
                         </div>
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
                        <Input label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} required />
                      </div>
                      <Input label="Address Line 2 (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} />
                      <Input label="District" name="district" value={formData.district} onChange={handleInputChange} required />
                      <Input label="State" name="state" value={formData.state} onChange={handleInputChange} required />
                      <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                      <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} required />
                    </div>
                  </section>

                  {/* 3. Contact Details */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      3. Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} icon={Phone} required />
                       <Input label="Alternate Phone" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange} icon={Phone} />
                       <Input label="Email Address" name="email" value={formData.email} onChange={handleInputChange} icon={Mail} required />
                    </div>
                  </section>

                  {/* 4. Timing */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      4. Working Hours
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Opening Time" name="openingTime" type="time" value={formData.openingTime} onChange={handleInputChange} icon={Clock} required />
                       <Input label="Closing Time" name="closingTime" type="time" value={formData.closingTime} onChange={handleInputChange} icon={Clock} required />
                       <div className="md:col-span-2 space-y-3">
                          <label className="text-sm font-bold text-slate-700 ml-1">Working Days</label>
                          <div className="flex flex-wrap gap-2">
                             {WORKING_DAYS.map(day => (
                               <button
                                 key={day}
                                 type="button"
                                 onClick={() => handleArrayToggle('workingDays', day)}
                                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                   formData.workingDays.includes(day) ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                 }`}
                               >
                                 {day}
                               </button>
                             ))}
                          </div>
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

                  {/* 5. Doctors Mapping */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      5. Doctors Mapping
                    </h3>
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Select Available Doctors</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                           {doctors.map(doc => (
                              <button
                                key={doc._id}
                                type="button"
                                onClick={() => handleArrayToggle('doctors', doc._id)}
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
                    </div>
                  </section>

                  {/* 6. Facilities & Services */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      6. Facilities & Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Available Services</label>
                          <div className="flex flex-wrap gap-2">
                             {SERVICES.map(s => (
                               <button
                                 key={s} type="button"
                                 onClick={() => handleArrayToggle('services', s)}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                   formData.services.includes(s) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                                 }`}
                               >
                                 {s}
                               </button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Common Facilities</label>
                          <div className="flex flex-wrap gap-2">
                             {FACILITIES.map(f => (
                               <button
                                 key={f} type="button"
                                 onClick={() => handleArrayToggle('facilities', f)}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                   formData.facilities.includes(f) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                                 }`}
                               >
                                 {f}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                  </section>

                  {/* 7. Fees */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      7. Fee Settings
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                       <Input label="Registration Fee" name="registrationFee" type="number" value={formData.registrationFee} onChange={handleInputChange} icon={CreditCard} />
                    </div>
                  </section>

                  {/* 8. Verification */}
                  <section className="space-y-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                      8. Verification Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Clinic Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} required />
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Registration Certificate</label>
                           <div className="flex items-center gap-4">
                             {formData.registrationCertificate && formData.registrationCertificate.match(/\.(jpg|jpeg|png|webp|gif)$|image/i) && (
                                <div className="w-11 h-11 rounded-lg overflow-hidden border border-emerald-200 shadow-sm flex-shrink-0">
                                   <img src={getFullImageUrl(formData.registrationCertificate)} alt="Certificate" className="w-full h-full object-cover" />
                                </div>
                             )}
                             <label className="flex-1 block">
                                <div className={`w-full h-11 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold ${
                                  formData.registrationCertificate 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
                                }`}>
                                   {isUploading ? (
                                      <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                                   ) : formData.registrationCertificate ? (
                                      <><CheckCircle2 size={18} /> Certificate Attached</>
                                   ) : (
                                      <><Upload size={18} /> Upload PDF/Image</>
                                   )}
                                </div>
                                <input type="file" className="hidden" accept="image/*,application/pdf" disabled={isUploading} onChange={(e) => handleFileUpload(e, 'registrationCertificate')} />
                             </label>
                           </div>
                       </div>
                    </div>
                  </section>

                  {formError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
                       <AlertCircle size={20} /> {formError}
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
                  {isSaving ? <Loader2 size={24} className="animate-spin" /> : 'Register Clinic'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
