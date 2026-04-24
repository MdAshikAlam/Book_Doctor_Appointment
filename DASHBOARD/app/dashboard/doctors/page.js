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
  Shield
} from 'lucide-react';
import { usersApi, doctorsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'sub_admin';
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    password: '',
    specialty: '',
    experience: '',
    consultationFee: '',
    bio: '',
    address: '',
    city: '',
    country: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [countriesList, setCountriesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [isFetchingCountries, setIsFetchingCountries] = useState(false);
  const [isFetchingCities, setIsFetchingCities] = useState(false);

  const fetchCountries = async () => {
    try {
      setIsFetchingCountries(true);
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
      const result = await res.json();
      if (!result.error) {
        setCountriesList(result.data.map(c => c.name).sort());
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    } finally {
      setIsFetchingCountries(false);
    }
  };

  const fetchCities = async (countryName) => {
    if (!countryName) return;
    try {
      setIsFetchingCities(true);
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName }),
      });
      const result = await res.json();
      if (!result.error) {
        setCitiesList(result.data.sort());
      } else {
        setCitiesList([]);
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      setCitiesList([]);
    } finally {
      setIsFetchingCities(false);
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setFormData({
      ...formData,
      country: country,
      city: '' // Clear city when country changes
    });
    setCitiesList([]);
    if (country) {
      fetchCities(country);
    }
  };

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await doctorsApi.getAll({ dashboard: true });
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchCountries();
  }, [fetchDoctors]);

  // When editing, fetch cities for the initial country
  useEffect(() => {
    if (editingDoctor && formData.country) {
      fetchCities(formData.country);
    }
  }, [editingDoctor]);

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '', email: '', avatar: '', password: '', specialty: '', 
      experience: '', consultationFee: '', bio: '', 
      address: '', city: '', country: ''
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
      specialty: doc.specialty || '',
      experience: doc.experience?.toString() || '',
      consultationFee: doc.consultationFee?.toString() || '',
      bio: doc.bio || '',
      address: doc.address || '',
      city: doc.city || '',
      country: doc.country || '',
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
          },
          profileData: {
            specialty: formData.specialty,
            experience: Number(formData.experience),
            consultationFee: Number(formData.consultationFee),
            bio: formData.bio,
            address: formData.address,
            city: formData.city,
            country: formData.country,
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
          },
          profileData: {
            specialty: formData.specialty,
            experience: Number(formData.experience),
            consultationFee: Number(formData.consultationFee),
            bio: formData.bio,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            qualifications: ["MBBS", "MD"]
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
          <Button 
            onClick={handleOpenAddModal}
            className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Add New Doctor
          </Button>
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
                            doc.user?.name?.split(' ').map(n=>n[0]).join('')
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
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              placeholder="Dr. Julian Casablancas"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="julian@hospital.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Specialty" 
              placeholder="Cardiology"
              value={formData.specialty}
              onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              required 
            />
            <Input 
              label="Experience (Years)" 
              type="number" 
              placeholder="12"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Consultation Fee ($)" 
              type="number" 
              placeholder="150"
              value={formData.consultationFee}
              onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
              required 
            />
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {previewUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1">
                  <div className="w-full h-11 px-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
                    <Plus size={16} /> {selectedFile ? selectedFile.name : 'Choose DP'}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select 
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium appearance-none disabled:opacity-50"
                value={formData.country}
                onChange={handleCountryChange}
                disabled={isFetchingCountries}
              >
                <option value="">{isFetchingCountries ? 'Loading countries...' : 'Select Country'}</option>
                {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  list="city-options"
                  placeholder={isFetchingCities ? 'Loading cities...' : 'Select or Search City'}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium disabled:opacity-50"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={!formData.country || isFetchingCities}
                />
                <datalist id="city-options">
                  {citiesList.map(city => <option key={city} value={city} />)}
                </datalist>
                {isFetchingCities && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Input 
            label="Full Address" 
            placeholder="123 Medical Plaza, Suite 400"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />

          <div className="grid grid-cols-1 gap-4">
            <Input 
              label={editingDoctor ? "Password (leave blank to keep current)" : "Password"}
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required={!editingDoctor}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Professional Bio
            </label>
            <textarea 
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium h-32"
              placeholder="Write a brief overview of the doctor's expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            ></textarea>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              type="submit" 
              disabled={isUploading}
              className="flex-[2] h-12 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {isUploading ? 'Uploading...' : (editingDoctor ? 'Update Doctor' : 'Confirm & Add Doctor')}
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

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users size={16} className="text-slate-300" /> {viewingDoctor.user?.name}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Mail size={16} className="text-slate-300" /> {viewingDoctor.user?.email}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Joined</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck size={16} className="text-slate-300" /> {new Date(viewingDoctor.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign size={16} className="text-slate-300" /> ${viewingDoctor.consultationFee}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic Address</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-300" /> {viewingDoctor.address || 'N/A'}{viewingDoctor.city ? `, ${viewingDoctor.city}` : ''}{viewingDoctor.country ? `, ${viewingDoctor.country}` : ''}
                </p>
              </div>
            </div>

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
