// src/client/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import OAuth2RedirectHandler from './features/auth/OAuth2RedirectHandler';
import LandingPage from './features/landing/LandingPage';
import SearchResultsPage from './features/search/SearchResultsPage';
import HotelDetailsPage from './features/hotels/HotelDetailsPage';
import MainLayout from './components/layout/MainLayout';
import ProfilePage from './features/user/ProfilePage';
import AdminDashboard from './features/admin/AdminDashboard';
import HostDashboard from './features/host/HostDashboard';

// Protected Route Props
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-dark/60 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role access if specified
  if (allowedRoles && user?.role) {
    const userRole = user.role.toUpperCase();
    if (!allowedRoles.map((r) => r.toUpperCase()).includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Role-based Home Component
const RoleBasedHome = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  const role = user.role?.toUpperCase();

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  } else if (role === 'HOST') {
    return <Navigate to="/host" replace />;
  }

  // CUSTOMER -> Landing Page
  return <LandingPage />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Customer/Public Routes with MainLayout (has Navbar) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<RoleBasedHome />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes - No MainLayout (has own sidebar) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Host Routes - No MainLayout (has own sidebar) */}
          <Route
            path="/host"
            element={
              <ProtectedRoute allowedRoles={['HOST']}>
                <HostDashboard />
              </ProtectedRoute>
            }
          />

          {/* Auth Pages - Standalone (No Layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
