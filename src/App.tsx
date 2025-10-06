
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/lib/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import StickyContact from '@/components/common/StickyContact';
import Index from '@/pages/Index';
import About from '@/pages/About';
import Services from '@/pages/Services';
import ServiceDetails from '@/pages/ServiceDetails';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import Contact from '@/pages/Contact';
import FAQs from '@/pages/FAQs';
import LearnOdoo from '@/pages/LearnOdoo';
import ResourceDetails from '@/pages/ResourceDetails';
import NotFound from '@/pages/NotFound';
import './App.css';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <AdvancedAnalytics />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetails />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/learn-odoo" element={<LearnOdoo />} />
          <Route path="/learn-odoo/:id" element={<ResourceDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <StickyContact />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

export default App;
