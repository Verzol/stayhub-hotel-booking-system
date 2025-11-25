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
  Lock,
  Lightbulb,
  Check,
  Loader2,
} from 'lucide-react';
import { login, checkEmail, forgotPassword } from '../../services/authService';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

type ModalView =
  | 'social'
  | 'email-check'
  | 'password'
  | 'forgot-password'
  | 'forgot-success';

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [view, setView] = useState<ModalView>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isLoginError, setIsLoginError] = useState(false);

  const { login: authLogin } = useAuth();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { exists } = await checkEmail(email);
      if (exists) {
        setView('password');
      } else {
        // Email không tồn tại -> chuyển sang register
        onClose();
        onSwitchToRegister();
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to verify email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginError(false);
    setIsLoading(true);

    try {
      const data = await login({ email, password });
      authLogin(data.token, {
        id: data.id,
        email,
        fullName: data.fullName,
        role: data.role,
      });

      toast.success(`Welcome back, ${data.fullName}!`);
      setIsLoginSuccess(true);

      setTimeout(() => {
        setIsLoginSuccess(false);
        onClose();
        resetModal();

        // Role-based redirection
        const userRole = data.role?.toUpperCase();
        if (userRole === 'ADMIN') {
          window.location.href = '/admin';
        } else if (userRole === 'HOST') {
          window.location.href = '/host';
        }
      }, 800);
    } catch (error: unknown) {
      console.error('Login error:', error);
      setIsLoginError(true);
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Incorrect password.';
      toast.error(message);
      setTimeout(() => setIsLoginError(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setView('forgot-success');
    } catch (error: unknown) {
      console.error(error);
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Failed to send reset link.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setView('social');
    setEmail('');
    setPassword('');
    setIsLoginSuccess(false);
    setIsLoginError(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const goBack = () => {
    if (view === 'password' || view === 'forgot-password') {
      setView('email-check');
    } else if (view === 'email-check') {
      setView('social');
    } else if (view === 'forgot-success') {
      setView('social');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ===== VIEW: Social Login Options ===== */}
        {view === 'social' && (
          <div className="p-6 pt-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-24 h-24 mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-brand-bg rounded-2xl"></div>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7466/7466140.png"
                  alt="Travel"
                  className="w-full h-full object-contain p-3 relative z-10"
                />
              </div>
              <h2 className="text-xl font-black text-brand-dark mb-1">
                We've got a deal you can't resist!
              </h2>
              <p className="text-brand-dark/60 text-sm">
                Log in or register to unlock the best prices.
              </p>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 shadow-sm">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 4.65-1.64 2.03.15 3.38 1.23 4.1 1.9-3.38 1.98-2.78 7.16 1.1 8.45-.5 1.54-1.18 3.05-2.41 4.75l-.52.77zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 shadow-sm">
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

              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 shadow-sm">
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

            {/* Email Option */}
            <div className="text-center mb-6">
              <button
                onClick={() => setView('email-check')}
                className="text-brand-accent font-semibold text-sm hover:text-brand-accent hover:bg-brand-accent/10 px-4 py-2 rounded-lg transition-colors"
              >
                Other options
              </button>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-brand-dark/10 pt-5">
              <p className="text-xs text-brand-dark/50 mb-4 px-2">
                By continuing, you agree to our{' '}
                <a
                  href="#"
                  className="text-brand-accent font-medium hover:underline"
                >
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-brand-accent font-medium hover:underline"
                >
                  Privacy Notice
                </a>
              </p>
              <p className="text-brand-dark/60 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className="text-brand-accent font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ===== VIEW: Email Check ===== */}
        {view === 'email-check' && (
          <div className="p-6 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={goBack}
                className="p-2 -ml-2 text-brand-dark/50 hover:text-brand-dark hover:bg-brand-dark/5 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-brand-dark">
                Log In or Register
              </h2>
            </div>

            <form onSubmit={handleCheckEmail} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-brand-dark/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-brand-dark"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3.5 bg-brand-cta hover:bg-brand-cta-hover disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Continue'
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-brand-dark/60 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className="text-brand-accent font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ===== VIEW: Password Login ===== */}
        {view === 'password' && (
          <div className="p-6 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={goBack}
                className="p-2 -ml-2 text-brand-dark/50 hover:text-brand-dark hover:bg-brand-dark/5 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-brand-dark">
                Welcome Back
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Verified Email Display */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Verified Email
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-brand-dark/10 rounded-xl bg-brand-bg/30 text-brand-dark/60"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-brand-dark/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-brand-dark"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark/60"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="text-sm text-brand-accent font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLoginSuccess || isLoginError}
                className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isLoginSuccess
                    ? 'bg-green-500 text-white'
                    : isLoginError
                      ? 'bg-red-500 text-white'
                      : 'bg-brand-cta hover:bg-brand-cta-hover text-white'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLoginSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Success!
                  </>
                ) : isLoginError ? (
                  <>
                    <XCircle className="w-5 h-5" />
                    Login Failed
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-brand-dark/60 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className="text-brand-accent font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ===== VIEW: Forgot Password ===== */}
        {view === 'forgot-password' && (
          <div className="p-6 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={goBack}
                className="p-2 -ml-2 text-brand-dark/50 hover:text-brand-dark hover:bg-brand-dark/5 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-brand-dark">
                Forgot Password
              </h2>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              {/* Verified Email */}
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Verified Email/Mobile Number
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-brand-dark/10 rounded-xl bg-brand-bg/30 text-brand-dark/60"
                  />
                </div>
              </div>

              {/* Password Tips */}
              <div className="bg-brand-accent/10 rounded-xl p-4">
                <div className="flex items-start gap-2 text-brand-accent mb-3">
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">
                    Tips for a strong password you'll remember
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-brand-dark/70 ml-7">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Min. 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Use at least 3 different characters
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-brand-cta hover:bg-brand-cta-hover disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <p className="text-xs text-brand-dark/50 text-center">
                For your security, resetting your password will require you to
                log in again with your new password on all devices.
              </p>
            </form>
          </div>
        )}

        {/* ===== VIEW: Forgot Password Success ===== */}
        {view === 'forgot-success' && (
          <div className="p-6 pt-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-dark mb-2">
              Check Your Email
            </h2>
            <p className="text-brand-dark/60 mb-6">
              We've sent a password reset link to
              <br />
              <span className="font-semibold text-brand-dark">{email}</span>
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl transition-all"
            >
              Done
            </button>
            <p className="text-xs text-brand-dark/40 mt-4">
              Didn't receive the email?{' '}
              <button
                onClick={() => setView('forgot-password')}
                className="text-brand-accent font-medium hover:underline"
              >
                Resend
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
