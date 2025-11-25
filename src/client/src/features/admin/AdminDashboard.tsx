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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">StayHub</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.active
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">
                Welcome back, {user?.fullName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-500" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.totalUsers}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Total Users</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.activeUsers}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Active Users</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +24%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.hosts}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Property Hosts</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <span className="flex items-center text-sm text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +18%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">$0</h3>
              <p className="text-slate-500 text-sm mt-1">Total Revenue</p>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            {/* Section Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    User Management
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage all registered users
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-slate-50"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-slate-50 appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admins</option>
                    <option value="HOST">Hosts</option>
                    <option value="CUSTOMER">Customers</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
                          <p className="text-slate-500">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 text-slate-300 mb-3" />
                          <p className="text-slate-500 font-medium">
                            No users found
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            Try adjusting your search or filter
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                                u.role === 'ADMIN'
                                  ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                                  : u.role === 'HOST'
                                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-500'
                                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                              }`}
                            >
                              {u.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {u.fullName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'HOST'
                                  ? 'bg-cyan-100 text-cyan-600'
                                  : 'bg-slate-100 text-slate-700'
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
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              u.enabled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${u.enabled ? 'bg-green-500' : 'bg-red-500'}`}
                            ></span>
                            {u.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
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
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-cyan-400 outline-none cursor-pointer"
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
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{users.length}</span> users
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors">
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
