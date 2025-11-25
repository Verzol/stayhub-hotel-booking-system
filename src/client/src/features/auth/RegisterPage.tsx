import { useState, useEffect } from 'react';
import { register } from '../../services/authService';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Phone,
  Mail,
  Lock,
  User,
  MapPin,
  Calendar,
  Loader2,
} from 'lucide-react';

// Zod Schema Definition
const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
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
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must not exceed 50 characters')
      .regex(/^[\p{L}\s]+$/u, 'Full name must contain only letters and spaces'),
    phoneNumber: z
      .string()
      .regex(/^\d{10,11}$/, 'Phone number must be 10-11 digits'),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    role: z.literal('CUSTOMER'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    setError,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: location.state?.email || '',
      fullName: '',
      password: '',
      confirmPassword: '',
      role: 'CUSTOMER',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: 'OTHER',
    },
  });

  // Watch email to redirect if missing
  const emailValue = watch('email');

  useEffect(() => {
    if (!emailValue && !location.state?.email) {
      navigate('/login');
    } else if (location.state?.email) {
      setValue('email', location.state.email);
    }
  }, [emailValue, navigate, location.state, setValue]);

  const handleNextStep = async () => {
    const isStep1Valid = await trigger(['password', 'confirmPassword']);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = data;
      const finalPayload = {
        ...payload,
        dateOfBirth:
          payload.dateOfBirth === '' ? undefined : payload.dateOfBirth,
      };
      await register(finalPayload);
      toast.success('Account created successfully! You can now login.');
      navigate('/login');
    } catch (error: unknown) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorResponse = (error as any).response?.data;
      const message = errorResponse?.message || 'Registration failed.';

      if (message.toLowerCase().includes('email')) {
        setError('email', { type: 'manual', message: message });
        setStep(1); // Go back to step 1 to show email error
      } else if (message.toLowerCase().includes('phone')) {
        setError('phoneNumber', { type: 'manual', message: message });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#F2F3F3]">
      <Link
        to="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 font-bold hover:text-cyan-500 hover:shadow-lg transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Login</span>
      </Link>

      <div className="relative w-full max-w-lg p-8 mx-4 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-slate-500 font-medium">
            Step {step} of 2: {step === 1 ? 'Security' : 'Personal Details'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {step === 1 ? (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...registerField('email')}
                    disabled
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    {...registerField('password')}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                      errors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Min 8 chars, 1 Uppercase, 1 Special"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    {...registerField('confirmPassword')}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                      errors.confirmPassword
                        ? 'border-red-500'
                        : 'border-slate-300'
                    }`}
                    placeholder="Re-enter password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all"
              >
                Next Step
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...registerField('fullName')}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                      errors.fullName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      {...registerField('dateOfBirth')}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Gender
                  </label>
                  <select
                    {...registerField('gender')}
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    {...registerField('phoneNumber')}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="0123 456 789"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...registerField('address')}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    placeholder="123 Main St, City"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="flex-[2] py-3.5 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
