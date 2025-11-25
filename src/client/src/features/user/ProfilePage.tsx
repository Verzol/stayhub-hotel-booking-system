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
  Camera,
  Edit3,
  Save,
  X,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  Settings,
  CreditCard,
  Heart,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'preferences'
  >('profile');
  const { user } = useAuth();

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
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  const quickLinks = [
    {
      icon: Heart,
      label: 'Saved Properties',
      desc: 'View your wishlist',
      count: 12,
    },
    {
      icon: Clock,
      label: 'Booking History',
      desc: 'Past reservations',
      count: 5,
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      desc: 'Manage cards',
      count: 2,
    },
    { icon: Bell, label: 'Notifications', desc: 'Alert settings', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile?.fullName?.charAt(0) || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 transition-colors">
                <Camera className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {profile?.fullName}
                </h1>
                {profile?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-slate-500 mb-3">{profile?.email}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-500 rounded-full font-medium">
                  <User className="w-4 h-4" />
                  {user?.role || 'Customer'}
                </span>
                {profile?.phoneNumber && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phoneNumber}
                  </span>
                )}
                {profile?.address && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
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
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {sendingVerification ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Verify Email
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Quick Links */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                      <link.icon className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900">{link.label}</p>
                      <p className="text-xs text-slate-500">{link.desc}</p>
                    </div>
                    {link.count > 0 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {link.count}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Member Since</span>
                  <span className="font-medium text-slate-900">
                    {profile?.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(profile.dateOfBirth).getFullYear()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Bookings</span>
                  <span className="font-medium text-slate-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reviews Given</span>
                  <span className="font-medium text-slate-900">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(
                          tab.id as 'profile' | 'security' | 'preferences'
                        )
                      }
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-cyan-500 border-b-2 border-cyan-500'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Personal Information
                        </h3>
                        <p className="text-sm text-slate-500">
                          Update your personal details
                        </p>
                      </div>
                      {!isEditingPersonal ? (
                        <button
                          onClick={() => setIsEditingPersonal(true)}
                          className="flex items-center gap-2 px-4 py-2 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors font-medium"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditingPersonal(false)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSavePersonal}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
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
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                            />
                          ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">
                              {profile?.fullName || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address
                          </label>
                          <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-500 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {profile?.email}
                            <Lock className="w-3 h-3 ml-auto text-slate-400" />
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
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
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                            />
                          ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">
                              {profile?.phoneNumber || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
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
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                            />
                          ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {profile?.dateOfBirth || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Gender
                          </label>
                          {isEditingPersonal ? (
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
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-white"
                            >
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                            </select>
                          ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">
                              {profile?.gender || '-'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
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
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all"
                            />
                          ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {profile?.address || '-'}
                            </p>
                          )}
                        </div>
                      </div>

                      {isEditingPersonal && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsEditingPersonal(false)}
                            className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingPersonal}
                            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
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
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900">
                        Change Password
                      </h3>
                      <p className="text-sm text-slate-500">
                        Ensure your account stays secure
                      </p>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all pr-12"
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all pr-12"
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
                        <p className="text-xs text-slate-500 mt-2">
                          8+ characters, uppercase, lowercase, number, and
                          special character
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all pr-12"
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
                          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
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

                    {/* Two-Factor Auth Section */}
                    <div className="mt-8 pt-8 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            Two-Factor Authentication
                          </h4>
                          <p className="text-sm text-slate-500">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            label: 'Email Notifications',
                            desc: 'Receive booking updates via email',
                          },
                          {
                            label: 'SMS Notifications',
                            desc: 'Get text messages for urgent updates',
                          },
                          {
                            label: 'Marketing Emails',
                            desc: 'Receive deals and promotions',
                          },
                          {
                            label: 'Push Notifications',
                            desc: 'Browser notifications for new messages',
                          },
                        ].map((pref, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {pref.label}
                              </p>
                              <p className="text-sm text-slate-500">
                                {pref.desc}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                defaultChecked={idx < 2}
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Display Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Language
                          </label>
                          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-white">
                            <option>English</option>
                            <option>Vietnamese</option>
                            <option>Chinese</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Currency
                          </label>
                          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all bg-white">
                            <option>USD ($)</option>
                            <option>VND (₫)</option>
                            <option>EUR (€)</option>
                          </select>
                        </div>
                      </div>
                    </div>
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
