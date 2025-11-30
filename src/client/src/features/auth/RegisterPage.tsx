import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Hotel,
  User,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import {
  register as registerApi,
  checkEmail,
} from '../../services/authService';
import { toast } from 'sonner';
import { PasswordStrengthIndicator } from '../../components/common/PasswordStrengthIndicator';

// Step 1: Email check
const emailSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ'),
});

// Step 2: Password & Info
const registerSchema = z
  .object({
    email: z.string().email('Địa chỉ email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Phải chứa ít nhất một chữ cái in hoa')
      .regex(/[a-z]/, 'Phải chứa ít nhất một chữ cái thường')
      .regex(/[0-9]/, 'Phải chứa ít nhất một chữ số')
      .regex(/[!@#$%^&*]/, 'Phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*)'),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(50, 'Họ tên không được vượt quá 50 ký tự'),
    phoneNumber: z
      .string()
      .regex(/^\d{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailValue, setEmailValue] = useState('');

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      gender: 'OTHER',
    },
  });

  // Step 1: Check email
  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const result = await checkEmail(data.email);
      if (result.exists) {
        emailForm.setError('email', {
          type: 'manual',
          message: 'Email này đã được đăng ký. Vui lòng đăng nhập.',
        });
      } else {
        setEmailValue(data.email);
        registerForm.setValue('email', data.email);
        setStep(2);
      }
    } catch {
      toast.error('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Register
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerApi({
        ...data,
        role: 'CUSTOMER',
      });

      toast.success(
        'Tài khoản đã được tạo! Vui lòng kiểm tra email để lấy mã xác thực.'
      );
      navigate('/verify-email', {
        state: {
          email: data.email,
          message:
            'Vui lòng nhập mã xác thực chúng tôi đã gửi đến email của bạn.',
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image & Quote (Fixed) */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-10 w-1/2 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand-accent/70 to-brand-dark/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
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
              "Tham gia cộng đồng du khách và chủ nhà trên khắp Việt Nam."
            </blockquote>
            <p className="text-white/80 text-lg leading-relaxed">
              Tạo tài khoản ngay hôm nay và bắt đầu khám phá những chỗ nghỉ độc
              đáo hoặc chia sẻ không gian của bạn với khách từ mọi nơi.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-medium">Miễn phí tham gia</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-medium">Hệ thống đặt phòng an toàn</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-medium">Hỗ trợ khách hàng 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form (Scrollable) */}
      <div className="w-full lg:w-1/2 lg:fixed lg:inset-y-0 lg:right-0 lg:ml-auto lg:overflow-y-auto bg-white">
        <div className="flex flex-col justify-center min-h-screen p-8 lg:p-24">
          <div className="w-full max-w-lg mx-auto">
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
                  step >= 1
                    ? 'bg-brand-dark text-white ring-4 ring-white shadow-lg'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </div>
              <div
                className={`w-24 h-1 -mx-2 transition-all duration-300 ${step >= 2 ? 'bg-brand-dark' : 'bg-slate-100'}`}
              />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${
                  step >= 2
                    ? 'bg-brand-dark text-white ring-4 ring-white shadow-lg'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <>
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-black text-slate-900 mb-3">
                    Tạo tài khoản
                  </h1>
                  <p className="text-slate-500 text-lg">
                    Nhập email của bạn để bắt đầu
                  </p>
                </div>

                <button
                  onClick={handleGoogleSignup}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Tiếp tục với Google
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">
                      hoặc tiếp tục với email
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                      Địa chỉ Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                      <input
                        type="email"
                        {...emailForm.register('email')}
                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium ${
                          emailForm.formState.errors.email
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-slate-200'
                        }`}
                        placeholder="name@example.com"
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <p className="mt-2 text-sm text-red-600 font-medium">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl font-bold shadow-lg shadow-brand-cta/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        Tiếp tục
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-slate-500 font-medium">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/login"
                    className="text-brand-accent hover:text-brand-dark font-bold transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </>
            )}

            {/* Step 2: Info */}
            {step === 2 && (
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-black text-slate-900 mb-2">
                    Hoàn tất thông tin
                  </h1>
                  <p className="text-slate-500">
                    cho{' '}
                    <span className="font-bold text-brand-dark">
                      {emailValue}
                    </span>
                  </p>
                </div>

                <form
                  onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                        Họ và Tên
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="text"
                          {...registerForm.register('fullName')}
                          className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium ${
                            registerForm.formState.errors.fullName
                              ? 'border-red-300 focus:ring-red-100'
                              : 'border-slate-200'
                          }`}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      {registerForm.formState.errors.fullName && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {registerForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                        Số Điện Thoại
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="tel"
                          {...registerForm.register('phoneNumber')}
                          className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium ${
                            registerForm.formState.errors.phoneNumber
                              ? 'border-red-300 focus:ring-red-100'
                              : 'border-slate-200'
                          }`}
                          placeholder="0912345678"
                        />
                      </div>
                      {registerForm.formState.errors.phoneNumber && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {registerForm.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                        Giới Tính
                      </label>
                      <div className="relative">
                        <select
                          {...registerForm.register('gender')}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 font-medium appearance-none"
                        >
                          <option value="OTHER">Khác</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* DOB */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                        Ngày Sinh
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="date"
                          {...registerForm.register('dateOfBirth')}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                        Địa Chỉ (tùy chọn)
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type="text"
                          {...registerForm.register('address')}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium"
                          placeholder="Địa chỉ của bạn"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                        Mật Khẩu
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...registerForm.register('password')}
                          className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium ${
                            registerForm.formState.errors.password
                              ? 'border-red-300 focus:ring-red-100'
                              : 'border-slate-200'
                          }`}
                          placeholder="Mật khẩu"
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
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                        Xác Nhận Mật Khẩu
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-accent transition-colors" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...registerForm.register('confirmPassword')}
                          className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400 font-medium ${
                            registerForm.formState.errors.confirmPassword
                              ? 'border-red-300 focus:ring-red-100'
                              : 'border-slate-200'
                          }`}
                          placeholder="Xác nhận mật khẩu"
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
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                          {
                            registerForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    {/* Password Strength - Full Width */}
                    <div className="md:col-span-2">
                      <PasswordStrengthIndicator
                        password={registerForm.watch('password') || ''}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-4 px-6 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 px-6 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl font-bold shadow-lg shadow-brand-cta/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        'Tạo Tài Khoản'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
