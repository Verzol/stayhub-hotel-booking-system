import { useState } from 'react';
import { register } from '../../services/authService';
import { toast } from 'sonner';
import {
  Building2,
  Smile,
  X,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import type { RegisterRequest } from '../../types/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

type ModalView = 'social' | 'form' | 'success';

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [view, setView] = useState<ModalView>('social');
  const [formData, setFormData] = useState<
    RegisterRequest & { confirmPassword: string }
  >({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setErrors({ password: 'Password does not meet requirements' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      setView('success');
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        'Unable to create account. Please try again.';
      if (message.toLowerCase().includes('email')) {
        setErrors({ email: message });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setView('social');
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'CUSTOMER',
    });
    setErrors({});
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleLoginSwitch = () => {
    resetModal();
    onSwitchToLogin();
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
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ===== VIEW: Social Options ===== */}
        {view === 'social' && (
          <div className="p-6 pt-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-24 h-24 mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl"></div>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7466/7466140.png"
                  alt="Travel"
                  className="w-full h-full object-contain p-3 relative z-10"
                />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1">
                Join StayHub Today!
              </h2>
              <p className="text-slate-500 text-sm">
                Create an account to unlock exclusive deals.
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
                <span>Sign up with Apple</span>
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
                <span>Sign up with Google</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 shadow-sm">
                <svg
                  className="w-5 h-5 text-[#1877F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Sign up with Facebook</span>
              </button>
            </div>

            {/* Email Option */}
            <div className="text-center mb-6">
              <button
                onClick={() => setView('form')}
                className="text-cyan-600 font-semibold text-sm hover:text-cyan-700 hover:bg-cyan-50 px-4 py-2 rounded-lg transition-colors"
              >
                Sign up with Email
              </button>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 mb-4 px-2">
                By signing up, you agree to our{' '}
                <a
                  href="#"
                  className="text-cyan-600 font-medium hover:underline"
                >
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-cyan-600 font-medium hover:underline"
                >
                  Privacy Policy
                </a>
              </p>
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <button
                  onClick={handleLoginSwitch}
                  className="text-cyan-600 font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ===== VIEW: Registration Form ===== */}
        {view === 'form' && (
          <div className="p-6 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setView('social')}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-800">
                Create Account
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-slate-800 ${errors.fullName ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-slate-800 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-slate-800 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div
                      className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-green-600' : 'text-slate-400'}`}
                    >
                      <Check
                        className={`w-3 h-3 ${hasMinLength ? 'opacity-100' : 'opacity-40'}`}
                      />
                      Min. 8 characters
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${hasUppercase && hasLowercase ? 'text-green-600' : 'text-slate-400'}`}
                    >
                      <Check
                        className={`w-3 h-3 ${hasUppercase && hasLowercase ? 'opacity-100' : 'opacity-40'}`}
                      />
                      Upper & lowercase letters
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-green-600' : 'text-slate-400'}`}
                    >
                      <Check
                        className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-40'}`}
                      />
                      At least 1 number
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-slate-800 ${errors.confirmPassword ? 'border-red-500' : passwordsMatch ? 'border-green-500' : 'border-slate-200'}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  I want to...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: 'CUSTOMER' })
                    }
                    className={`border rounded-xl p-4 flex flex-col items-center transition-all ${
                      formData.role === 'CUSTOMER'
                        ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Smile
                      className={`w-6 h-6 mb-2 ${formData.role === 'CUSTOMER' ? 'text-cyan-600' : 'text-slate-400'}`}
                    />
                    <span
                      className={`text-sm font-semibold ${formData.role === 'CUSTOMER' ? 'text-cyan-700' : 'text-slate-600'}`}
                    >
                      Book Hotels
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'HOST' })}
                    className={`border rounded-xl p-4 flex flex-col items-center transition-all ${
                      formData.role === 'HOST'
                        ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building2
                      className={`w-6 h-6 mb-2 ${formData.role === 'HOST' ? 'text-cyan-600' : 'text-slate-400'}`}
                    />
                    <span
                      className={`text-sm font-semibold ${formData.role === 'HOST' ? 'text-cyan-700' : 'text-slate-600'}`}
                    >
                      List Property
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <button
                  onClick={handleLoginSwitch}
                  className="text-cyan-600 font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ===== VIEW: Success ===== */}
        {view === 'success' && (
          <div className="p-6 pt-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Account Created!
            </h2>
            <p className="text-slate-500 mb-6">
              Your account has been successfully created.
              <br />
              Please check your email to verify your account.
            </p>
            <button
              onClick={() => {
                resetModal();
                onSwitchToLogin();
              }}
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all"
            >
              Log In Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
