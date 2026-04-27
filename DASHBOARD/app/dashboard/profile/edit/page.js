"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Camera,
  Loader2,
  AlertCircle,
  Home,
  CheckCircle2,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doctorsApi, clinicsApi } from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function EditProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  
  const [doctorData, setDoctorData] = useState({
    specialty: '',
    experience: '',
    licenseNumber: '',
    consultationFee: '',
    clinic: '',
  });

  const [clinics, setClinics] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clinicsRes = await clinicsApi.getAll();
        setClinics(clinicsRes.data.clinics || []);

        if (user?.role === 'doctor') {
          const profileRes = await doctorsApi.getMe();
          const doc = profileRes.data.doctor;
          setDoctorData({
            specialty: doc.specialty || '',
            experience: doc.experience?.toString() || '',
            licenseNumber: doc.licenseNumber || '',
            consultationFee: doc.consultationFee?.toString() || '',
            clinic: doc.clinic?._id || '',
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append('image', file);
      const res = await doctorsApi.upload(data);
      setFormData({ ...formData, avatar: res.data.url });
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      
      const payload = {
        userData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
        },
      };

      if (user?.role === 'doctor') {
        payload.profileData = {
          specialty: doctorData.specialty,
          experience: Number(doctorData.experience),
          licenseNumber: doctorData.licenseNumber,
          consultationFee: Number(doctorData.consultationFee),
          clinic: doctorData.clinic || undefined,
        };
      }

      // We need an endpoint to update current doctor profile
      // I'll assume doctorsApi.update works if we have the doctor ID
      // Or I can use a generic "update my profile" endpoint
      
      const meRes = await doctorsApi.getMe();
      const docId = meRes.data.doctor._id;
      await doctorsApi.update(docId, payload);

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard/profile';
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard/profile"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Profile</h1>
          <div className="w-24"></div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Edit */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100 text-center sticky top-8">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="w-full h-full rounded-3xl bg-blue-50 flex items-center justify-center text-4xl font-extrabold text-blue-600 overflow-hidden border-4 border-white shadow-xl shadow-blue-100">
                  {formData.avatar ? (
                    <img src={getFullImageUrl(formData.avatar)} className="w-full h-full object-cover" />
                  ) : (
                    formData.name?.charAt(0).toUpperCase() || '?'
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 hover:scale-110 transition-transform cursor-pointer">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">Profile Photo</p>
              <p className="text-xs text-slate-500">Click camera icon to change.</p>
            </div>
          </div>

          {/* Details Edit */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {user?.role === 'doctor' && (
              <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Home size={20} className="text-emerald-500" /> Professional & Clinic Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Specialization</label>
                    <input 
                      type="text" 
                      value={doctorData.specialty}
                      onChange={(e) => setDoctorData({...doctorData, specialty: e.target.value})}
                      className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Experience (Years)</label>
                    <input 
                      type="number" 
                      value={doctorData.experience}
                      onChange={(e) => setDoctorData({...doctorData, experience: e.target.value})}
                      className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">License Number</label>
                    <input 
                      type="text" 
                      value={doctorData.licenseNumber}
                      onChange={(e) => setDoctorData({...doctorData, licenseNumber: e.target.value})}
                      className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Consultation Fee ($)</label>
                    <input 
                      type="number" 
                      value={doctorData.consultationFee}
                      onChange={(e) => setDoctorData({...doctorData, consultationFee: e.target.value})}
                      className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                       Primary Clinic <span className="text-slate-400 font-medium">(Search and select)</span>
                    </label>
                    <div className="relative group">
                      <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                      <select 
                        value={doctorData.clinic}
                        onChange={(e) => setDoctorData({...doctorData, clinic: e.target.value})}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-600 transition-all outline-none font-medium appearance-none"
                      >
                        <option value="">Select a Clinic</option>
                        {clinics.map(c => (
                          <option key={c._id} value={c._id}>{c.name} - {c.address}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Changes saved successfully! Redirecting...
              </motion.div>
            )}

            <div className="flex gap-4">
              <Link 
                href="/dashboard/profile"
                className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all flex items-center justify-center text-sm"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-[2] h-14 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

