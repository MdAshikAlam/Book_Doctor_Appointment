'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { X } from 'lucide-react';
import { Suspense } from 'react';

export default function LoginModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Glassmorphism Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => router.back()}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 sm:p-10 animate-in zoom-in-95 fade-in duration-300">
        <button 
          onClick={() => router.back()}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        
        <Suspense fallback={<div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#00B5B5] animate-spin mx-auto" />}>
          <LoginForm isModal onClose={() => router.back()} />
        </Suspense>
      </div>
    </div>
  );
}
