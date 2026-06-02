"use client"

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, Mail, User, Lock, AlertCircle, ArrowRight, Loader2, ShieldCheck, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/common/Modal';

export default function RegisterPage() {
  const router = useRouter();
  const { googleLogin, user, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpCode, setOtpCode] = useState(Array(6).fill(''));
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(300);

  const otpRefs = useRef([]);

  // Google OAuth states
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    let timer;
    if (otpSent && otpTimer > 0 && !emailVerified) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, otpTimer, emailVerified]);

  const [googleClientAvailable, setGoogleClientAvailable] = useState(false);

  useEffect(() => {
    if (document.getElementById('google-gsi-client')) {
      initializeGoogleGSI();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeGoogleGSI();
    };
  }, []);

  const initializeGoogleGSI = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && window.google) {
      setGoogleClientAvailable(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });
      setTimeout(() => {
        const btnContainer = document.getElementById('google-signin-btn-dashboard-register');
        if (btnContainer && window.google) {
          const parentWidth = btnContainer.clientWidth || btnContainer.parentElement?.clientWidth || 320;
          const targetWidth = Math.max(250, Math.min(380, parentWidth));
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', width: targetWidth, shape: 'pill' }
          );
        }
      }, 300);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setGoogleLoading(true);
      setError(null);
      const result = await googleLogin('', '', '', '', response.credential);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Google login failed.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during Google sign-up.');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSendOTP = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setOtpSending(true);
      setOtpError(null);
      setError(null);

      const res = await authApi.sendOtp(formData.email);

      if (res.status === 'success') {
        setOtpSent(true);
        setCooldown(30);
        setOtpTimer(300);
        setOtpSuccess('Verification code sent to your email!');
        setTimeout(() => setOtpSuccess(null), 4000);
      } else {
        setOtpError(res.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to connect to authentication server.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError(null);
      setOtpSuccess(null);

      const res = await authApi.verifyOtp(formData.email, fullOtp, formData.fullName);

      if (res.status === 'success') {
        setEmailVerified(true);
        setOtpSent(false);
        setOtpSuccess('OTP Verified Successfully!');
        setTimeout(() => setOtpSuccess(null), 3000);
      } else {
        setOtpError(res.message || 'Verification failed. Incorrect OTP.');
      }
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Connection error.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (value, idx) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpCode];
    newOtp[idx] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value !== '' && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && otpCode[idx] === '' && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
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

  const handleDirectGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const googleName = 'Google Admin';
      const googleEmail = `google_admin_${randomId}@gmail.com`;
      const googleId = `google_oauth_${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      const result = await googleLogin(googleEmail, googleName, googleId, `https://ui-avatars.com/api/?name=${encodeURIComponent(googleName)}&background=0284c7&color=fff`);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Google signup failed.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during Google sign-up.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!emailVerified) {
      setError('Please verify your email address first.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      };
      
      const res = await authApi.registerAdmin(payload);
      if (res.status === 'success') {
        window.location.href = '/dashboard';
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Get started as Clinic Admin</p>
            </div>

            {/* Google Signup Option */}
            {googleClientAvailable ? (
              <div id="google-signin-btn-dashboard-register" className="w-full flex justify-center mb-4 min-h-[44px]"></div>
            ) : (
              <button
                type="button"
                onClick={handleDirectGoogleSignup}
                disabled={googleLoading}
                className="w-full h-12 rounded-2xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 font-black text-[11px] uppercase tracking-widest text-slate-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin text-slate-500" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.96 3.07C6.4 7.69 8.97 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.28-2.1 3.54-5.2 3.54-8.71z" />
                      <path fill="#FBBC05" d="M5.46 10.57c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.5 2.88C.54 4.8 0 6.97 0 9.27s.54 4.47 1.5 6.39l3.96-3.09z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.98c-1.08.73-2.48 1.17-4.05 1.17-3.03 0-5.6-2.65-6.54-5.53L1.5 15.82C3.4 19.67 7.35 23 12 23z" />
                    </svg>
                    Continue with Google (Demo Mock)
                  </>
                )}
              </button>
            )}

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-100"></div>
              <span className="mx-3 text-[9px] font-black text-slate-350 uppercase tracking-[0.2em]">OR</span>
              <div className="flex-1 border-t border-slate-100"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" 
                    required
                    disabled={emailVerified}
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full h-11 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-bold text-sm disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group flex items-center">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="email" 
                    required
                    disabled={emailVerified}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full h-11 pl-12 pr-24 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-bold text-sm disabled:opacity-60"
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSending || cooldown > 0 || !formData.email}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:bg-slate-200 disabled:text-slate-450 active:scale-[0.98]"
                    >
                      {otpSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : cooldown > 0 ? `${cooldown}s` : 'Send'}
                    </button>
                  )}
                </div>
                {emailVerified && (
                  <p className="text-[10px] font-black text-emerald-600 ml-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Email Verified Successfully!
                  </p>
                )}
              </div>

              {/* OTP Code Input box */}
              {otpSent && !emailVerified && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="text-center">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Verify Email OTP</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                      Enter the code. {otpTimer > 0 ? `(Expires in ${Math.floor(otpTimer / 60)}:${otpTimer % 60 < 10 ? '0' : ''}${otpTimer % 60})` : <span className="text-rose-500 font-bold">(Expired)</span>}
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        disabled={otpTimer === 0}
                        className="w-10 h-11 bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-center font-black text-lg outline-none transition-all shadow-sm"
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-[10px] font-black text-rose-500 text-center flex items-center justify-center gap-1">
                      <AlertCircle size={12} /> {otpError}
                    </p>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={verifyingOtp || otpTimer === 0}
                    className="w-full h-10 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              )}

              {/* Password Fields - Only visible after email verified */}
              {emailVerified && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full h-11 pl-12 pr-10 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-bold text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full h-11 pl-12 pr-10 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-900 font-bold text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status / Success Messages */}
              {otpSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {otpSuccess}
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-600 text-xs font-bold animate-in fade-in"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting || !emailVerified}
                className="w-full h-12 bg-slate-900 hover:bg-slate-950 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-6 shadow-lg shadow-slate-900/10"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-xs font-bold">
              Already have an account? <Link href="/" className="text-blue-600 font-black hover:underline ml-1">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Google Sign-in Mock Modal */}
      <Modal
        isOpen={showGoogleMock}
        onClose={() => setShowGoogleMock(false)}
        title="Sign up with Google"
        size="md"
      >
        <div className="space-y-5 py-2">
          <p className="text-xs text-slate-500 font-medium">Link your Google Identity to register instantly as a Clinic Admin.</p>
          
          <form onSubmit={handleGoogleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
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
              {googleLoading ? <Loader2 className="animate-spin" /> : 'Confirm Google Sign-Up'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
