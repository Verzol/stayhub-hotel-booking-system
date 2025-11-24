import { useState } from 'react';
import { register } from '../../services/authService';
import { toast } from 'sonner';
import { Building2, Smile, X, ArrowLeft } from 'lucide-react';
import type { RegisterRequest } from '../../types/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [view, setView] = useState<'social' | 'email'>('social');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = formData;
      await register(payload);
      toast.success('Account created successfully! You can now login.');
      onSwitchToLogin();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        'Unable to create account. Please try again.';
      // Try to map backend errors to fields if possible, otherwise show general error
      if (message.toLowerCase().includes('email')) {
        setErrors({ email: message });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
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
                Join StayHub Today!
              </h2>
              <p className="text-blue-600/80 font-medium text-xs">
                Create an account to unlock exclusive deals and rewards.
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
                <span>Sign up with Apple</span>
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
                <span>Sign up with Google</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-blue-100 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all font-bold text-blue-900 shadow-sm">
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

            {/* Other Options */}
            <div className="text-center mb-8">
              <button
                onClick={() => setView('email')}
                className="text-blue-600 font-bold text-sm hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
              >
                Sign up with Email
              </button>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-blue-50 pt-6">
              <p className="text-xs text-blue-400 mb-4 px-4">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Privacy Policy
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
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setView('social')}
                className="p-2 -ml-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black text-blue-900 ml-2">
                Create Account
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium">
                  {errors.general}
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-sm font-bold text-blue-900">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-blue-900 placeholder-blue-300 ${
                    errors.fullName ? 'border-red-500' : 'border-blue-100'
                  }`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-blue-900">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-blue-900 placeholder-blue-300 ${
                    errors.email ? 'border-red-500' : 'border-blue-100'
                  }`}
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-blue-900">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-blue-900 placeholder-blue-300 ${
                    errors.password ? 'border-red-500' : 'border-blue-100'
                  }`}
                  placeholder="Create a strong password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-blue-900">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-blue-900 placeholder-blue-300 ${
                    errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-blue-100'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  I want to...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setFormData({ ...formData, role: 'CUSTOMER' })
                    }
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center transition-all duration-200 ${
                      formData.role === 'CUSTOMER'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-blue-100 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${formData.role === 'CUSTOMER' ? 'bg-blue-100' : 'bg-slate-50'}`}
                    >
                      <Smile
                        className={`h-6 w-6 ${formData.role === 'CUSTOMER' ? 'text-blue-600' : 'text-slate-400'}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold ${formData.role === 'CUSTOMER' ? 'text-blue-900' : 'text-slate-500'}`}
                    >
                      Book Hotels
                    </span>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, role: 'HOST' })}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center transition-all duration-200 ${
                      formData.role === 'HOST'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-blue-100 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${formData.role === 'HOST' ? 'bg-blue-100' : 'bg-slate-50'}`}
                    >
                      <Building2
                        className={`h-6 w-6 ${formData.role === 'HOST' ? 'text-blue-600' : 'text-slate-400'}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold ${formData.role === 'HOST' ? 'text-blue-900' : 'text-slate-500'}`}
                    >
                      List Property
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-lg shadow-lg shadow-blue-200 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center">
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
                    Creating Account...
                  </span>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-900/70 font-medium text-sm">
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
