import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute, { SuperAdminProtectedRoute } from './components/AdminProtectedRoute';
import { ToastProvider } from './components/ToastProvider';
import ChatBubble from './components/ChatBubble';
import ScrollToTopButton from './components/ScrollToTopButton';
import ChatNotification from './components/ChatNotification';
import LoginModal from './components/LoginModal';
import useLoginModalStore from './store/loginModalStore';
import useAuthStore from './store/authStore';
import CookieConsent from './components/CookieConsent';

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ProductDetailPage from './pages/ProductDetailPage';

import AuthCallbackPage from './pages/AuthCallbackPage';
import MyProfilePage from './pages/MyProfilePage';
import DashboardPage from './pages/DashboardPage';
import TentangKamiPage from './pages/TentangKamiPage';
import AturanPage from './pages/AturanPage';
import PrivasiPage from './pages/PrivasiPage';
import CaraJualPage from './pages/CaraJualPage';
import CaraBeliPage from './pages/CaraBeliPage';
import TipsCODPage from './pages/TipsCODPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminVerificationPage from './pages/AdminVerificationPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminBannersPage from './pages/AdminBannersPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminManagementPage from './pages/AdminManagementPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ReportPage from './pages/ReportPage';
import SellerPage from './pages/SellerPage';
import AdminLayout from './components/AdminLayout';
import MaintenancePage from './pages/MaintenancePage';
import { useState, useEffect } from 'react';
import api from './services/api';

// Global Login Modal component
function GlobalLoginModal() {
  const { isOpen, closeLoginModal } = useLoginModalStore();
  return <LoginModal isOpen={isOpen} onClose={closeLoginModal} />;
}

// Wrapper component to use useLocation hook for split layouts
function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDashboard = location.pathname === '/dashboard';
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await api.get('/maintenance-status');
        setIsMaintenanceMode(res.data.maintenance === true);
      } catch {
        setIsMaintenanceMode(false);
      } finally {
        setMaintenanceChecked(true);
      }
    };
    if (!isAdminRoute) {
      checkMaintenance();
    } else {
      setMaintenanceChecked(true);
    }
  }, [isAdminRoute]);

  // Show loading while checking maintenance
  if (!maintenanceChecked && !isAdminRoute) {
    return <div className="min-h-screen bg-[#0f1520] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // Show maintenance page for non-admin routes when maintenance mode is on
  if (isMaintenanceMode && !isAdminRoute) {
    return <MaintenancePage />;
  }

  return (
    <>
      {!isAdminRoute && !isDashboard && (
        <div className="flex flex-col min-h-screen font-display">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Main Public & User Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jelajah" element={<BrowsePage />} />
              <Route path="/produk/:id" element={<ProductDetailPage />} />
              <Route path="/penjual/:id" element={<SellerPage />} />

              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Static Info Pages */}
              <Route path="/tentang-kami" element={<TentangKamiPage />} />
              <Route path="/aturan" element={<AturanPage />} />
              <Route path="/privasi" element={<PrivasiPage />} />
              <Route path="/cara-jual" element={<CaraJualPage />} />
              <Route path="/cara-beli" element={<CaraBeliPage />} />
              <Route path="/tips-cod" element={<TipsCODPage />} />
              <Route path="/lapor" element={<ReportPage />} />



              <Route path="/myprofile" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } />

              <Route path="/jual" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard?tab=pasang-iklan" replace />
                </ProtectedRoute>
              } />

              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard?tab=wishlist" replace />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          {!['/auth/callback', '/login'].includes(location.pathname) && (
            <>
              <ChatBubble />
              <ChatNotification />
            </>
          )}
          <GlobalLoginModal />
          <ScrollToTopButton />
        </div>
      )}

      {/* Dashboard - Standalone layout without Navbar/Footer */}
      {isDashboard && (
        <div className="min-h-screen font-display">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
          <ChatBubble />
          <ChatNotification />
        </div>
      )}

      {/* Admin Portal Routes - Only render when on admin path */}
      {isAdminRoute && (
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Protected Layout */}
          <Route path="/admin/*" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="verifications" element={<AdminVerificationPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                  {/* Super Admin Only Routes */}
                  <Route path="admins" element={
                    <SuperAdminProtectedRoute>
                      <AdminManagementPage />
                    </SuperAdminProtectedRoute>
                  } />
                  <Route path="activity-logs" element={
                    <SuperAdminProtectedRoute>
                      <AdminActivityLogsPage />
                    </SuperAdminProtectedRoute>
                  } />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="*" element={<AdminDashboardPage />} /> {/* Fallback to dashboard */}
                </Routes>
              </AdminLayout>
            </AdminProtectedRoute>
          } />
        </Routes>
      )}
    </>
  );
}

function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <CookieConsent />
        <ScrollToTop />
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;


