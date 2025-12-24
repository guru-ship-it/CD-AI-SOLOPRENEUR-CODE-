
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TenantManager } from './pages/TenantManager';
import { VerificationTerminal } from './pages/VerificationTerminal';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { Login } from './pages/Login';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { CookieConsent } from './components/ui/CookieConsent';
import { WatermarkOverlay } from './components/security/WatermarkOverlay';
import { NitiChatWidget } from './components/ui/NitiChatWidget';
import { Toaster } from 'sonner';

const AppContent = () => {
  useSessionTimeout();

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      <Toaster position="bottom-right" richColors />
      <WatermarkOverlay>
        <CookieConsent />
        <NitiChatWidget />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tenants" element={<TenantManager />} />
            <Route path="verify" element={<VerificationTerminal />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>
        </Routes>
      </WatermarkOverlay>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
