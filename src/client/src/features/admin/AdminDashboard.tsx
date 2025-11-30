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
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
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
      toast.error('Không thể tải danh sách người dùng');
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
        `Người dùng đã ${currentStatus ? 'bị vô hiệu hóa' : 'được kích hoạt'}`
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleChangeRole = async (
    userId: number,
    newRole: 'CUSTOMER' | 'ADMIN' | 'HOST'
  ) => {
    try {
      await changeUserRole(userId, newRole);
      toast.success(`Đã cập nhật vai trò thành ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Không thể cập nhật vai trò người dùng');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.'
      )
    )
      return;
    try {
      await deleteUser(userId);
      toast.success('Đã xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Không thể xóa người dùng');
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

  return (
    <div className="min-h-screen bg-[#F2F3F3] font-sans text-slate-800">
      <Navbar />
      <div className="min-h-screen bg-brand-bg pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Similar to Profile Page */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left - User Info */}
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-600/20 overflow-hidden ring-4 ring-white">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-black text-brand-dark">
                      {user?.fullName || 'Admin Dashboard'}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-sm flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Về trang chủ
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +12%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.totalUsers}
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                Tổng người dùng
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +8%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.activeUsers}
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                Người dùng hoạt động
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +24%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">
                {stats.hosts}
              </h3>
              <p className="text-slate-500 font-medium text-sm">Chủ nhà</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <span className="flex items-center px-2.5 py-1 rounded-full bg-green-50 text-xs font-bold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +18%
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">0 ₫</h3>
              <p className="text-slate-500 font-medium text-sm">
                Tổng doanh thu
              </p>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Section Header */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Quản lý người dùng
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Quản lý tất cả người dùng đã đăng ký
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
                    Làm mới
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm">
                    <Download className="w-4 h-4" />
                    Xuất
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 font-bold text-sm hover:scale-105 active:scale-95">
                    <UserPlus className="w-4 h-4" />
                    Thêm người dùng
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <div className="relative flex-1 group">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-accent transition-colors" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng theo tên hoặc email..."
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
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="ADMIN">Admin</option>
                    <option value="HOST">Host</option>
                    <option value="CUSTOMER">Khách hàng</option>
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
                      Người dùng
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tham gia
                    </th>
                    <th className="text-right px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Hành động
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
                            Đang tải người dùng...
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
                            Không tìm thấy người dùng
                          </p>
                          <p className="text-slate-500 mt-1">
                            Thử điều chỉnh tìm kiếm hoặc bộ lọc
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
                            {u.enabled ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN', {
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
                              title={u.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            >
                              <Shield className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Xóa người dùng"
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
                Hiển thị{' '}
                <span className="font-bold text-slate-900">
                  {filteredUsers.length}
                </span>{' '}
                trong tổng số{' '}
                <span className="font-bold text-slate-900">{users.length}</span>{' '}
                người dùng
              </p>
              <div className="flex items-center gap-3">
                <button
                  disabled
                  className="px-4 py-2 text-sm font-bold text-slate-400 bg-white border border-slate-200 rounded-lg cursor-not-allowed shadow-sm"
                >
                  Trước
                </button>
                <button className="px-4 py-2 text-sm font-bold text-white bg-brand-dark hover:bg-brand-accent rounded-lg transition-colors shadow-lg shadow-brand-dark/20">
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
