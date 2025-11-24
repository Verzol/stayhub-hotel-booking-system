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
    <div className="min-h-screen flex items-center justify-center relative bg-[#F2F3F3] px-4">
      <Link
        to="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 font-bold hover:text-blue-600 hover:shadow-lg transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Login</span>
      </Link>

      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Forgot Password?
          </h2>
          <p className="text-slate-500 mt-2">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Check your email
            </h3>
            <p className="text-slate-500 mb-6">
              We have sent a password reset link to your email address.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {status === 'error' && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {status === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
