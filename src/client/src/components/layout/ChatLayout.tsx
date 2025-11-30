import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function ChatLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />
      {/* Chat pages with padding-top to avoid Navbar overlap */}
      <div className="pt-20">
        <Outlet />
      </div>
    </div>
  );
}
