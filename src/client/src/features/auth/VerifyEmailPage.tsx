import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../services/userService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  const [message, setMessage] = useState(
    token ? 'Verifying your email...' : 'Invalid verification link.'
  );

  const verifyCalled = useRef(false);

  useEffect(() => {
    if (!token) return;

    if (verifyCalled.current) return;
    verifyCalled.current = true;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified!');
      } catch (error: unknown) {
        setStatus('error');
        const err = error as { response?: { data?: { message?: string } } };
        setMessage(
          err.response?.data?.message ||
            'Failed to verify email. The link may be invalid or expired.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F3F3] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="mb-6 flex justify-center">
          <div
            className={`p-4 rounded-full ${
              status === 'loading'
                ? 'bg-blue-50 text-blue-600'
                : status === 'success'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
            }`}
          >
            {status === 'loading' && (
              <Loader2 className="w-8 h-8 animate-spin" />
            )}
            {status === 'success' && <CheckCircle className="w-8 h-8" />}
            {status === 'error' && <XCircle className="w-8 h-8" />}
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p className="text-slate-500 mb-8">{message}</p>

        <div className="space-y-3">
          {status === 'success' && (
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              Continue to Login
            </Link>
          )}

          <Link
            to="/"
            className="block w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
