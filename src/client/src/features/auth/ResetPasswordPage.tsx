import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPassword } from '../../services/authService';
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Hotel,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const schema = z
  .object({
    otp: z
      .string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d+$/, 'OTP must contain only numbers'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(
        /[!@#$%^&*]/,
        'Must contain at least one special character (!@#$%^&*)'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const ResetPasswordPage = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!email) {
      setStatus('error');
      setMessage('Email is missing. Please try again.');
      return;
    }

    setStatus('loading');
    try {
      await resetPassword(email, data.otp, data.password);
      setStatus('success');
      setMessage(
        'Password reset successfully! You can now login with your new password.'
      );
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      setStatus('error');
      const error = err as Error;
      setMessage(error.message || 'Failed to reset password.');
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">
            Missing Information
          </h2>
          <p className="text-brand-dark/60 mb-6">
            Please start the password reset process from the beginning.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block w-full py-3 px-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image & Quote (Fixed) */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-10 w-1/2 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand-accent/70 to-brand-dark/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
          }}
        />

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-between w-full p-12">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Hotel className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">StayHub</span>
          </Link>

          <div className="max-w-md">
            <blockquote className="text-4xl font-black leading-tight mb-6">
              "Secure your journey."
            </blockquote>
            <p className="text-white/80 text-lg leading-relaxed">
              Create a new password to keep your account safe and continue exploring the world.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <div className="text-3xl font-black">Secure</div>
              <div className="text-white/60 font-medium">Account Recovery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form (Scrollable) */}
      <div className="w-full lg:w-1/2 ml-auto flex flex-col justify-center min-h-screen p-8 lg:p-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-3 mb-10 w-fit"
          >
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">StayHub</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-3">
              Reset Password
            </h1>
            <p className="text-slate-500 text-lg">
              Enter the OTP sent to <span className="font-bold text-brand-dark">{email}</span>
            </p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Password Reset!
              </h3>
              <p className="text-slate-600 mb-6 px-4">
                Your password has been successfully updated. Redirecting to
                login...
              </p>
              <Link
                to="/login"
                className="inline-block py-3 px-8 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{message}</span>
                </div>
              )}

              {/* OTP Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Verification Code (OTP)
                </label>
                <div className="relative group">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    {...register('otp')}
                    type="text"
                    maxLength={6}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-all font-medium tracking-[0.3em] font-mono text-center text-lg ${
                      errors.otp
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10'
                    }`}
                    placeholder="000000"
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm font-medium ml-1">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-all font-medium ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm font-medium ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-all font-medium ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10'
                    }`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm font-medium ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
