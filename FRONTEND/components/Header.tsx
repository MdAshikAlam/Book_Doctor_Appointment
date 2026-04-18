import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import HeaderSearch from './HeaderSearch';

const Header = () => {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link href="/" className="flex items-center space-x-2 group h-full py-1">
              <Image 
                src="/logoAndIcon/logo.png" 
                alt="BookMyDoctor" 
                width={400} 
                height={120} 
                className="h-16 md:h-20 w-auto object-contain max-w-none"
                style={{ height: '140%', position: 'relative', top: '5px' }}
                priority
              />
            </Link>
          </div>


          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-6 items-center">
            <Link href="/" className="text-gray-600 hover:text-primary font-bold text-sm transition-colors">
              Home
            </Link>
            <Link href="/specialties" className="text-gray-600 hover:text-primary font-bold text-sm transition-colors">
              Specialties
            </Link>
            <Link href="/appointments" className="text-gray-600 hover:text-primary font-bold text-sm transition-colors">
              Appointments
            </Link>
            <Link href="/bookings" className="text-gray-600 hover:text-primary font-bold text-sm transition-colors">
              My Bookings
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary font-bold text-sm transition-colors whitespace-nowrap">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary font-bold text-sm transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <HeaderSearch />
            
            <div className="flex items-center space-x-4">
              <ProfileDropdown />
              <button className="xl:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
