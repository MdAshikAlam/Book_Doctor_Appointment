'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ProfileDropdown from './ProfileDropdown';
import HeaderSearch from './HeaderSearch';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link href="/" className="flex items-center space-x-2 group h-full py-1">
              <Image 
                src="/logoAndIcon/logo.png" 
                alt="BookMyDoctor" 
                width={400} 
                height={120} 
                className="h-16 md:h-20 w-auto object-contain max-w-none group-hover:scale-105 transition-transform"
                style={{ height: '140%', position: 'relative', top: '5px' }}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-8 items-center">
            {[
              { name: 'Home', href: '/' },
              { name: 'Specialties', href: '/specialties' },
              { name: 'My Bookings', href: '/bookings' },
              { name: 'About Us', href: '/about' },
              { name: 'Contact', href: '/contact' }
            ].map((link) => {
              const isActive = pathname 
                ? (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                : link.href === '/';
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`text-sm font-black transition-all ${isActive ? 'text-[#00B5B5]' : 'text-slate-500 hover:text-[#00B5B5]'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <HeaderSearch />
            
            <div className="flex items-center space-x-4">
              <ProfileDropdown />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 top-20 bg-slate-900/20 backdrop-blur-xs z-30 transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl z-40 transition-all duration-300 ease-in-out">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {/* Search and Location for Mobile */}
            <div className="pb-4 border-b border-slate-100 lg:hidden">
              <HeaderSearch mobile={true} />
            </div>

            {[
              { name: 'Home', href: '/' },
              { name: 'Specialties', href: '/specialties' },
              { name: 'My Bookings', href: '/bookings' },
              { name: 'About Us', href: '/about' },
              { name: 'Contact', href: '/contact' }
            ].map((link) => {
              const isActive = pathname 
                ? (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                : link.href === '/';
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-bold py-3 px-4 rounded-xl transition-all flex items-center ${isActive ? 'bg-[#00B5B5]/10 text-[#00B5B5]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#00B5B5]'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
