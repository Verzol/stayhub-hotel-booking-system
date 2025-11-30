import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { logout as logoutApi } from '../services/authService';
import { toast } from 'sonner';
import type { User } from '../types/auth';
import LogoutHandler from './LogoutHandler';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    // Initialize auth state on mount
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token: string, user: User) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth data:', error);
      toast.error('Failed to save login information');
    }
  };

  const updateUser = (user: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const logout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    // Delay state update to allow navigation to take effect
    setTimeout(() => {
      try {
        logoutApi();
        setUser(null);
        setIsAuthenticated(false);
        toast.info('You have been logged out.');
        // Force page reload to clear all state
        window.location.href = '/';
      } catch (error) {
        console.error('Error during logout:', error);
        // Still clear local state even if API call fails
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/';
      }
    }, 100);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, updateUser, loading }}
    >
      {children}
      <LogoutHandler
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
