import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/logoAndIcon/logo.png" 
                alt="BookMyDoctor" 
                width={350} 
                height={100} 
                className="h-16 md:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Providing access to the best healthcare professionals. Making medical appointments simple, fast, and secure for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <TwitterIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <LinkedinIcon />
              </a>
            </div>
          </div>


          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-gray-500 hover:text-primary text-sm transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-500 hover:text-primary text-sm transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-primary text-sm transition-colors">Contact</Link></li>
              <li><Link href="/doctors" className="text-gray-500 hover:text-primary text-sm transition-colors">Find a Doctor</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6">Specialties</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Cardiology</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Pediatrics</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Neurology</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">General Medicine</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li className="flex items-start">
                <span className="block">123 Healthcare Way, Medical District, NY 10001</span>
              </li>
              <li>
                <span className="block font-semibold text-gray-900">Email:</span>
                hello@bookmydoctor.com
              </li>
              <li>
                <span className="block font-semibold text-gray-900">Phone:</span>
                +1 (800) DOCTOR-0
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} BookMyDoctor. Proudly built for healthcare accessibility.
          </p>
          <div className="flex items-center text-xs text-gray-400">
            Made with <Heart className="w-3 h-3 mx-1 text-red-500 fill-current" /> by the BookMyDoctor team.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-xs">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-xs">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
