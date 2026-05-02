"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Upload, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi, doctorsApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    governmentIdType: 'Aadhar',
    governmentIdNumber: '',
    idProofDocument: '',
    clinicName: '',
    city: '',
    state: ''
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append('image', file);
      const res = await doctorsApi.upload(data);
      setFormData({ ...formData, idProofDocument: res.data.url });
    } catch (err) {
      setError('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.registerAdmin(formData);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 5000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-12 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Registration Successful!</h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-8">
            Your application to become a Clinic Administrator has been received. 
            <span className="block font-bold text-slate-900 mt-2">Status: PENDING APPROVAL</span>
          </p>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left mb-8">
            <p className="text-sm text-slate-600 italic">
              "Our team will review your identity verification documents and clinic details. 
              You will be able to log in once your account is approved."
            </p>
          </div>
          <p className="text-sm text-slate-400">Redirecting to login page in 5 seconds...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm mb-8 group">
          <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} />
          Back to Login
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Sidebar Info */}
            <div className="bg-blue-600 p-8 lg:p-12 text-white flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8">
                  <Stethoscope size={32} />
                </div>
                <h2 className="text-3xl font-black mb-6 leading-tight">Join as a Clinic Administrator</h2>
                <p className="text-blue-100 leading-relaxed font-medium">
                  Register your branch and manage doctors, receptionists, and appointments with ease.
                </p>
              </div>

              <div className="space-y-6 mt-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-sm font-bold">Secure Verification</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <p className="text-sm font-bold">Multi-Branch Support</p>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2 p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Basic Information */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Full Name</label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          placeholder="John Doe"
                          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Email Address</label>
                      <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="email" required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="john@example.com"
                          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Password</label>
                      <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="password" required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Phone Number</label>
                      <div className="relative group">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="tel" required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          placeholder="+91 98765 43210"
                          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Identity Verification */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Identity Verification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">ID Type</label>
                      <select 
                        value={formData.governmentIdType}
                        onChange={(e) => setFormData({...formData, governmentIdType: e.target.value})}
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-bold"
                      >
                        <option value="Aadhar">Aadhar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="Passport">Passport</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">ID Number</label>
                      <input 
                        type="text" required
                        value={formData.governmentIdNumber}
                        onChange={(e) => setFormData({...formData, governmentIdNumber: e.target.value})}
                        placeholder="Enter ID Number"
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase mb-2 block">Upload ID Proof (PDF/Image)</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          onChange={handleFileUpload}
                          className="hidden" 
                          id="id-upload"
                          accept=".pdf,image/*"
                        />
                        <label 
                          htmlFor="id-upload"
                          className={`flex items-center justify-center gap-3 w-full h-24 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${formData.idProofDocument ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-blue-300'}`}
                        >
                          {isUploading ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : formData.idProofDocument ? (
                            <>
                              <CheckCircle2 size={24} />
                              <span className="font-bold">Document Uploaded Successfully</span>
                            </>
                          ) : (
                            <>
                              <Upload size={24} />
                              <span className="font-bold text-sm">Click to upload your ID document</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Clinic Intent */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Clinic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Proposed Clinic Name</label>
                      <div className="relative group">
                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" required
                          value={formData.clinicName}
                          onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                          placeholder="e.g. City Health Care"
                          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">City</label>
                      <input 
                        type="text" required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Noida"
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase">State</label>
                      <input 
                        type="text" required
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="Uttar Pradesh"
                        className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium"
                  >
                    <AlertCircle size={18} />
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full h-14 bg-blue-600 text-white font-black text-lg rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 font-medium leading-relaxed">
                  By submitting this application, you agree to our Terms of Service and Privacy Policy. 
                  Your data will be used solely for identity verification and clinic registration purposes.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
