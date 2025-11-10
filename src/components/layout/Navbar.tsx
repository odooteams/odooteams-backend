import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { t, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { to: '/', label: t('Home', 'الرئيسية') },
    { to: '/services', label: t('Services', 'الخدمات') },
    { to: '/projects', label: t('Projects', 'المشاريع') },
    { to: '/learn-odoo', label: t('Learn Odoo', 'تعلم أودو') },
    { to: '/about', label: t('About Us', 'من نحن'), hideInTablet: true },
    { to: '/contact', label: t('Contact Us', 'اتصل بنا'), hideInTablet: true },
  ];

  return (
    <header className={`bg-white shadow-md sticky top-0 z-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-none mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-odoo-purple">Odoo<span className="text-odoo-magenta">Teams</span></span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className={`hidden md:flex items-center ${dir === 'rtl' ? 'space-x-0 space-x-reverse space-x-8' : 'space-x-8'}`}>
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`text-gray-700 hover:text-odoo-magenta font-medium transition duration-300 px-2 ${
                  link.hideInTablet ? 'hidden lg:block' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="p-1">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-odoo-magenta font-medium block py-2 transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
