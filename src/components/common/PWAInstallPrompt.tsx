
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const { t, dir } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;

    console.log('PWA Status:', {
      iOS,
      isStandalone,
      isInWebAppiOS,
      isInstalled,
      userAgent: navigator.userAgent
    });

    if (isInstalled) {
      console.log('App is already installed');
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA install prompt event triggered');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For browsers that don't support beforeinstallprompt (like iOS Safari)
    if (iOS && !sessionStorage.getItem('pwa-prompt-dismissed')) {
      setIsInstallable(true);
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    // For Chrome/Edge - check if criteria are met
    if (!iOS && !sessionStorage.getItem('pwa-prompt-dismissed')) {
      // Check if service worker is registered and manifest exists
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            console.log('Service worker found, PWA installable');
            setIsInstallable(true);
            // Show manual prompt if no beforeinstallprompt fired after 5 seconds
            setTimeout(() => {
              if (!deferredPrompt) {
                console.log('No beforeinstallprompt, showing manual prompt');
                setShowPrompt(true);
              }
            }, 5000);
          }
        });
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    console.log('Install button clicked', { deferredPrompt, isIOS });
    
    if (deferredPrompt && !isIOS) {
      try {
        console.log('Showing install prompt');
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        console.log('User choice:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      } catch (error) {
        console.error('Install prompt failed:', error);
      }
      setDeferredPrompt(null);
    }

    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleClose = () => {
    console.log('PWA prompt dismissed');
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed this session or not installable
  if (sessionStorage.getItem('pwa-prompt-dismissed') === 'true' || !isInstallable) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 max-w-sm mx-auto ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 bg-odoo-purple/10 p-2 rounded-full">
          <img
            src="/uploads/e8433aef-9332-4de5-a325-42043909dbab.png"
            alt="OdooTeams"
            className="h-6 w-6 object-contain rounded"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {t('Install App', 'تثبيت التطبيق')}
          </h3>
          
          {isIOS ? (
            <p className="text-sm text-gray-600 mb-3">
              {t(
                'To install this app on iOS: tap the Share button and then "Add to Home Screen".',
                'لتثبيت هذا التطبيق على iOS: اضغط على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية".'
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-3">
              {deferredPrompt ? 
                t(
                  'Add this app to your home screen for a better experience.',
                  'أضف هذا التطبيق إلى الشاشة الرئيسية للحصول على تجربة أفضل.'
                ) :
                t(
                  'This app can be installed. Look for the install icon in your browser\'s address bar or menu.',
                  'يمكن تثبيت هذا التطبيق. ابحث عن أيقونة التثبيت في شريط عنوان المتصفح أو القائمة.'
                )
              }
            </p>
          )}
          
          <div className="flex gap-2">
            {(!isIOS || deferredPrompt) && (
              <Button 
                size="sm" 
                onClick={handleInstallClick}
                className="bg-odoo-purple hover:bg-odoo-purple/90 text-white"
              >
                <Download className="h-4 w-4 mr-2 ml-reverse:rtl" />
                {t('Install', 'تثبيت')}
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleClose}
              className="text-gray-600"
            >
              {t('Maybe Later', 'ربما لاحقاً')}
            </Button>
          </div>
        </div>
        
        <button 
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
