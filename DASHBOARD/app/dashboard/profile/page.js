"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Edit3, 
  Settings as SettingsIcon, 
  Lock,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  Camera,
  Home,
  Users as UsersIcon,
  Stethoscope,
  MapPin,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doctorsApi } from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDoctorProfile = useCallback(async () => {
    if (user?.role !== 'doctor') return;
    try {
      setLoading(true);
      const res = await doctorsApi.getMe();
      if (res.status === 'success') {
        setDoctorProfile(res.data.doctor);
        
        // Fetch other doctors in the same clinic
        if (res.data.doctor.clinic) {
          const clinicId = res.data.doctor.clinic._id;
          const doctorsRes = await doctorsApi.getAll();
          if (doctorsRes.status === 'success') {
            const others = doctorsRes.data.doctors.filter(d => 
              d.clinic?._id === clinicId && d._id !== res.data.doctor._id
            );
            setClinicDoctors(others);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDoctorProfile();
  }, [fetchDoctorProfile]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadRes = await doctorsApi.upload(formData);
      const newAvatarUrl = uploadRes.data.url;

      // Update user in context and local storage
      const updatedUser = { ...user, avatar: newAvatarUrl };
      // Assuming setUser is available in context (I should check)
      // If not, I'll update it manually
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload(); // Simple way to refresh state across components
      
    } catch (err) {
      alert('Failed to upload photo: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Header / Hero Section */}
        <section className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 to-blue-400 p-1 shadow-lg shadow-blue-100 transition-transform group-hover:scale-[1.02]">
                <div className="w-full h-full rounded-[1.4rem] bg-white flex items-center justify-center text-4xl font-extrabold text-blue-600 overflow-hidden">
                  {user?.avatar ? (
                    <img src={getFullImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name)
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 cursor-pointer hover:scale-110 transition-transform">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                  {user?.role} Account
                </span>
              </div>
              <p className="text-slate-500 font-medium max-w-lg">
                {doctorProfile?.specialty ? `${doctorProfile.specialty} • ` : ''}
                Manage your personal information and professional credentials.
              </p>
              {doctorProfile?.clinic && (
                 <div className="mt-4 flex items-center gap-2 text-slate-600 font-bold bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100">
                    <Home size={18} className="text-blue-500" />
                    <span>{doctorProfile.clinic.name}</span>
                 </div>
              )}
            </div>

            <Link 
              href="/dashboard/profile/edit"
              className="px-6 h-12 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <SettingsIcon size={18} /> Edit Profile
            </Link>
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <User className="text-blue-600" size={24} />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Full Name</p>
                  <p className="text-slate-900 font-bold">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="text-slate-900 font-bold">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                  <p className="text-slate-900 font-bold">{user?.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Member Since</p>
                  <p className="text-slate-900 font-bold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Doctor Specific Info */}
            {user?.role === 'doctor' && doctorProfile && (
              <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <Stethoscope className="text-blue-600" size={24} />
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Specialization</p>
                    <p className="text-slate-900 font-bold">{doctorProfile.specialty}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Experience</p>
                    <p className="text-slate-900 font-bold">{doctorProfile.experience} Years</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">License Number</p>
                    <p className="text-slate-900 font-bold">{doctorProfile.licenseNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Consultation Fee</p>
                    <p className="text-slate-900 font-bold text-blue-600">${doctorProfile.consultationFee}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* My Clinic & Colleagues (The requested section) */}
            {user?.role === 'doctor' && doctorProfile?.clinic && (
              <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Home className="text-emerald-500" size={24} />
                    My Clinic
                  </h2>
                  <Link href={`/dashboard/clinics/${doctorProfile.clinic._id}`} className="text-xs font-bold text-blue-600 hover:underline">View Clinic Page</Link>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-emerald-900 text-lg">{doctorProfile.clinic.name}</h3>
                      <p className="text-sm text-emerald-700 font-medium">
                        {doctorProfile.clinic.address}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UsersIcon size={16} /> Medical Colleagues ({clinicDoctors.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clinicDoctors.length > 0 ? clinicDoctors.map((doc) => (
                    <div key={doc._id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-slate-200">
                        {doc.user?.avatar ? (
                          <img src={getFullImageUrl(doc.user.avatar)} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(doc.user?.name)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Dr. {doc.user?.name}</p>
                        <p className="text-xs font-medium text-slate-500">{doc.specialty}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 font-medium col-span-2 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      You are currently the only doctor registered at this clinic.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Account Security Card */}
            <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Lock className="text-blue-400" size={24} />
                Security
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10 text-white">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">Two-Factor Auth</p>
                      <p className="text-sm font-bold">Enabled</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10 text-white">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">Last Login</p>
                      <p className="text-sm font-bold">2 mins ago</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>
                <button className="w-full h-12 mt-4 rounded-xl bg-blue-600 font-bold hover:bg-blue-700 transition-all text-sm">
                  Change Password
                </button>
              </div>
            </motion.div>

            {/* Support Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Need Help?</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Our support team is available 24/7 to help you with any issues regarding your account or permissions.
              </p>
              <button className="w-full h-12 rounded-xl border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all text-sm">
                Contact Support
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

