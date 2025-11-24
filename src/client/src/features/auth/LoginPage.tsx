import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
        id: 0,
        email: email,
        fullName: data.fullName,
        role: 'CUSTOMER',
      });
      toast.success(`Welcome back, ${data.fullName}!`);
      navigate('/');
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
    <div className="min-h-screen flex items-center justify-center relative bg-[#F2F3F3]">
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 font-bold hover:text-blue-600 hover:shadow-lg transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </Link>

      <div className="relative w-full max-w-md p-8 mx-4 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {step === 'email' ? 'Sign in or Create account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 font-medium">
            {step === 'email'
              ? 'Enter your email to continue'
              : `Log in as ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleCheckEmail} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-slate-900"
                placeholder="name@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Change email
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none font-medium text-slate-900"
                placeholder="Enter your password"
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Log In'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
