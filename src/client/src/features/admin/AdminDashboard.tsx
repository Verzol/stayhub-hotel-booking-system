import { useEffect, useState } from 'react';
import {
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
  deleteUser,
} from '../../services/userService';
import type { UserListResponse } from '../../services/userService';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  CreditCard,
  TrendingUp,
  Activity,
  ChevronDown,
  RefreshCw,
  Download,
  Settings,
  Bell,
  BarChart3,
  Home,
  Calendar,
  MessageSquare,
  FileText,
  HelpCircle,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId);
      toast.success(
        `User ${currentStatus ? 'disabled' : 'enabled'} successfully`
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user status');
    }
  };

  const handleChangeRole = async (
    userId: number,
    newRole: 'CUSTOMER' | 'ADMIN' | 'HOST'
  ) => {
    try {
      await changeUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    )
      return;
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.enabled).length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    hosts: users.filter((u) => u.role === 'HOST').length,
    customers: users.filter((u) => u.role === 'CUSTOMER').length,
  };

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Users, label: 'Users', active: false },
    { icon: Building2, label: 'Properties', active: false },
    { icon: Calendar, label: 'Bookings', active: false },
    { icon: CreditCard, label: 'Transactions', active: false },
    { icon: MessageSquare, label: 'Messages', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: FileText, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-40 shadow-2xl overflow-hidden`}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-brand-dark/50 pointer-events-none"></div>

        {/* Logo */}
        <div className="relative p-6 border-b border-slate-800/50 flex items-center justify-between z-10">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-dark rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">StayHub</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-4 space-y-2 z-10 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                item.active
                  ? 'bg-gradient-to-r from-brand-accent to-brand-dark text-white shadow-lg shadow-brand-accent/25 font-bold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  item.active
                    ? 'text-white'
                    : 'text-slate-500 group-hover:text-white'
                }`}
              />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="relative p-4 border-t border-slate-800/50 space-y-4 z-10 bg-slate-900/50 backdrop-blur-sm">
          <div
            className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/10">
              <span className="text-white font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-white">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${
          sidebarOpen ? 'ml-72' : 'ml-24'
        } transition-all duration-300 min-h-screen flex flex-col`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Welcome back, {user?.fullName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2.5 text-slate-500 hover:text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-all relative group">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-500 hover:text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-all">
                <HelpCircle className="w-6 h-6" />
              </button>
              <button className="p-2.5 text-slate-500 hover:text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-all">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,182,212,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 transition-colors duration-300">
                  <Users className="w-7 h-7 text-cyan-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +12%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.totalUsers}
              </h3>
              <p className="text-slate-500 font-medium">Total Users</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                  <Activity className="w-7 h-7 text-green-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +8%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.activeUsers}
              </h3>
              <p className="text-slate-500 font-medium">Active Users</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(139,92,246,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-300">
                  <Building2 className="w-7 h-7 text-purple-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +24%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.hosts}
              </h3>
              <p className="text-slate-500 font-medium">Property Hosts</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(249,115,22,0.1)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <CreditCard className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +18%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">$0</h3>
              <p className="text-slate-500 font-medium">Total Revenue</p>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Section Header */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    User Management
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Manage all registered users
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold text-sm hover:scale-105 active:scale-95">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <div className="relative flex-1 group">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <div className="relative group">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-11 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer font-medium"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admins</option>
                    <option value="HOST">Hosts</option>
                    <option value="CUSTOMER">Customers</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-right px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="w-10 h-10 text-brand-accent animate-spin mb-4" />
                          <p className="text-slate-500 font-medium">
                            Loading users...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-900 font-bold text-lg">
                            No users found
                          </p>
                          <p className="text-slate-500 mt-1">
                            Try adjusting your search or filter
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                                u.role === 'ADMIN'
                                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                  : u.role === 'HOST'
                                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-600'
                                    : 'bg-gradient-to-br from-slate-400 to-slate-600'
                              }`}
                            >
                              {u.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {u.fullName}
                              </p>
                              <p className="text-sm text-slate-500 font-medium">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : u.role === 'HOST'
                                  ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {u.role === 'ADMIN' && (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            )}
                            {u.role === 'HOST' && (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            {u.role === 'CUSTOMER' && (
                              <UserCog className="w-3.5 h-3.5" />
                            )}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                              u.enabled
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${u.enabled ? 'bg-green-500' : 'bg-red-500'}`}
                            ></span>
                            {u.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleChangeRole(
                                  u.id,
                                  e.target.value as
                                    | 'CUSTOMER'
                                    | 'ADMIN'
                                    | 'HOST'
                                )
                              }
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-accent outline-none cursor-pointer font-medium"
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="HOST">Host</option>
                              <option value="ADMIN">Admin</option>
                            </select>

                            <button
                              onClick={() =>
                                handleToggleStatus(u.id, u.enabled)
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                u.enabled
                                  ? 'text-orange-600 hover:bg-orange-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={u.enabled ? 'Disable User' : 'Enable User'}
                            >
                              <Shield className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p className="text-sm text-slate-500 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-900">
                  {filteredUsers.length}
                </span>{' '}
                of{' '}
                <span className="font-bold text-slate-900">{users.length}</span>{' '}
                users
              </p>
              <div className="flex items-center gap-3">
                <button
                  disabled
                  className="px-4 py-2 text-sm font-bold text-slate-400 bg-white border border-slate-200 rounded-lg cursor-not-allowed shadow-sm"
                >
                  Previous
                </button>
                <button className="px-4 py-2 text-sm font-bold text-white bg-brand-dark hover:bg-brand-accent rounded-lg transition-colors shadow-lg shadow-brand-dark/20">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
