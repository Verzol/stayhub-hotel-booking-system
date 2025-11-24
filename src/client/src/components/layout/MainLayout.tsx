import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LoginModal from '../../features/auth/LoginModal';
import RegisterModal from '../../features/auth/RegisterModal';

export default function MainLayout() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F2F3F3] font-sans text-slate-800">
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={openRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={openLogin}
      />

      <Navbar onOpenLogin={openLogin} onOpenRegister={openRegister} />

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
