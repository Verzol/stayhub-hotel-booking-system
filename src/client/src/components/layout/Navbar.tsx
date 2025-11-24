import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Globe,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Hotel,
  Percent,
} from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function Navbar({ onOpenLogin, onOpenRegister }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = location.pathname === '/';
  const showScrolledStyle = isScrolled || !isHomePage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Hotels', icon: Hotel },
    { name: 'Villas & Apts', icon: Hotel },
    { name: 'Deals', icon: Percent },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showScrolledStyle ? 'bg-white shadow-md py-3' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <svg
                  fill="white"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
                </svg>
              </div>
              <span
                className={`text-2xl font-black tracking-tighter ${
                  showScrolledStyle ? 'text-slate-900' : 'text-white'
                }`}
              >
                StayHub
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className={`text-sm font-bold hover:text-blue-500 transition-colors flex items-center gap-1 ${
                    showScrolledStyle ? 'text-slate-600' : 'text-white/90'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <div
              className={`hidden md:flex items-center gap-1 text-sm font-bold cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg transition-colors ${
                showScrolledStyle ? 'text-slate-600' : 'text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>EN | VND</span>
              <ChevronDown className="w-3 h-3" />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span
                  className={`hidden sm:block font-bold text-sm ${
                    showScrolledStyle ? 'text-slate-700' : 'text-white'
                  }`}
                >
                  {user?.fullName}
                </span>
                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <UserIcon className="w-5 h-5" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    showScrolledStyle
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-white hover:bg-white/10 border border-white/30'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
