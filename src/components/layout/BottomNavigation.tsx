import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Home, Briefcase, FolderOpen, Phone } from 'lucide-react';

const BottomNavigation = () => {
  const { t, dir } = useLanguage();
  const location = useLocation();

  const navItems = [
    { to: '/', label: t('Home', 'الرئيسية'), icon: Home },
    { to: '/services', label: t('Services', 'الخدمات'), icon: Briefcase },
    { to: '/projects', label: t('Projects', 'المشاريع'), icon: FolderOpen },
    { to: '/contact', label: t('Contact', 'اتصل بنا'), icon: Phone },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-primary scale-105'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-primary/10' : ''}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;