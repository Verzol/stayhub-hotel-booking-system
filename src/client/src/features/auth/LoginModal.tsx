import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  X,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { login } from '../../services/authService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [view, setView] = useState<'social' | 'email'>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);

  const { login: authLogin, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginError(false);
    try {
      const data = await login({ email, password });
      authLogin(data.token, {
        id: 0, // ID will be fetched from profile
        email,
        fullName: data.fullName,
        role: 'CUSTOMER',
      });

      toast.success(`Welcome back, ${data.fullName}!`);
      setIsLoginSuccess(true);
      setTimeout(() => {
        setIsLoginSuccess(false);
        onClose();
      }, 800);
    } catch (error: unknown) {
      console.error('Login error:', error);
      setIsLoginError(true);
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Incorrect email or password.';
      toast.error(message);
      setTimeout(() => setIsLoginError(false), 2000);
    }
  };

  const handleClose = () => {
    setView('social');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {view === 'social' ? (
          <div className="p-6 pt-8">
            {/* Illustration & Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-32 h-24 mb-4 bg-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Abstract Illustration Placeholder */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent)]"></div>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7466/7466140.png"
                  alt="Travel Deal"
                  className="w-16 h-16 object-contain relative z-10 drop-shadow-lg"
                />
              </div>
              <h2 className="text-xl font-black text-blue-900 mb-2">
                We've got a deal you can't resist!
              </h2>
              <p className="text-blue-600/80 font-medium text-xs">
                Log in or register to unlock the best prices.
              </p>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-blue-100 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all font-bold text-blue-900 group shadow-sm">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 4.65-1.64 2.03.15 3.38 1.23 4.1 1.9-3.38 1.98-2.78 7.16 1.1 8.45-.5 1.54-1.18 3.05-2.41 4.75l-.52.77zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-blue-100 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all font-bold text-blue-900 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-blue-100 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all font-bold text-blue-900 shadow-sm">
                <svg
                  className="w-5 h-5 text-[#1877F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continue with Facebook</span>
              </button>
            </div>

            {/* Other Options */}
            <div className="text-center mb-8">
              <button
                onClick={() => setView('email')}
                className="text-blue-600 font-bold text-sm hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
              >
                Other options
              </button>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-blue-50 pt-6">
              <p className="text-xs text-blue-400 mb-4 px-4">
                By continuing, you agree to these{' '}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Terms & Conditions
                </a>{' '}
                and acknowledge that you have been informed about our{' '}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Privacy Notice
                </a>
                .
              </p>
              <button
                onClick={handleClose}
                className="text-blue-600 font-bold text-sm hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
              >
                Browse as a guest
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setView('social')}
                className="p-2 -ml-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black text-blue-900 ml-2">
                Log In with Email
              </h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-blue-900">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-blue-300" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-blue-900 placeholder-blue-300"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-blue-900">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    onClick={onClose}
                    className="text-sm font-bold text-blue-600 hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-blue-900 placeholder-blue-300 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLoginSuccess || isLoginError}
                className={`w-full flex justify-center items-center py-3.5 px-6 rounded-lg shadow-lg shadow-blue-200 text-base font-bold text-white transition-all duration-300 transform 
                  ${
                    isLoginSuccess
                      ? 'bg-green-500 hover:bg-green-600 scale-100 cursor-default'
                      : isLoginError
                        ? 'bg-red-500 hover:bg-red-600 scale-100 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl'
                  }
                  disabled:opacity-90 disabled:transform-none
                `}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : isLoginSuccess ? (
                  <div className="flex items-center animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="mr-2 h-5 w-5 text-white" />
                    <span>Success!</span>
                  </div>
                ) : isLoginError ? (
                  <div className="flex items-center animate-in fade-in zoom-in duration-300">
                    <XCircle className="mr-2 h-5 w-5 text-white" />
                    <span>Login Failed</span>
                  </div>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-900/70 font-medium text-sm">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
