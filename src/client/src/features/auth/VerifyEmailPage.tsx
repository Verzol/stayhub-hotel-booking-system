import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  verifyEmail,
  resendVerificationEmail,
} from '../../services/authService';
import {
  CheckCircle,
  XCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
  Hotel,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email;
  const messageFromLogin = location.state?.message;

  const [status, setStatus] = useState<
    'input' | 'loading' | 'success' | 'error'
  >('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpFormData) => {
    if (!email) {
      setErrorMessage('Email is missing. Please try logging in again.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      await verifyEmail(email, data.otp);
      setStatus('success');
    } catch (error: unknown) {
      setStatus('error');
      const err = error as Error;
      setErrorMessage(
        err.message || 'Invalid code. Please check and try again.'
      );
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      toast.success('New code sent! Check your inbox.');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Unable to send code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Redirect if no email provided
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-red-50 text-red-600">
              <XCircle className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">
            Missing Information
          </h2>
          <p className="text-brand-dark/60 mb-8">
            No email address provided. Please try logging in or registering
            again.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Go to Login
            </Link>
            <Link
              to="/"
              className="block w-full py-3 px-4 bg-white border border-brand-dark/20 text-brand-dark font-bold rounded-xl hover:bg-white/50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
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
            backgroundImage: `url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
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
              "Almost there."
            </blockquote>
            <p className="text-white/80 text-lg leading-relaxed">
              Just one more step to verify your account and start your journey with StayHub.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <div className="text-3xl font-black">Secure</div>
              <div className="text-white/60 font-medium">Account Verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Verify Email Form (Scrollable) */}
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

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Email Verified!
              </h3>
              <p className="text-slate-600 mb-6 px-4">
                Your email has been successfully verified. You can now log in to
                your account.
              </p>
              <div className="space-y-3 px-6">
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all"
                >
                  Continue to Login
                </Link>
                <Link
                  to="/"
                  className="block w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Input/Loading/Error State */}
          {status !== 'success' && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-3">
                  Verify Your Email
                </h1>
                <p className="text-slate-500 text-lg">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="font-bold text-brand-dark text-lg mt-1">{email}</p>
              </div>

              {messageFromLogin && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <span className="text-amber-700 font-medium">{messageFromLogin}</span>
                </div>
              )}

              {/* Error Message */}
              {(status === 'error' || errorMessage) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-red-600 font-medium">{errorMessage}</span>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Verification Code
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                    <input
                      type="text"
                      {...register('otp')}
                      maxLength={6}
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-all text-center text-3xl tracking-[0.5em] font-mono font-bold ${
                        errors.otp
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10'
                      }`}
                      placeholder="000000"
                      disabled={status === 'loading'}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-sm font-medium ml-1">
                      {errors.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || status === 'loading'}
                  className="w-full py-4 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl font-bold shadow-lg shadow-brand-cta/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="mt-8 text-center">
                <p className="text-slate-500 font-medium">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-brand-accent hover:text-brand-dark font-bold disabled:opacity-50 transition-colors"
                  >
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </button>
                </p>
              </div>
              
              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
