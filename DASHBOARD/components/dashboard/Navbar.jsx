"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, Menu, LogOut, User, Settings as SettingsIcon, HelpCircle, Stethoscope } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from '@/context/AuthContext';
import BranchSelector from './BranchSelector';
import { analyticsApi } from '@/lib/api';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = ({ onMenuClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({});

  const fetchNotifications = async () => {
    try {
      const response = await analyticsApi.getNotifications();
      setNotifications(response.data || {});
    } catch (err) {
      console.error('Failed to fetch notifications in Navbar:', err);
    }
  };

  useEffect(() => {
    if (user?.role && ['super_admin', 'admin', 'receptionist', 'doctor'].includes(user.role)) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const hasNewNotifications = Object.values(notifications).some(n => n && n.new > 0);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-border px-4 md:px-6">
      <div className="h-full flex items-center justify-between">
        {/* Mobile menu trigger */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors mr-2"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search appointments, patients..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Branch Switcher */}
          <BranchSelector />

          {/* Notifications */}
          <Link href="/dashboard/notifications" className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
            <Bell size={20} />
            {hasNewNotifications && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </Link>

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-border mx-2"></div>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-sm">
                {getInitials(user?.name)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 capitalize">{user?.role || 'User'}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-border py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-border mb-1">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link href="/dashboard/profile" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                    <User size={16} /> View Profile
                  </Link>
                  <Link href="/dashboard/profile/edit" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                    <SettingsIcon size={16} /> Edit Profile
                  </Link>
                  <Link href="/" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                    <HelpCircle size={16} /> Help Center
                  </Link>
                  
                  <div className="h-px bg-border my-1"></div>
                  
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
