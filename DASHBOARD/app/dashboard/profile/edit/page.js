"use client"

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Camera,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EditProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Mock simulation of API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess(true);
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="w-24"></div> {/* Spacer */}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Edit */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100 text-center">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="w-full h-full rounded-3xl bg-blue-50 flex items-center justify-center text-4xl font-extrabold text-blue-600">
                  {formData.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                  <Camera size={18} />
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">Profile Photo</p>
              <p className="text-xs text-slate-500">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          {/* Details Edit */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Changes saved successfully!
              </motion.div>
            )}

            <div className="flex gap-4">
              <Link 
                href="/dashboard/profile"
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all flex items-center justify-center text-sm"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-[2] h-12 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
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

function CheckCircle({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
