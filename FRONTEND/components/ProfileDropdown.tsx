'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Settings, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 hover:text-primary transition-all shadow-sm"
        aria-label="Profile menu"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3 text-gray-400" />
                Show Profile
              </Link>
              <Link
                href="/profile/edit"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-3 text-gray-400" />
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-2 mb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
              </div>
              <Link
                href="/login"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="w-4 h-4 mr-3" />
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
