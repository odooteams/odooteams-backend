
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Enhanced service worker registration for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[Main] SW registered successfully: ', registration);
        
        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[Main] New service worker found');
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('[Main] Service worker state changed:', newWorker.state);
              
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Main] New content is available; please refresh.');
                // Could show a toast notification here
                if (window.confirm('New version available! Refresh to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Force update check every 30 seconds
        setInterval(() => {
          registration.update();
        }, 30000);
        
        // Initial update check
        registration.update();
      })
      .catch((registrationError) => {
        console.error('[Main] SW registration failed: ', registrationError);
      });
  });

  // Listen for service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[Main] Message from SW:', event.data);
  });
}

// Check PWA installation criteria
console.log('[Main] PWA Debug Info:', {
  serviceWorker: 'serviceWorker' in navigator,
  manifest: document.querySelector('link[rel="manifest"]'),
  https: location.protocol === 'https:' || location.hostname === 'localhost',
  displayMode: window.matchMedia('(display-mode: standalone)').matches,
  userAgent: navigator.userAgent
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);
