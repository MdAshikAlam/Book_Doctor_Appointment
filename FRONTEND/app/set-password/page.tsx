'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function SetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Password Validation Checks
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password !== '' && password === confirmPassword;

  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;
  const isFormValid = isPasswordValid && passwordsMatch;

  useEffect(() => {
    if (!email) {
      setStatus({ type: 'error', message: 'Account not found. Please complete your registration.' });
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', message: 'Account not found. Please register.' });
      return;
    }
    if (!isFormValid) {
      setStatus({ type: 'error', message: 'Please set a valid password.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setStatus({ type: 'success', message: 'Password set successfully! Logging you in...' });
        
        // Refresh page/context to register session and redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to set password. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Connection error. Please check your internet.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set Your Password</h2>
        <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-widest">
          Secure your premium medical directory account
        </p>
        {email && (
          <p className="text-xs text-primary font-bold mt-2 bg-slate-50 py-1.5 px-3 rounded-full inline-block">
            {email}
          </p>
        )}
      </div>

      {status.type && (
        <div className={`mb-4 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {email ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Password *</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-10 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Confirm Password *</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-10 transition-all outline-none text-slate-800 placeholder-slate-400 font-bold text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Guidelines */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Use 8+ characters, including A–Z, a–z, 0–9, and special character.
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Min. 8 chars with uppercase, lowercase, number & special character.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-primary hover:bg-[#009A9A] text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-primary/10 disabled:bg-slate-350 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none mt-4 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Set Password & Continue'}
          </button>
        </form>
      ) : (
        <div className="text-center py-6">
          <Link href="/register" className="text-primary hover:underline font-black text-sm inline-flex items-center gap-1">
            Go to Registration Page <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="text-center font-bold text-slate-500">Loading Set Password Form...</div>
      }>
        <SetPasswordFormContent />
      </Suspense>
    </div>
  );
}
