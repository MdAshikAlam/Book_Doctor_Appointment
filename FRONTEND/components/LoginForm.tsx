'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'forgot_otp' | 'reset_otp';

export default function LoginForm({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { login, googleLogin } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);

  // Standard Login Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Forgot / Reset Password Fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState<string[]>(Array(6).fill(''));
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  
  // Timer & Focus references for OTP
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Live Password Validation for Reset Password
  const hasMinLen = resetPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(resetPassword);
  const hasLower = /[a-z]/.test(resetPassword);
  const hasNumber = /[0-9]/.test(resetPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(resetPassword);
  const passwordsMatch = resetPassword !== '' && resetPassword === confirmResetPassword;
  
  const isResetPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  // Handle OTP focus shifts
  const handleOtpChange = (value: string, idx: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...resetOtpCode];
    newOtp[idx] = value;
    setResetOtpCode(newOtp);

    // Auto-focus next input
    if (value !== '' && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && resetOtpCode[idx] === '' && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setStatus({ type: null, message: '' });
      
      const mockProfile = {
        email: `google_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`,
        fullName: 'Google User',
        googleId: `google_id_${Math.floor(100000000 + Math.random() * 900000000)}`,
        profilePicture: 'https://ui-avatars.com/api/?name=Google+User&background=0284c7&color=fff'
      };

      const result = await googleLogin(
        mockProfile.email,
        mockProfile.fullName,
        mockProfile.googleId,
        mockProfile.profilePicture
      );

      if (result.success) {
        setStatus({ type: 'success', message: 'Logged in with Google successfully! Redirecting...' });
        setTimeout(() => {
          if (onClose) onClose();
          router.push(redirect || '/');
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.message || 'Google login failed' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to authenticate with Google' });
    } finally {
      setLoading(false);
    }
  };

  // Standard Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await login(identifier, password || 'placeholder-pass');

      if (result.success) {
        setStatus({ type: 'success', message: 'Logged in successfully! Redirecting...' });
        setTimeout(() => {
          if (onClose) onClose();
          router.push(redirect || '/');
        }, 1500);
      } else if ((result as any).status === 428 || (result.message && (result.message.includes('PASSWORD_NOT_SET') || result.message.includes('password to continue')))) {
        setStatus({ type: 'success', message: 'Account exists but password is not set. Redirecting to set password page...' });
        setTimeout(() => {
          if (onClose) onClose();
          router.push(`/set-password?email=${encodeURIComponent(identifier)}`);
        }, 1200);
      } else {
        setStatus({ type: 'error', message: result.message || 'Invalid credentials' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  // Send Forgot Password OTP
  const handleSendForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setStatus({ type: 'success', message: 'Verification OTP sent to your email.' });
        setCooldown(30);
        setMode('reset_otp');
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to send OTP.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Server communication error.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset Password using OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = resetOtpCode.join('');
    if (fullOtp.length < 6) {
      setStatus({ type: 'error', message: 'Please enter the complete 6-digit OTP.' });
      return;
    }
    if (!isResetPasswordValid) {
      setStatus({ type: 'error', message: 'Please ensure password requirements are fully met.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otp: fullOtp,
          password: resetPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setStatus({ type: 'success', message: 'Password reset successful! You are now logged in.' });
        // Set mode back or route correctly
        setTimeout(() => {
          if (onClose) onClose();
          router.push(redirect || '/');
        }, 1500);
      } else {
        setStatus({ type: 'error', message: data.message || 'Verification or password reset failed.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to reset password. Connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-lg ${isModal ? '' : 'mx-auto p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100'}`}>
      
      {/* HEADER SECTION */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' && 'Sign In'}
          {mode === 'forgot_otp' && 'Forgot Password'}
          {mode === 'reset_otp' && 'Reset Password'}
        </h2>
        <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-widest">
          {mode === 'login' && 'Connect to premium medical directory'}
          {mode === 'forgot_otp' && 'Get back into your account'}
          {mode === 'reset_otp' && 'Define your new login password'}
        </p>
      </div>

      {status.type && (
        <div className={`mb-4 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* 1. LOGIN MODE */}
      {mode === 'login' && (
        <>
          {/* Google Login Option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 font-black text-xs uppercase tracking-widest text-slate-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.96 3.07C6.4 7.69 8.97 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.28-2.1 3.54-5.2 3.54-8.71z" />
              <path fill="#FBBC05" d="M5.46 10.57c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.5 2.88C.54 4.8 0 6.97 0 9.27s.54 4.47 1.5 6.39l3.96-3.09z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.98c-1.08.73-2.48 1.17-4.05 1.17-3.03 0-5.6-2.65-6.54-5.53L1.5 15.82C3.4 19.67 7.35 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-100"></div>
            <span className="mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-slate-100"></div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Email or Phone Number *</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="e.g. user@example.com or 9876543210"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-4 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Password *</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot_otp'); setStatus({ type: null, message: '' }); }}
                  className="text-primary hover:underline text-[10px] font-black uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-10 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier || !password}
              className="w-full bg-primary hover:bg-[#009A9A] text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-primary/10 disabled:bg-slate-350 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none mt-6 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 font-bold text-xs">
              Not Registered?{' '}
              <Link href="/register" className="text-primary hover:underline font-black ml-1 inline-flex items-center group">
                Register Now
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </>
      )}

      {/* 2. FORGOT PASSWORD OTP SEND MODE */}
      {mode === 'forgot_otp' && (
        <form onSubmit={handleSendForgotPasswordOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Email Address *</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                placeholder="e.g. user@example.com"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-4 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setStatus({ type: null, message: '' }); }}
              className="flex-1 h-12 border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            <button
              type="submit"
              disabled={loading || !resetEmail}
              className="flex-[2] h-12 bg-primary hover:bg-[#009A9A] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-350"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        </form>
      )}

      {/* 3. RESET PASSWORD MODE (ENTER OTP & NEW PASSWORD) */}
      {mode === 'reset_otp' && (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          
          {/* OTP Box Entry */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="text-center">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Verify Reset OTP</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Sent to: {resetEmail}</p>
            </div>
            
            <div className="flex justify-center gap-2">
              {resetOtpCode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-center font-black text-lg outline-none transition-all shadow-sm"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                />
              ))}
            </div>

            {cooldown > 0 ? (
              <p className="text-[10px] text-slate-450 font-bold text-center">
                Resend cooldown: {cooldown}s
              </p>
            ) : (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendForgotPasswordOtp}
                  className="text-primary hover:underline text-[10px] font-black uppercase tracking-wider"
                >
                  Resend OTP Code
                </button>
              </div>
            )}
          </div>

          {/* New Passwords */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">New Password *</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showResetPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-10 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 transition-colors"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Confirm New Password *</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showConfirmResetPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-10 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                  value={confirmResetPassword}
                  onChange={(e) => setConfirmResetPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 transition-colors"
                >
                  {showConfirmResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 ml-1 font-medium leading-relaxed">
            Use 8+ characters, including A–Z, a–z, 0–9, and special character.
          </p>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => { setMode('forgot_otp'); setStatus({ type: null, message: '' }); }}
              className="flex-1 h-12 border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            <button
              type="submit"
              disabled={loading || !isResetPasswordValid || resetOtpCode.join('').length < 6}
              className="flex-[2] h-12 bg-primary hover:bg-[#009A9A] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-350"
            >
              {loading ? 'Processing...' : 'Reset & Login'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
