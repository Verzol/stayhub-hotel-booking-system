import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPassword, resetPassword } from '../../services/authService';
import {
  Loader2,
  Mail,
  ArrowLeft,
  Hotel,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { PasswordStrengthIndicator } from '../../components/common/PasswordStrengthIndicator';

// Schema for Step 1: Email
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Schema for Step 2: OTP only
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

// Schema for Step 3: New Password
const passwordSchema = z
  .object({
    newPassword: z
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
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type Step = 'email' | 'otp' | 'password';

const ForgotPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form for Step 1
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    getValues: getValuesEmail,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: location.state?.email || '' },
  });

  // Form for Step 2
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Form for Step 3
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Step 1: Send OTP
  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setEmail(data.email);
      setStep('otp');
      toast.success('Verification code sent! Check your inbox.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ||
          'Unable to send verification code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Save OTP and proceed to password step
  const onOtpSubmit = async (data: OtpFormData) => {
    setOtp(data.otp);
    setStep('password');
  };

  // Step 3: Reset Password
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await resetPassword(email, otp, data.newPassword);
      toast.success(
        'Password updated! You can now sign in with your new password.'
      );
      navigate('/login', { state: { email } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ||
          'Unable to reset password. Please check your code and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image & Quote (Fixed) */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-10 w-1/2 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand-accent/70 to-brand-dark/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
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
              "Don't worry, we've got you covered."
            </blockquote>
            <p className="text-white/80 text-lg leading-relaxed">
              It happens to the best of us. Follow the simple steps to reset
              your password and get back to planning your next trip.
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

      {/* Right Side - Forgot Password Form (Scrollable) */}
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

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${
                step === 'email'
                  ? 'bg-brand-dark text-white ring-4 ring-white shadow-lg'
                  : step === 'otp' || step === 'password'
                    ? 'bg-brand-dark text-white'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              1
            </div>
            <div
              className={`w-24 h-1 -mx-2 transition-all duration-300 ${
                step === 'otp' || step === 'password'
                  ? 'bg-brand-dark'
                  : 'bg-slate-100'
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${
                step === 'otp'
                  ? 'bg-brand-dark text-white ring-4 ring-white shadow-lg'
                  : step === 'password'
                    ? 'bg-brand-dark text-white'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <div
              className={`w-24 h-1 -mx-2 transition-all duration-300 ${
                step === 'password' ? 'bg-brand-dark' : 'bg-slate-100'
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${
                step === 'password'
                  ? 'bg-brand-dark text-white ring-4 ring-white shadow-lg'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </div>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-3">
                  Forgot password?
                </h1>
                <p className="text-slate-500 text-lg">
                  Enter your email address and we'll send you a code to reset
                  your password.
                </p>
              </div>

              <form
                onSubmit={handleSubmitEmail(onEmailSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                    <input
                      {...registerEmail('email')}
                      type="email"
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all outline-none font-medium"
                      placeholder="name@example.com"
                    />
                  </div>
                  {emailErrors.email && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {emailErrors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-4 px-6 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send Reset Code'
                  )}
                </button>

                <div className="text-center mt-6">
                  <Link
                    to="/login"
                    className="text-slate-500 hover:text-slate-800 font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-3">
                  Check your email
                </h1>
                <p className="text-slate-500 text-lg">
                  We sent a code to{' '}
                  <span className="font-bold text-brand-dark">
                    {getValuesEmail('email')}
                  </span>
                </p>
              </div>

              <form
                onSubmit={handleSubmitOtp(onOtpSubmit)}
                className="space-y-8"
              >
                <div>
                  <input
                    {...registerOtp('otp')}
                    type="text"
                    maxLength={6}
                    className="block w-full px-4 py-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-300 focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all outline-none text-center text-4xl tracking-[0.5em] font-mono font-bold"
                    placeholder="000000"
                  />
                  {otpErrors.otp && (
                    <p className="mt-2 text-sm text-red-600 font-medium text-center">
                      {otpErrors.otp.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="w-1/3 py-4 px-6 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center py-4 px-6 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Verify Code'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-3">
                  Set new password
                </h1>
                <p className="text-slate-500 text-lg">
                  Create a strong password to secure your account.
                </p>
              </div>

              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                    <input
                      {...registerPassword('newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all outline-none font-medium"
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
                  <PasswordStrengthIndicator
                    password={watchPassword('newPassword') || ''}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                    <input
                      {...registerPassword('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all outline-none font-medium"
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-4 px-6 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
