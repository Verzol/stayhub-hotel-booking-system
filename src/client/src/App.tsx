// src/client/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import LandingPage from './features/landing/LandingPage';
import MainLayout from './components/layout/MainLayout';
import ProfilePage from './features/user/ProfilePage';

// Định nghĩa kiểu dữ liệu cho Props (TypeScript Standard)
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Component bảo vệ: Nếu chưa login thì đá về trang Login
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Tránh redirect sai khi đang load user

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Trang chủ tạm thời (Dashboard)
const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-10 pt-24">
      <h1 className="text-2xl font-bold">Welcome, {user?.fullName}!</h1>
      <p className="mt-2 text-gray-600">This is your dashboard.</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with MainLayout (Navbar always visible) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Standalone Pages (No Navbar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
