"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Stethoscope, Mail, Lock, AlertCircle, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, googleLogin, error, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login({ email, password });
    setIsSubmitting(false);
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail || !googleName) {
      setGoogleError('Please fill out all fields.');
      return;
    }
    try {
      setGoogleLoading(true);
      setGoogleError('');
      const googleId = `google_oauth_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const result = await googleLogin(googleEmail, googleName, googleId, `https://ui-avatars.com/api/?name=${encodeURIComponent(googleName)}&background=0284c7&color=fff`);
      if (result.success) {
        setShowGoogleMock(false);
        router.push('/dashboard');
      } else {
        setGoogleError(result.error || 'Google Login failed.');
      }
    } catch (err) {
      setGoogleError(err.message || 'An error occurred during Google sign-in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickGoogleSelect = async (selectedEmail, selectedName) => {
    try {
      setGoogleLoading(true);
      setGoogleError('');
      const googleId = `google_oauth_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const result = await googleLogin(selectedEmail, selectedName, googleId, `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedName)}&background=0284c7&color=fff`);
      if (result.success) {
        setShowGoogleMock(false);
        router.push('/dashboard');
      } else {
        setGoogleError(result.error || 'Google Login failed.');
      }
    } catch (err) {
      setGoogleError(err.message || 'An error occurred during Google sign-in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative backdrop-blur-md">
          {/* Top colored line indicator */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
          
          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Stethoscope size={28} />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">BookMyDoctor</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">SaaS Administrator Hub</p>
            </div>

            {/* Google Authentication Method */}
            <button
              type="button"
              onClick={() => setShowGoogleMock(true)}
              className="w-full h-12 rounded-2xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 font-black text-[11px] uppercase tracking-widest text-slate-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.96 3.07C6.4 7.69 8.97 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.28-2.1 3.54-5.2 3.54-8.71z" />
                <path fill="#FBBC05" d="M5.46 10.57c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.5 2.88C.54 4.8 0 6.97 0 9.27s.54 4.47 1.5 6.39l3.96-3.09z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.98c-1.08.73-2.48 1.17-4.05 1.17-3.03 0-5.6-2.65-6.54-5.53L1.5 15.82C3.4 19.67 7.35 23 12 23z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-100"></div>
              <span className="mx-3 text-[9px] font-black text-slate-350 uppercase tracking-[0.2em]">OR</span>
              <div className="flex-1 border-t border-slate-100"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bookmydoctor.com"
                    className="w-full h-11 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-12 pr-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-bold text-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-600 text-xs font-bold"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-slate-900 hover:bg-slate-950 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-6 shadow-lg shadow-slate-900/10"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-xs font-bold">
              Don't have an account? <Link href="/register" className="text-blue-600 font-black hover:underline ml-1">Register as Admin</Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modern Mock Google Consent / Account Picker Modal */}
      <Modal
        isOpen={showGoogleMock}
        onClose={() => setShowGoogleMock(false)}
        title="Sign in with Google"
        size="md"
      >
        <div className="space-y-6 py-2">
          <p className="text-xs text-slate-500 font-medium">Choose an account to continue to BookMyDoctor Portal</p>
          
          <div className="space-y-2">
            {/* Quick selectors for mock google */}
            <button
              onClick={() => handleQuickGoogleSelect('admin@bookmydoctor.com', 'Super Admin')}
              disabled={googleLoading}
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-left transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">SA</div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-900">Super Admin (Pre-seeded)</p>
                <p className="text-xs text-slate-400">admin@bookmydoctor.com</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleQuickGoogleSelect('clinicadmin_demo@gmail.com', 'Demo Clinic Admin')}
              disabled={googleLoading}
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-left transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">CA</div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-900">Demo Clinic Admin</p>
                <p className="text-xs text-slate-400">clinicadmin_demo@gmail.com</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="mx-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Use Custom Email</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleGoogleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Display Name</label>
              <input 
                type="text"
                placeholder="Google User Name"
                required
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 transition-all outline-none font-bold text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Email Address</label>
              <input 
                type="email"
                placeholder="user@gmail.com"
                required
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 transition-all outline-none font-bold text-sm"
              />
            </div>

            {googleError && (
              <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 ml-1">
                <AlertCircle size={14} /> {googleError}
              </p>
            )}

            <button
              type="submit"
              disabled={googleLoading}
              className="w-full h-11 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {googleLoading ? <Loader2 className="animate-spin" /> : 'Confirm OAuth Link & Sign In'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
