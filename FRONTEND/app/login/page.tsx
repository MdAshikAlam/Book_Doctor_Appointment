import LoginForm from '@/components/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#0E7C66] animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
