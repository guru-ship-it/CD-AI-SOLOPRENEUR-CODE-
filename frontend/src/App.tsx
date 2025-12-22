
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TenantManager } from './pages/TenantManager';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { CookieConsent } from './components/ui/CookieConsent';
import { WatermarkOverlay } from './components/security/WatermarkOverlay';

// Wrapper component to use the hook inside Router context
const AppContent = () => {
  useSessionTimeout();

  return (
    <WatermarkOverlay>
      <CookieConsent />
      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tenants" element={<TenantManager />} />
        </Route>
      </Routes>
    </WatermarkOverlay>
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
