"use client"

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Mail,
  Stethoscope,
  Briefcase,
  MapPin,
  DollarSign,
  AlertCircle,
  Loader2,
  Filter,
  Eye,
  Users,
  Phone,
  CalendarCheck,
  Shield,
  Award
} from 'lucide-react';
import { usersApi, doctorsApi, utilityApi, clinicsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Gynecologist',
  'Orthopedic',
  'ENT',
  'Neurologist',
  'Dentist',
  'Psychiatrist',
  'Eye Specialist (Ophthalmologist)'
];

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function DoctorsPage() {
  const { user: currentUser } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [clinicsCount, setClinicsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'receptionist';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    specialty: '',
    subSpecialization: '',
    experience: '',
    consultationFee: '',
    licenseNumber: '',
    medicalCouncil: '',
    qualifications: '', // Will split by comma
    bio: '',
    address: '',
    district: '',
    state: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [isFetchingStates, setIsFetchingStates] = useState(false);
  const [isFetchingDistricts, setIsFetchingDistricts] = useState(false);

  // Slot Form State
  const [slotFormData, setSlotFormData] = useState({
    days: [],
    startTime: '',
    endTime: '',
    duration: 20,
    breakStart: '',
    breakEnd: ''
  });
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);
  const [slotFormError, setSlotFormError] = useState(null);
  const [slotSuccessMsg, setSlotSuccessMsg] = useState(null);
  const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleGenerateSlots = async () => {
    if (!slotFormData.days.length || !slotFormData.startTime || !slotFormData.endTime) {
      setSlotFormError('Please fill in required fields (days, start time, end time).');
      return;
    }
    setIsGeneratingSlots(true);
    setSlotFormError(null);
    try {
      await doctorsApi.generateAvailability(editingDoctor._id, {
        days: slotFormData.days,
        startTime: slotFormData.startTime,
        endTime: slotFormData.endTime,
        duration: Number(slotFormData.duration),
        breakStart: slotFormData.breakStart || undefined,
        breakEnd: slotFormData.breakEnd || undefined,
      });
      setSlotSuccessMsg('Slots generated and saved successfully!');
      setTimeout(() => setSlotSuccessMsg(null), 3000);
      fetchDoctors();
    } catch (err) {
      setSlotFormError(err.message || 'Failed to generate slots');
    } finally {
      setIsGeneratingSlots(false);
    }
  };

  // Leave Form State
  const [leaveFormData, setLeaveFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [leaveFormError, setLeaveFormError] = useState(null);
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState(null);

  const handleApplyLeave = async () => {
    if (!leaveFormData.startDate || !leaveFormData.endDate) {
      setLeaveFormError('Please provide both start and end dates.');
      return;
    }
    setIsApplyingLeave(true);
    setLeaveFormError(null);
    try {
      await doctorsApi.addLeave(editingDoctor._id, leaveFormData);
      setLeaveSuccessMsg('Leave marked successfully!');
      setTimeout(() => setLeaveSuccessMsg(null), 3000);
      setLeaveFormData({ startDate: '', endDate: '', reason: '' });
      fetchDoctors();
    } catch (err) {
      setLeaveFormError(err.message || 'Failed to apply leave');
    } finally {
      setIsApplyingLeave(false);
    }
  };

  const fetchStates = async () => {
    try {
      setIsFetchingStates(true);
      const res = await utilityApi.getStates();
      if (res.status === 'success') {
        setStatesList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch states:', err);
    } finally {
      setIsFetchingStates(false);
    }
  };

  const fetchDistricts = async (stateName) => {
    if (!stateName) return;
    try {
      setIsFetchingDistricts(true);
      const res = await utilityApi.getDistricts(stateName);
      if (res.status === 'success') {
        setDistrictsList(res.data);
      } else {
        setDistrictsList([]);
      }
    } catch (err) {
      console.error('Failed to fetch districts:', err);
      setDistrictsList([]);
    } finally {
      setIsFetchingDistricts(false);
    }
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData({
      ...formData,
      state: state,
      district: '' // Clear district when state changes
    });
    setDistrictsList([]);
    if (state) {
      fetchDistricts(state);
    }
  };

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const [res, clinicsRes] = await Promise.all([
        doctorsApi.getAll({ dashboard: true }),
        clinicsApi.getAll({ status: 'approved' })
      ]);
      setDoctors(res.data.doctors || []);
      setClinicsCount(clinicsRes.data.clinics?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchStates();
  }, [fetchDoctors]);

  // When editing, fetch districts for the initial state
  useEffect(() => {
    if (editingDoctor && formData.state) {
      fetchDistricts(formData.state);
    }
  }, [editingDoctor]);

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '', email: '', avatar: '', password: '', phone: '', gender: '', dob: '',
      specialty: '', subSpecialization: '', experience: '', consultationFee: '',
      licenseNumber: '', medicalCouncil: '', qualifications: '',
      bio: '', address: '', district: '', state: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      avatar: doc.user?.avatar || '',
      password: '', // Leave blank for edit
      phone: doc.user?.phone || '',
      gender: doc.user?.gender || '',
      dob: doc.user?.dob ? new Date(doc.user.dob).toISOString().split('T')[0] : '',
      specialty: doc.specialty || '',
      subSpecialization: doc.subSpecialization || '',
      experience: doc.experience?.toString() || '',
      consultationFee: doc.consultationFee?.toString() || '',
      licenseNumber: doc.licenseNumber || '',
      medicalCouncil: doc.medicalCouncil || '',
      qualifications: doc.qualifications?.join(', ') || '',
      bio: doc.bio || '',
      address: doc.address || '',
      district: doc.district || '',
      state: doc.state || '',
    });
    setSelectedFile(null);
    setPreviewUrl(doc.user?.avatar || '');
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (doc) => {
    setViewingDoctor(doc);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, avatar: '' })); // Clear URL if local file is picked
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let currentAvatarUrl = formData.avatar;

      // 1. Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        const uploadRes = await doctorsApi.upload(uploadData);
        currentAvatarUrl = uploadRes.data.url;
        setIsUploading(false);
      }

      if (editingDoctor) {
        // Update logic
        const payload = {
          userData: {
            name: formData.name,
            email: formData.email,
            avatar: currentAvatarUrl,
            phone: formData.phone || undefined,
            gender: formData.gender ? formData.gender.toLowerCase() : undefined,
            dob: formData.dob || undefined,
          },
          profileData: {
            specialty: formData.specialty,
            subSpecialization: formData.subSpecialization,
            experience: Number(formData.experience) || 0,
            consultationFee: Number(formData.consultationFee) || 0,
            licenseNumber: formData.licenseNumber,
            medicalCouncil: formData.medicalCouncil,
            qualifications: formData.qualifications ? formData.qualifications.split(',').map(s => s.trim()).filter(s => s) : [],
            bio: formData.bio,
            address: formData.address,
            district: formData.district,
            state: formData.state,
          }
        };

        if (formData.password) {
          payload.userData.password = formData.password;
        }

        await doctorsApi.update(editingDoctor._id, payload);
      } else {
        // Create logic
        const payload = {
          userData: {
            name: formData.name,
            email: formData.email,
            avatar: currentAvatarUrl,
            password: formData.password || 'password123',
            phone: formData.phone || undefined,
            gender: formData.gender ? formData.gender.toLowerCase() : undefined,
            dob: formData.dob || undefined,
          },
          profileData: {
            specialty: formData.specialty,
            subSpecialization: formData.subSpecialization,
            experience: Number(formData.experience),
            consultationFee: Number(formData.consultationFee),
            licenseNumber: formData.licenseNumber,
            medicalCouncil: formData.medicalCouncil,
            qualifications: formData.qualifications.split(',').map(s => s.trim()).filter(s => s),
            bio: formData.bio,
            address: formData.address,
            district: formData.district,
            state: formData.state,
          }
        };
        await doctorsApi.create(payload);
      }

      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    try {
      setIsDeleting(true);
      await doctorsApi.delete(doctorToDelete._id);
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Add, edit, or remove healthcare professionals from the system.</p>
        </div>
        {canManage && (
          <div className="flex flex-col items-end">
            <Button
              onClick={handleOpenAddModal}
              disabled={clinicsCount === 0}
              className={`h-12 px-6 rounded-2xl text-white font-bold shadow-lg transition-all flex items-center gap-2 ${
                clinicsCount === 0 
                  ? 'bg-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
              }`}
            >
              <Plus size={20} /> Add New Doctor
            </Button>
            {clinicsCount === 0 && !loading && (
              <p className="text-xs text-red-500 font-bold mt-2">Approved clinic required to add doctors</p>
            )}
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, specialty or clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 flex items-center gap-2 font-bold w-full md:w-auto">
          <Filter size={18} /> Filters
        </Button>
      </div>

      {/* Doctors Table/Grid */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Specialty</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                {canManage && <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-400 mt-4 font-bold">Loading medical experts...</p>
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <AlertCircle size={40} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No doctors found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-100">
                          {doc.user?.avatar ? (
                            <img src={getFullImageUrl(doc.user.avatar)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            doc.user?.name?.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{doc.user?.name}</p>
                          <p className="text-xs font-medium text-slate-400">{doc.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold w-fit">
                        <Stethoscope size={14} /> {doc.specialty}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600 text-sm">
                      {doc.experience} Years
                    </td>
                    <td className="px-6 py-5 font-bold text-blue-600 text-sm">
                      ${doc.consultationFee}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        ★ {doc.rating?.toFixed(1) || '0.0'}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{doc.numReviews || 0} Reviews</p>
                    </td>
                    {canManage && (
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => handleOpenViewModal(doc)}
                            className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => handleOpenEditModal(doc)}
                              className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          {canManage && (
                            <button
                              onClick={() => setDoctorToDelete(doc)}
                              className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? "Edit Healthcare Professional" : "Add Healthcare Professional"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Dr. Julian Casablancas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="julian@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={editingDoctor ? "Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingDoctor}
              />
              <Input
                label="Mobile Number"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {previewUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1">
                  <div className="w-full h-11 px-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
                    <Plus size={16} /> {selectedFile ? selectedFile.name : (formData.avatar ? 'Change Photo' : 'Upload Photo')}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Professional Details Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={14} /> Professional Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Medical License Number"
                placeholder="REG12345678"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
              <Input
                label="Medical Council Name"
                placeholder="e.g., Delhi Medical Council"
                value={formData.medicalCouncil}
                onChange={(e) => setFormData({ ...formData, medicalCouncil: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-0">
                <Input
                  label="Specialization"
                  placeholder="Select or type specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                  list="specialty-options"
                />
                <datalist id="specialty-options">
                  {SPECIALTIES.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <Input
                label="Sub-specialization (Optional)"
                placeholder="e.g., Pediatric Cardiology"
                value={formData.subSpecialization}
                onChange={(e) => setFormData({ ...formData, subSpecialization: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Qualifications"
                placeholder="e.g., MBBS, MD, MS"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                required
              />
              <Input
                label="Years of Experience"
                type="number"
                placeholder="12"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
              />
            </div>
            <Input
              label="Consultation Fee ($)"
              type="number"
              placeholder="150"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              required
            />
          </div>

          {/* Location Details Section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Clinic & Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none disabled:opacity-50"
                  value={formData.state}
                  onChange={handleStateChange}
                  disabled={isFetchingStates}
                >
                  <option value="">{isFetchingStates ? 'Loading...' : 'Select State'}</option>
                  {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  District <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    list="district-options"
                    placeholder={isFetchingDistricts ? 'Loading...' : 'Select/Search District'}
                    className="flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    disabled={!formData.state || isFetchingDistricts}
                  />
                  <datalist id="district-options">
                    {districtsList.map(district => <option key={district} value={district} />)}
                  </datalist>
                </div>
              </div>
            </div>
            <Input
              label="Full Clinic Address"
              placeholder="123 Medical Plaza, Suite 400"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          {/* Bio Section */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Professional Bio
            </label>
            <textarea
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm h-32"
              placeholder="Write a brief overview of the doctor's expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isUploading}
              className="w-full h-14 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {isUploading ? 'Uploading...' : (editingDoctor ? 'Save Core Profile Details' : 'Confirm & Add Doctor')}
            </Button>
          </div>

          {/* Availability & Time Slots Section */}
          {editingDoctor && (
            <div className="space-y-4 pt-4 border-t border-slate-100 mt-4">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <CalendarCheck size={14} /> Availability & Time Slots
              </h4>
              
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

              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time" type="time" value={slotFormData.startTime} onChange={e => setSlotFormData({...slotFormData, startTime: e.target.value})} />
                <Input label="End Time" type="time" value={slotFormData.endTime} onChange={e => setSlotFormData({...slotFormData, endTime: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Slot Duration (minutes)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    required
                    value={slotFormData.duration}
                    onChange={e => setSlotFormData({...slotFormData, duration: Number(e.target.value)})}
                    className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-sm"
                    placeholder="Custom duration..."
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <Input label="Break Start Time (Optional)" type="time" value={slotFormData.breakStart} onChange={e => setSlotFormData({...slotFormData, breakStart: e.target.value})} />
                <Input label="Break End Time (Optional)" type="time" value={slotFormData.breakEnd} onChange={e => setSlotFormData({...slotFormData, breakEnd: e.target.value})} />
              </div>

              {slotFormError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold">{slotFormError}</div>
              )}
              {slotSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold">{slotSuccessMsg}</div>
              )}

              <Button
                type="button"
                onClick={handleGenerateSlots}
                disabled={isGeneratingSlots || slotFormData.days.length === 0}
                className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingSlots ? <Loader2 size={20} className="animate-spin" /> : '👉 Generate Slots'}
              </Button>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <AlertCircle size={14} /> Mark Leave / Block Dates
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input label="Leave Start Date" type="date" value={leaveFormData.startDate} onChange={e => setLeaveFormData({...leaveFormData, startDate: e.target.value})} />
                  <Input label="Leave End Date" type="date" value={leaveFormData.endDate} onChange={e => setLeaveFormData({...leaveFormData, endDate: e.target.value})} />
                </div>
                
                <div className="mb-4">
                  <Input label="Reason (Optional)" placeholder="e.g., Sick leave, Vacation" value={leaveFormData.reason} onChange={e => setLeaveFormData({...leaveFormData, reason: e.target.value})} />
                </div>

                {leaveFormError && (
                  <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold">{leaveFormError}</div>
                )}
                {leaveSuccessMsg && (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold">{leaveSuccessMsg}</div>
                )}

                <Button
                  type="button"
                  onClick={handleApplyLeave}
                  disabled={isApplyingLeave || !leaveFormData.startDate || !leaveFormData.endDate}
                  className="w-full h-12 bg-amber-500 text-white font-bold rounded-xl shadow-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isApplyingLeave ? <Loader2 size={20} className="animate-spin" /> : '👉 Apply Leave'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="w-full h-14 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent">
              Close Window
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!doctorToDelete}
        onClose={() => setDoctorToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
            <Trash2 size={40} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Are you sure?</h3>
          <p className="text-slate-500 mt-2 font-medium">
            You are about to remove <span className="text-slate-900 font-bold">Dr. {doctorToDelete?.user?.name}</span> from the system. This action cannot be undone.
          </p>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => setDoctorToDelete(null)} className="flex-1 h-14 rounded-2xl font-bold">Keep Doctor</Button>
            <Button
              onClick={handleDeleteDoctor}
              disabled={isDeleting}
              className="flex-1 h-14 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : 'Yes, Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewingDoctor}
        onClose={() => setViewingDoctor(null)}
        title="Doctor Profile Details"
        size="lg"
      >
        {viewingDoctor && (
          <div className="space-y-8 py-2">
            {/* Header / Profile Info */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-3xl font-black text-blue-600 mb-4 border border-slate-100 overflow-hidden">
                {viewingDoctor.user?.avatar ? (
                  <img src={getFullImageUrl(viewingDoctor.user.avatar)} className="w-full h-full object-cover" />
                ) : (
                  viewingDoctor.user?.name?.charAt(0)
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Dr. {viewingDoctor.user?.name}</h3>
              <p className="text-slate-500 font-medium">{viewingDoctor.user?.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-amber-50 text-amber-600 border-amber-100">
                  <Stethoscope size={14} />
                  {viewingDoctor.specialty}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black border border-blue-100 uppercase tracking-wider">
                  {viewingDoctor.experience} Years Exp.
                </span>
                <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black border border-emerald-100 uppercase tracking-wider">
                  ${viewingDoctor.consultationFee} Fee
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="md:col-span-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                    <Phone size={16} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p>
                      <p className="text-sm font-bold text-slate-900">{viewingDoctor.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                    <CalendarCheck size={16} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Gender / DOB</p>
                      <p className="text-sm font-bold text-slate-900 capitalize">
                        {viewingDoctor.user?.gender || 'N/A'} • {viewingDoctor.user?.dob ? new Date(viewingDoctor.user.dob).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="md:col-span-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2 ml-1">Professional Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                    <Shield size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">License Number</p>
                      <p className="text-sm font-bold text-slate-900">{viewingDoctor.licenseNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                    <Award size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Medical Council</p>
                      <p className="text-sm font-bold text-slate-900">{viewingDoctor.medicalCouncil || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2 ml-1">Specialization & Education</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Qualification</p>
                      <p className="text-sm font-bold text-slate-900">{viewingDoctor.qualifications?.join(', ') || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Sub-specialization</p>
                      <p className="text-sm font-bold text-slate-900">{viewingDoctor.subSpecialization || 'None'}</p>
                    </div>
                 </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2 ml-1">Clinic Address</h4>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                  <MapPin size={16} className="text-red-500" />
                  <p className="text-sm font-bold text-slate-900">
                    {viewingDoctor.address || 'N/A'}{viewingDoctor.district ? `, ${viewingDoctor.district}` : ''}{viewingDoctor.state ? `, ${viewingDoctor.state}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* About / Bio */}
            {viewingDoctor.bio && (
              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Briefcase size={14} /> Professional Biography
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {viewingDoctor.bio}
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button onClick={() => setViewingDoctor(null)} className="w-full h-14 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
