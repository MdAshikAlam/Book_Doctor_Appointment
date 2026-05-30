'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await login(formData.identifier, formData.password);

      if (result.success) {
        setStatus({ type: 'success', message: 'Logged in successfully!' });
        if (onClose) {
          setTimeout(onClose, 1500);
        } else {
          window.location.href = redirect || '/';
        }
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

  return (
    <div className={`w-full max-w-md ${isModal ? '' : 'mx-auto my-12 p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100'}`}>
      <div className="text-center mb-6">
        <h2 className="font-h2 text-slate-900 tracking-tight">Sign In</h2>
        <p className="text-gray-500 mt-2 font-medium">Please Login To Continue</p>
      </div>

      {status.type && (
        <div className={`mb-4 p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 ml-1">Email or Phone Number *</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              required
              placeholder="Enter email or phone number"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 rounded-2xl py-2.5 pl-11 pr-4 transition-all outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 ml-1">Password *</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              placeholder="Enter your password"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 rounded-2xl py-2.5 pl-11 pr-4 transition-all outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.identifier || !formData.password}
          className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none translate-y-0 hover:-translate-y-0.5"
        >
          {loading ? 'Processing...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 font-medium">
          Not Registered?{' '}
          <Link href="/register" className="text-primary hover:underline font-bold transition-all ml-1 inline-flex items-center group">
            Register Now
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </div>
    </div>
  );
}
