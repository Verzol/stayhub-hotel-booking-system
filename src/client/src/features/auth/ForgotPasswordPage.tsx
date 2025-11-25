import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPassword } from '../../services/authService';
import {
  Loader2,
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Hotel,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      await forgotPassword(data.email);
      setStatus('success');
      setMessage('Password reset link sent! Check your email.');
    } catch (err: unknown) {
      setStatus('error');
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-brand-bg via-brand-bg to-brand-bg overflow-hidden px-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-dark/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-cta/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Back to Login Button */}
      <Link
        to="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 text-brand-dark font-semibold hover:bg-white hover:shadow-xl transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Login</span>
      </Link>

      {/* Forgot Password Card with Glassmorphism */}
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-brand-dark to-brand-accent p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-brand-dark tracking-tight">
              Stay<span className="text-brand-accent">Hub</span>
            </span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-accent/10 text-brand-accent mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-brand-dark">
            Forgot Password?
          </h2>
          <p className="text-brand-dark/60 mt-2">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-green-600 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">
              Check your email
            </h3>
            <p className="text-brand-dark/60 mb-6">
              We have sent a password reset link to your email address.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3.5 px-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {status === 'error' && (
              <div className="p-4 bg-brand-cta/10 text-brand-cta text-sm rounded-xl flex items-start gap-2 border border-brand-cta/20">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-medium">{message}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-brand-dark mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-dark/40" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-12 pr-4 py-3.5 border border-brand-dark/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-white transition-all outline-none font-medium text-brand-dark placeholder:text-brand-dark/40"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-brand-cta font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-3.5 px-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-cta/30 hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {status === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-brand-dark/50 mt-6">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-brand-accent hover:text-brand-accent font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
