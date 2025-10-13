
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import ClientDashboard from '@/pages/ClientDashboard';
import Orders from '@/pages/dashboard/Orders';
import Support from '@/pages/dashboard/Support';
import Profile from '@/pages/dashboard/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminServices from '@/pages/admin/Services';
import AdminProjects from '@/pages/admin/Projects';
import AdminFAQs from '@/pages/admin/FAQs';
import AdminResources from '@/pages/admin/Resources';
import AdminAnalytics from '@/pages/admin/Analytics';
import AdminUsers from '@/pages/admin/Users';
import NotFound from '@/pages/NotFound';
import './App.css';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
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
            
            {/* Auth Routes */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/orders" 
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/support" 
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/services" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminServices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/projects" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/faqs" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminFAQs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/resources" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminResources />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminAnalytics />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <StickyContact />
          <PWAInstallPrompt />
          <Toaster />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
