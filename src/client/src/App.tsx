// src/client/src/App.tsx
import { Suspense, lazy } from 'react';
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
import ChatLayout from './components/layout/ChatLayout';
import ProfilePage from './features/user/ProfilePage';
import WishlistPage from './features/wishlist/WishlistPage';
import PromotionsPage from './features/promotions/PromotionsPage';

// Lazy load heavy components (code splitting)
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const HostDashboard = lazy(() => import('./features/host/HostDashboard'));
const BookingPage = lazy(() => import('./features/booking/BookingPage'));
const BookingDetailsPage = lazy(
  () => import('./features/booking/BookingDetailsPage')
);
const BookingsListPage = lazy(
  () => import('./features/booking/BookingsListPage')
);
const PaymentSuccessPage = lazy(
  () => import('./features/booking/PaymentSuccessPage')
);
const ChatPage = lazy(() => import('./features/chat/ChatPage'));
const ChatListPage = lazy(() => import('./features/chat/ChatListPage'));
const ReviewForm = lazy(() => import('./features/review/ReviewForm'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      <p className="text-brand-dark/60 font-medium">Đang tải...</p>
    </div>
  </div>
);

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
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Suspense fallback={<PageLoader />}>
                    <BookingPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Suspense fallback={<PageLoader />}>
                    <BookingDetailsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Suspense fallback={<PageLoader />}>
                    <BookingsListPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <PaymentSuccessPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:bookingId"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <Suspense fallback={<PageLoader />}>
                    <ReviewForm />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Chat Routes - Separate Layout (no Navbar) */}
          <Route element={<ChatLayout />}>
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ChatListPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:otherUserId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ChatPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes - No MainLayout (has own sidebar) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Host Routes - No MainLayout (has own sidebar) */}
          <Route
            path="/host"
            element={
              <ProtectedRoute allowedRoles={['HOST']}>
                <Suspense fallback={<PageLoader />}>
                  <HostDashboard />
                </Suspense>
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
