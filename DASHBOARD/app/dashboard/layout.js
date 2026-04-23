"use client"

import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/common/Loader";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Client-side guard as backup to Middleware
    if (!loading && (!user || !user.email)) {
      router.push('/');
    }
  }, [user, loading, router]);

  // If loading, show full-screen loader
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  // If not properly authenticated, show redirecting state
  if (!user || !user.email) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64 transition-all duration-300">
        <Navbar />
        <main className="p-6 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
