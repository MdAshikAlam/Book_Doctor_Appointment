'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const { register, googleLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes (300 seconds)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && otpTimer > 0 && !emailVerified) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, otpTimer, emailVerified]);

  // Live Password Validation
  const hasMinLen = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
  const passwordsMatch = formData.password !== '' && formData.password === formData.confirmPassword;
  
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSendOTP = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setOtpSending(true);
      setOtpError(null);
      setStatus({ type: null, message: '' });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setOtpSent(true);
        setCooldown(30);
        setOtpTimer(300);
        setOtpSuccess('Verification code sent to your email!');
        setTimeout(() => setOtpSuccess(null), 4000);
      } else if (response.status === 428 || data.status === 'pending_password') {
        setStatus({ type: 'success', message: 'Email already verified. Redirecting to set password...' });
        setTimeout(() => {
          router.push(`/set-password?email=${encodeURIComponent(formData.email)}`);
        }, 1200);
      } else {
        setOtpError(data.message || 'Failed to send verification code.');
      }
    } catch (err) {
      console.error(err);
      setOtpError('Failed to connect to authentication server.');
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: fullOtp, fullName: formData.fullName }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setEmailVerified(true);
        setOtpSent(false);
        setOtpSuccess('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/set-password?email=${encodeURIComponent(formData.email)}`);
        }, 1000);
      } else {
        setOtpError(data.message || 'Verification failed. Incorrect OTP.');
      }
    } catch (err) {
      console.error(err);
      setOtpError('Verification failed. Connection error.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (value: string, idx: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpCode];
    newOtp[idx] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value !== '' && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && otpCode[idx] === '' && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const [googleClientAvailable, setGoogleClientAvailable] = useState(false);

  useEffect(() => {
    // Check if script is already injected
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
    if (clientId && (window as any).google) {
      setGoogleClientAvailable(true);
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });
      setTimeout(() => {
        const btnContainer = document.getElementById('google-signin-btn-register');
        if (btnContainer && (window as any).google) {
          const parentWidth = btnContainer.clientWidth || btnContainer.parentElement?.clientWidth || 320;
          const targetWidth = Math.max(250, Math.min(380, parentWidth));
          (window as any).google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', width: targetWidth, shape: 'pill' }
          );
        }
      }, 300);
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      setStatus({ type: null, message: '' });
      const result = await googleLogin('', '', '', '', response.credential);
      if (result.success) {
        setStatus({ type: 'success', message: 'Signed up with Google successfully! Redirecting...' });
        setTimeout(() => {
          if (onClose) onClose();
          router.push('/');
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.message || 'Google signup failed' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to sign up with Google' });
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setStatus({ type: 'error', message: 'Password does not meet validation criteria.' });
      return;
    }
    if (!passwordsMatch) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (!emailVerified) {
      setStatus({ type: 'error', message: 'Please verify your email address.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (result.success) {
        setStatus({ type: 'success', message: 'Account created successfully! Redirecting...' });
        setTimeout(() => {
          if (onClose) onClose();
          router.push('/login');
        }, 2000);
      } else {
        setStatus({ type: 'error', message: result.message || 'Registration failed' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.fullName && 
    formData.email && 
    emailVerified &&
    formData.phone && 
    isPasswordValid &&
    passwordsMatch;

  return (
    <div className={`w-full max-w-5xl ${isModal ? '' : 'mx-auto p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100'}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign Up</h2>
        <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-widest">Connect to premium medical directory</p>
      </div>

      {status.type && (
        <div className={`mb-4 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Google Signup Option */}
      <div id="google-signin-btn-register" className="w-full flex justify-center mb-4 min-h-[44px]"></div>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-slate-100"></div>
        <span className="mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
        <div className="flex-1 border-t border-slate-100"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Full Name *</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                required
                placeholder="e.g. Arundhati Sharma"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-4 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          {/* Email Address with Send OTP button nested inside */}
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Email Address *</label>
            <div className="relative group flex items-center">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                disabled={emailVerified}
                placeholder="e.g. user@example.com"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-28 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm disabled:opacity-75 disabled:bg-slate-100 disabled:text-slate-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpSending || cooldown > 0 || !formData.email}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-[#00B5B5] hover:bg-[#009A9A] text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] flex items-center justify-center shrink-0"
                >
                  {otpSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : cooldown > 0 ? `${cooldown}s` : 'Send'}
                </button>
              )}
            </div>
            {emailVerified && (
              <p className="text-[10px] font-black text-emerald-600 ml-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Email Verified
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Phone Number *</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="tel"
                required
                disabled={!emailVerified}
                placeholder={emailVerified ? "e.g. 9876543210" : "Verify email to unlock field"}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-4 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* OTP Input Grid (Spans Full Width when visible) */}
          {otpSent && !emailVerified && (() => {
            const formatTime = (seconds: number) => {
              const mins = Math.floor(seconds / 60);
              const secs = seconds % 60;
              return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            };

            return (
              <div className="col-span-1 md:col-span-3 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 animate-in fade-in slide-in-from-top-3 space-y-4">
                <div className="text-center">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Verify Email OTP</h4>
                  <p className="text-[10px] text-slate-450 mt-1 font-bold">
                    Enter 6-digit OTP code sent to your email. {otpTimer > 0 ? `(Expires in ${formatTime(otpTimer)})` : <span className="text-rose-500 font-bold">(Expired)</span>}
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
                      className="w-10 h-12 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-center font-black text-lg outline-none transition-all shadow-sm disabled:opacity-50"
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
                {otpSuccess && (
                  <p className="text-[10px] font-black text-emerald-600 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> {otpSuccess}
                  </p>
                )}
                {otpTimer === 0 && (
                  <p className="text-[10px] font-black text-rose-500 text-center flex items-center justify-center gap-1">
                    <AlertCircle size={12} /> OTP code has expired. Please click "Resend" to get a new code.
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={verifyingOtp || otpTimer === 0}
                    className="flex-1 h-10 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Password */}
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Password *</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={!emailVerified}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-10 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {emailVerified && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-450 mt-1 ml-1 font-semibold leading-normal">
              Use 8+ characters, including A–Z, a–z, 0–9, and special character.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Confirm Password *</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                disabled={!emailVerified}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-10 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {emailVerified && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Submit Button aligned horizontally next to Confirm Password */}
          <div className="col-span-1 flex flex-col justify-end">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full h-12 bg-primary hover:bg-[#009A9A] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/10 disabled:bg-slate-350 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500 font-bold text-xs">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-black ml-1 inline-flex items-center group">
            Login
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </div>
    </div>
  );
}
