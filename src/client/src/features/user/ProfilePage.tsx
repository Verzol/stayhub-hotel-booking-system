import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getProfile,
  updateProfile,
  changePassword,
  sendVerificationEmail,
} from '../../services/userService';
import type {
  UserProfile,
  UpdateProfileRequest,
} from '../../services/userService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Heart,
  Clock,
  ChevronRight,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/userUtils';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Personal Data State
  const [personalData, setPersonalData] = useState<UpdateProfileRequest>({
    fullName: '',
    gender: 'OTHER',
    address: '',
    dateOfBirth: '',
    phoneNumber: '',
  });
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmationPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setPersonalData({
        fullName: data.fullName || '',
        gender: data.gender || 'OTHER',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth || '',
        phoneNumber: data.phoneNumber || '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personalData.fullName?.trim()) {
      toast.error('Full Name is required.');
      return;
    }

    setSavingPersonal(true);
    try {
      const payload = {
        ...personalData,
        dateOfBirth:
          personalData.dateOfBirth === ''
            ? undefined
            : personalData.dateOfBirth,
      };
      const updatedUser = await updateProfile(payload);
      setProfile(updatedUser);
      setIsEditingPersonal(false);
      toast.success('Profile updated successfully.');
    } catch (error) {
      console.error(error);
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!passwordData.currentPassword) {
      errors.push('Current password is required.');
    }
    if (!passwordData.newPassword) {
      errors.push('New password is required.');
    } else {
      const passwordRegex =
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(passwordData.newPassword)) {
        errors.push(
          'Password must be 8+ chars with uppercase, lowercase, number, and special char.'
        );
      }
    }
    if (passwordData.newPassword !== passwordData.confirmationPassword) {
      errors.push('Passwords do not match.');
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmationPassword: '',
      });
      toast.success('Password changed successfully.');
    } catch (error) {
      console.error(error);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    if (!profile?.email) return;
    setSendingVerification(true);
    try {
      await sendVerificationEmail(profile.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error(error);
    } finally {
      setSendingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const quickLinks = [
    {
      icon: Calendar,
      label: 'Đặt phòng của tôi',
      desc: 'Xem lịch sử đặt phòng',
      count: 0,
      href: '/bookings',
      show: user?.role === 'CUSTOMER',
    },
    {
      icon: MessageCircle,
      label: 'Tin nhắn',
      desc: 'Cuộc trò chuyện của bạn',
      count: 0,
      href: '/chat',
      show: true,
    },
    {
      icon: Heart,
      label: 'Đã lưu',
      desc: 'Xem danh sách yêu thích',
      count: 0,
      href: '/wishlist',
      show: true,
    },
    {
      icon: Clock,
      label: 'Lịch sử',
      desc: 'Đặt phòng đã qua',
      count: 0,
      href: '/bookings',
      show: user?.role === 'CUSTOMER',
    },
  ].filter((link) => link.show);

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-dark to-brand-accent rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-brand-dark/20 overflow-hidden ring-4 ring-white">
                {getAvatarUrl(profile) ? (
                  <img
                    src={getAvatarUrl(profile)}
                    alt={profile?.fullName || 'User'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  profile?.fullName?.charAt(0) || 'U'
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-black text-brand-dark">
                  {profile?.fullName}
                </h1>
                {profile?.emailVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-lg mb-4 font-medium">
                {profile?.email}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                  <User className="w-4 h-4 text-brand-accent" />
                  {user?.role || 'Customer'}
                </span>
                {profile?.phoneNumber && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                    <Phone className="w-4 h-4 text-brand-accent" />
                    {profile.phoneNumber}
                  </span>
                )}
                {profile?.address && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                    <MapPin className="w-4 h-4 text-brand-accent" />
                    {profile.address}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!profile?.emailVerified && (
                <button
                  onClick={handleSendVerification}
                  disabled={sendingVerification}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {sendingVerification ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                  Verify Email
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Quick Links */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">
                Quick Links
              </h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => link.href && navigate(link.href)}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center group-hover:bg-brand-accent group-hover:text-white transition-all text-brand-accent">
                      <link.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-slate-900">{link.label}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {link.desc}
                      </p>
                    </div>
                    {link.count > 0 && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                        {link.count}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
              <div className="border-b border-slate-100">
                <div className="flex p-2 gap-2 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(tab.id as 'profile' | 'security')
                      }
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/30'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Personal Information
                        </h3>
                        <p className="text-slate-500 font-medium mt-1">
                          Update your personal details
                        </p>
                      </div>
                      {!isEditingPersonal ? (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="flex items-center gap-2 px-5 py-2.5 text-brand-accent bg-brand-accent/5 hover:bg-brand-accent/10 rounded-xl transition-all font-bold"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditingPersonal(false)}
                          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSavePersonal}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                            Full Name
                          </label>
                          {isEditingPersonal ? (
                            <input
                              type="text"
                              value={personalData.fullName}
                              onChange={(e) =>
                                setPersonalData({
                                  ...personalData,
                                  fullName: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all font-medium"
                            />
                          ) : (
                            <p className="px-4 py-3.5 bg-slate-50 rounded-xl text-slate-900 font-medium border border-transparent">
                              {profile?.fullName || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                            Email Address
                          </label>
                          <p className="px-4 py-3.5 bg-slate-50 rounded-xl text-slate-500 flex items-center gap-2 font-medium border border-transparent">
                            <Mail className="w-4 h-4" />
                            {profile?.email}
                            <Lock className="w-3 h-3 ml-auto text-slate-400" />
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                            Phone Number
                          </label>
                          {isEditingPersonal ? (
                            <input
                              type="tel"
                              value={personalData.phoneNumber}
                              onChange={(e) =>
                                setPersonalData({
                                  ...personalData,
                                  phoneNumber: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all font-medium"
                            />
                          ) : (
                            <p className="px-4 py-3.5 bg-slate-50 rounded-xl text-slate-900 font-medium border border-transparent">
                              {profile?.phoneNumber || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                            Date of Birth
                          </label>
                          {isEditingPersonal ? (
                            <input
                              type="date"
                              value={personalData.dateOfBirth}
                              onChange={(e) =>
                                setPersonalData({
                                  ...personalData,
                                  dateOfBirth: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all font-medium"
                            />
                          ) : (
                            <p className="px-4 py-3.5 bg-slate-50 rounded-xl text-slate-900 flex items-center gap-2 font-medium border border-transparent">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {profile?.dateOfBirth || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                            Gender
                          </label>
                          {isEditingPersonal ? (
                            <div className="relative">
                              <select
                                value={personalData.gender}
                                onChange={(e) =>
                                  setPersonalData({
                                    ...personalData,
                                    gender: e.target.value as
                                      | 'MALE'
                                      | 'FEMALE'
                                      | 'OTHER',
                                  })
                                }
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all font-medium appearance-none"
                              >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                              </div>
                            </div>
                          ) : (
                            <p className="px-4 py-3.5 bg-slate-50 rounded-xl text-slate-900 font-medium border border-transparent">
                              {profile?.gender || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                            Address
                          </label>
                          {isEditingPersonal ? (
                            <input
                              type="text"
                              value={personalData.address}
                              onChange={(e) =>
                                setPersonalData({
                                  ...personalData,
                                  address: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all font-medium"
                            />
                          ) : (
                            <p className="px-4 py-3.5 bg-slate-50 rounded-xl text-slate-900 flex items-center gap-2 font-medium border border-transparent">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {profile?.address || '-'}
                            </p>
                          )}
                        </div>
                      </div>

                      {isEditingPersonal && (
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsEditingPersonal(false)}
                            className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingPersonal}
                            className="px-8 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 hover:-translate-y-0.5 font-bold flex items-center gap-2"
                          >
                            {savingPersonal ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Save Changes
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-slate-900">
                        Change Password
                      </h3>
                      <p className="text-slate-500 font-medium mt-1">
                        Ensure your account stays secure
                      </p>
                    </div>

                    <form
                      onSubmit={handleSavePassword}
                      className="space-y-6 max-w-2xl"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all pr-12 font-medium"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all pr-12 font-medium"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                          8+ characters, uppercase, lowercase, number, and
                          special character
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmationPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmationPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-accent/10 focus:border-brand-accent outline-none transition-all pr-12 font-medium"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={savingPassword}
                          className="px-8 py-3 bg-brand-cta hover:bg-brand-cta-hover text-white rounded-xl transition-all shadow-lg shadow-brand-cta/30 hover:-translate-y-0.5 font-bold flex items-center gap-2"
                        >
                          {savingPassword ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
