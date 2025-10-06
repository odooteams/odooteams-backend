import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Home, Briefcase, FolderOpen, MoreHorizontal, Book, Users, Phone, HelpCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const BottomNavigation = () => {
  const { t, dir } = useLanguage();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainNavItems = [
    { to: '/', label: t('Home', 'الرئيسية'), icon: Home },
    { to: '/services', label: t('Services', 'الخدمات'), icon: Briefcase },
    { to: '/projects', label: t('Projects', 'المشاريع'), icon: FolderOpen },
  ];

  const moreNavItems = [
    { to: '/learn-odoo', label: t('Learn Odoo', 'تعلم أودو'), icon: Book },
    { to: '/about', label: t('About Us', 'من نحن'), icon: Users },
    { to: '/contact', label: t('Contact Us', 'اتصل بنا'), icon: Phone },
    { to: '/faqs', label: t('FAQs', 'الأسئلة الشائعة'), icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-around py-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                active 
                  ? 'text-odoo-purple bg-odoo-purple/10' 
                  : 'text-gray-600 hover:text-odoo-purple'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-odoo-purple transition-colors">
              <MoreHorizontal className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('More', 'المزيد')}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle className="text-center">{t('More Options', 'خيارات أخرى')}</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                      active 
                        ? 'text-odoo-purple bg-odoo-purple/10 border-odoo-purple/20' 
                        : 'text-gray-600 hover:text-odoo-purple hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium text-center">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default BottomNavigation;