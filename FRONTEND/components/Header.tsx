import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import HeaderSearch from './HeaderSearch';

const Header = () => {
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
            ].map((link, i) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-sm font-black transition-all ${i === 0 ? 'text-[#00B5B5]' : 'text-slate-500 hover:text-[#00B5B5]'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <HeaderSearch />
            
            <div className="flex items-center space-x-4">
              <ProfileDropdown />
              <button className="xl:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
