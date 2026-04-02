import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { t, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string, sectionId?: string) => {
    if (sectionId) {
      e.preventDefault();
      if (location.pathname === '/') {
        // Already on homepage, just scroll
        scrollToSection(sectionId);
      } else {
        // Navigate to homepage first, then scroll
        navigate('/');
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: t('Home', 'الرئيسية') },
    { to: '/services', label: t('Services', 'الخدمات'), sectionId: 'services' },
    { to: '/projects', label: t('Projects', 'المشاريع'), sectionId: 'projects' },
    { to: '/learn-odoo', label: t('Learn Odoo', 'تعلم أودو') },
    { to: '/about', label: t('About Us', 'من نحن'), hideInTablet: true },
    { to: '/contact', label: t('Contact Us', 'اتصل بنا'), hideInTablet: true },
  ];

  return (
    <header className={`bg-background shadow-md sticky top-0 z-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-none mx-auto px-4">
        <div className="flex items-center py-4">
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Odoo<span className="text-odoo-magenta">Teams</span></span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to}
                onClick={(e) => link.sectionId && location.pathname === '/' ? handleNavClick(e, link.to, link.sectionId) : undefined}
                className={`text-foreground hover:text-primary font-medium transition duration-300 px-2 ${
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
                  onClick={(e) => {
                    if (link.sectionId && location.pathname === '/') {
                      handleNavClick(e, link.to, link.sectionId);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                  className="text-foreground hover:text-primary font-medium block py-2 transition duration-300"
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
