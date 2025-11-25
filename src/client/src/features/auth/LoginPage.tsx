import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, Lock, Hotel } from 'lucide-react';
import { login, checkEmail } from '../../services/authService';
import { toast } from 'sonner';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { exists } = await checkEmail(email);
      if (exists) {
        setStep('password');
      } else {
        // Redirect to register with email
        navigate('/register', { state: { email } });
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
    setIsLoading(true);
    try {
      const data = await login({ email, password });
      authLogin(data.token, {
        id: data.id,
        email: email,
        fullName: data.fullName,
        role: data.role,
      });
      toast.success(`Welcome back, ${data.fullName}!`);

      // Role-based redirection
      const userRole = data.role?.toUpperCase();
      console.log('=== LOGIN DEBUG ===');
      console.log('Full Login Response:', JSON.stringify(data, null, 2));
      console.log('Role from response:', data.role);
      console.log('Role after toUpperCase:', userRole);

      if (userRole === 'ADMIN') {
        console.log('Redirecting to /admin...');
        window.location.href = '/admin';
      } else if (userRole === 'HOST') {
        console.log('Redirecting to /host...');
        window.location.href = '/host';
      } else {
        console.log('Redirecting to /...');
        window.location.href = '/';
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Incorrect password.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-brand-bg via-brand-bg to-brand-bg overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-dark/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-cta/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 text-brand-dark font-semibold hover:bg-white hover:shadow-xl transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </Link>

      {/* Login Card with Glassmorphism */}
      <div className="relative w-full max-w-md p-8 mx-4 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
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
          <h1 className="text-3xl font-black text-brand-dark tracking-tight mb-2">
            {step === 'email' ? 'Sign in or Create account' : 'Welcome Back'}
          </h1>
          <p className="text-brand-dark/60 font-medium">
            {step === 'email'
              ? 'Enter your email to continue'
              : `Log in as ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleCheckEmail} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-brand-dark">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-brand-dark/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-white transition-all outline-none font-medium text-brand-dark placeholder:text-brand-dark/40"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Continue'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-brand-dark">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm text-brand-accent hover:text-brand-accent hover:underline font-medium transition-colors"
                >
                  Change email
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-brand-dark/20 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-white transition-all outline-none font-medium text-brand-dark placeholder:text-brand-dark/40"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-accent hover:text-brand-accent hover:underline font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-dark/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/70 text-brand-dark/50 font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-brand-dark/20 rounded-xl hover:bg-brand-dark/5 transition-colors font-medium text-brand-dark">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border border-brand-dark/20 rounded-xl hover:bg-brand-dark/5 transition-colors font-medium text-brand-dark">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.09.682-.218.682-.483 0-.237-.009-.866-.014-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.891 1.529 2.341 1.087 2.91.831.091-.646.349-1.086.635-1.337-2.22-.252-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.254-.447-1.27.097-2.646 0 0 .84-.269 2.75 1.025A9.548 9.548 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.392.1 2.646.64.698 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-brand-dark/50 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-accent hover:text-brand-accent font-semibold hover:underline"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
