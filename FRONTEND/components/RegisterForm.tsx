'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await register(formData);

      if (result.success) {
        setStatus({ type: 'success', message: result.message || 'Account created! Please login.' });
        if (onClose) setTimeout(onClose, 2000);
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
    formData.phone && 
    formData.password && 
    formData.confirmPassword && 
    formData.password === formData.confirmPassword;

  return (
    <div className={`w-full max-w-lg ${isModal ? '' : 'mx-auto p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100'}`}>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sign Up</h2>
        <p className="text-gray-500 mt-2 font-medium">Please Sign Up To Continue</p>
      </div>

      {status.type && (
        <div className={`mb-4 p-4 rounded-2xl flex items-center space-x-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
          {status.type === 'success' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-1">Full Name *</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              required
              placeholder="Full name"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 rounded-2xl py-3 pl-12 pr-4 transition-all outline-none text-gray-800 placeholder-gray-400 font-medium"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Email *</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 rounded-2xl py-2.5 pl-11 pr-4 transition-all outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Phone Number *</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="tel"
                required
                placeholder="Phone number"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 rounded-2xl py-2.5 pl-11 pr-4 transition-all outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Password *</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 rounded-2xl py-2.5 pl-11 pr-4 transition-all outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 ml-1">Confirm Password *</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                placeholder="Confirm your password"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 rounded-2xl py-2.5 pl-11 pr-4 transition-all outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none translate-y-0 hover:-translate-y-0.5 mt-2"
        >
          {loading ? 'Processing...' : 'Register'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 font-medium">
          Already Registered?{' '}
          <Link href="/login" className="text-primary hover:underline font-bold transition-all ml-1 inline-flex items-center group">
            Login Now
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </div>
    </div>
  );
}
