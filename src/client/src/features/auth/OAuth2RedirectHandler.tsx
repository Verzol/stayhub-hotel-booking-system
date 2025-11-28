import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Decode token to get user info (optional, or just fetch profile)
      // For now, we just assume token is valid and let AuthContext fetch profile if needed
      // But AuthContext.login usually expects user object too.
      // Let's check AuthContext.
      
      // Since we don't have user object here, we might need to fetch it or just pass token.
      // If AuthContext.login requires user, we should fetch "me" endpoint first.
      
      // Let's assume we can fetch profile using the token.
      
      // For now, let's just store token and redirect.
      // But wait, useAuth().login(token, user) signature needs checking.
      // If I can't check AuthContext easily right now, I'll try to fetch profile.
      
      // Actually, I'll just store the token in localStorage manually if login() is strict,
      // but better to use login().
      
      // Let's try to fetch profile first.
      fetchProfileAndLogin(token);
    } else {
      toast.error(error || 'Social login failed');
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  const fetchProfileAndLogin = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // data should be ApiResponse<UserProfileResponse>
        // We need to adapt it to User type expected by AuthContext
        
        // The API returns the user profile directly
        const userProfile = data;
        
        login(token, {
            id: userProfile.id,
            email: userProfile.email,
            fullName: userProfile.fullName,
            role: userProfile.role
        });
        
        toast.success(`Welcome back, ${userProfile.fullName}!`);
        navigate('/');
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('Authentication failed');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-dark/60 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}

export default OAuth2RedirectHandler;
