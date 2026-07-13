import Link from 'next/link';
import Image from 'next/image';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#063B33] text-white border-t border-[#0e7c66]/30 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

          {/* Brand Info */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 -mt-10 -mb-8">
              <Image
                src="/logoAndIcon/logo.png"
                alt="BookMyDoctor"
                width={350}
                height={100}
                className="h-24 md:h-28 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-emerald-100/70 text-sm leading-relaxed max-w-sm font-semibold pl-7">
              BookMyDoctor helps patients discover trusted doctors and clinics nearby while making healthcare access simpler, faster, and more transparent.
              We connect patients with healthcare providers through an easy-to-use appointment booking platform.
            </p>
            <div className="flex space-x-4 pl-7">
              <a href="#" className="text-emerald-100/50 hover:text-white transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" className="text-emerald-100/50 hover:text-white transition-colors">
                <TwitterIcon />
              </a>
              <a href="#" className="text-emerald-100/50 hover:text-white transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" className="text-emerald-100/50 hover:text-white transition-colors">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Column 2: Patients */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider mb-6">Patients</h3>
            <ul className="space-y-4 font-bold text-sm">
              <li><Link href="/specialties" className="text-emerald-100/70 hover:text-white transition-colors">Search Doctors</Link></li>
              <li><Link href="/specialties" className="text-emerald-100/70 hover:text-white transition-colors">Browse Specialties</Link></li>
              <li><Link href="/appointments" className="text-emerald-100/70 hover:text-white transition-colors">My Appointments</Link></li>
              <li><Link href="/profile" className="text-emerald-100/70 hover:text-white transition-colors">Patient Profile</Link></li>
            </ul>
          </div>

          {/* Column 3: Doctors & Clinics */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider mb-6">Partners</h3>
            <ul className="space-y-4 font-bold text-sm">
              <li><a href="/contact" className="text-emerald-100/70 hover:text-white transition-colors">For Doctors</a></li>
              <li><a href="/contact" className="text-emerald-100/70 hover:text-white transition-colors">For Clinics</a></li>
              <li><a href="/contact" className="text-emerald-100/70 hover:text-white transition-colors">Clinic Registration</a></li>
              <li><a href="/contact" className="text-emerald-100/70 hover:text-white transition-colors">Software Solutions</a></li>
            </ul>
          </div>

          {/* Column 4: Support & Contact */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider mb-6">Support</h3>
            <ul className="space-y-4 font-bold text-sm">
              <li><Link href="/contact" className="text-emerald-100/70 hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/about" className="text-emerald-100/70 hover:text-white transition-colors">About BookMyDoctor</Link></li>
              <li className="pt-2 border-t border-[#0e7c66]/20 flex items-center gap-2 text-emerald-100/60 text-xs font-semibold">
                <Mail size={14} className="text-emerald-100/50" />
                <a href="mailto:support@example.com" className="hover:underline">support@example.com</a>
              </li>
              <li className="flex items-center gap-2 text-emerald-100/60 text-xs font-semibold">
                <Phone size={14} className="text-emerald-100/50" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2 text-emerald-100/60 text-xs font-semibold leading-tight">
                <MapPin size={14} className="text-emerald-100/50 shrink-0 mt-0.5" />
                <span>Sector 62, Noida, Uttar Pradesh, 201301</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#0e7c66]/20 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-emerald-100/40 text-xs text-center md:text-left font-bold pl-7">
            &copy; {new Date().getFullYear()} BookMyDoctor India. Proudly built for digital healthcare accessibility.
          </p>
          <div className="flex items-center text-xs text-emerald-100/40 font-bold">
            Made with <Heart className="w-3 h-3 mx-1 text-rose-500 fill-current" /> in India.
          </div>
          <div className="flex space-x-6 font-bold">
            <Link href="/privacy" className="text-emerald-100/40 hover:text-white text-xs">Privacy Policy</Link>
            <Link href="/terms" className="text-emerald-100/40 hover:text-white text-xs">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
