import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F2F3F3] font-sans text-slate-800">
      <Navbar />

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
