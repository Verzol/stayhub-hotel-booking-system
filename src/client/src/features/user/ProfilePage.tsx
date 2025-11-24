import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getProfile,
  updateProfile,
  changePassword,
  sendVerificationEmail,
  type UserProfile,
  type UpdateProfileRequest,
} from '../../services/userService';
import {
  User,
  Mail,
  Phone,
  Loader2,
  Edit2,
  Plus,
  Save,
  X,
  Lock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  // Personal Data State
  const [personalData, setPersonalData] = useState<UpdateProfileRequest>({
    fullName: '',
    gender: 'OTHER',
    address: '',
    dateOfBirth: '',
  });
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Contact State
  const [phoneInput, setPhoneInput] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmationPassword: '',
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setPersonalData({
        fullName: data.fullName || '',
        gender: data.gender || 'OTHER',
        address: data.address || '',
        dateOfBirth: data.dateOfBirth || '',
      });
      setPhoneInput(data.phoneNumber || '');
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
    if (!personalData.address?.trim()) {
      toast.error('Address is required.');
      return;
    }

    setSavingPersonal(true);
    try {
      const payload = {
        ...personalData,
        phoneNumber: user?.phoneNumber, // Keep existing phone
        dateOfBirth:
          personalData.dateOfBirth === ''
            ? undefined
            : personalData.dateOfBirth,
      };
      const updatedUser = await updateProfile(payload);
      setUser(updatedUser);
      setIsEditingPersonal(false);
      toast.success('Profile updated successfully.');
    } catch (error) {
      console.error(error);
      // Global interceptor handles the error toast
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneInput.trim()) {
      toast.error('Phone number is required.');
      return;
    }

    setSavingPhone(true);
    try {
      const payload = {
        fullName: user?.fullName || '',
        gender: user?.gender,
        address: user?.address,
        dateOfBirth: user?.dateOfBirth,
        phoneNumber: phoneInput,
      };
      const updatedUser = await updateProfile(payload);
      setUser(updatedUser);
      setIsEditingPhone(false);
      toast.success('Phone number updated.');
    } catch (error) {
      console.error(error);
      // Global interceptor handles the error toast
    } finally {
      setSavingPhone(false);
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
          'New password must be at least 8 characters, include uppercase, lowercase, number, and special char (!@#$%^&*).'
        );
      }
    }
    if (!passwordData.confirmationPassword) {
      errors.push('Please confirm your new password.');
    }
    if (
      passwordData.newPassword &&
      passwordData.confirmationPassword &&
      passwordData.newPassword !== passwordData.confirmationPassword
    ) {
      errors.push('New passwords do not match.');
    }

    if (errors.length > 0) {
      toast.error(
        <ul className="list-disc pl-4">
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      );
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(passwordData);
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmationPassword: '',
      });
      toast.success('Password changed successfully.');
    } catch (error) {
      console.error(error);
      // Global interceptor handles the error toast
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    if (!user?.email) return;
    setSendingVerification(true);
    try {
      await sendVerificationEmail(user.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error(error);
      // Global interceptor handles error toast
    } finally {
      setSendingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F3F3] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Personal Info
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your personal information and contact details
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
        </div>

        {/* Card 1: Personal Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Personal Data
              </h2>
            </div>
            {!isEditingPersonal ? (
              <button
                onClick={() => setIsEditingPersonal(true)}
                className="text-blue-600 font-medium hover:text-blue-700 text-sm"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditingPersonal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6">
            {isEditingPersonal ? (
              <form
                onSubmit={handleSavePersonal}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={personalData.fullName}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        dateOfBirth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Gender
                  </label>
                  <select
                    value={personalData.gender}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER',
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={personalData.address}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPersonal}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {savingPersonal ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Full Name</p>
                  <p className="font-medium text-slate-900">
                    {user?.fullName || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                  <p className="font-medium text-slate-900">
                    {user?.dateOfBirth || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Gender</p>
                  <p className="font-medium text-slate-900 capitalize">
                    {user?.gender?.toLowerCase() || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Address</p>
                  <p className="font-medium text-slate-900">
                    {user?.address || 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Email (Read Only) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Email Address
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!user?.emailVerified && (
              <button
                onClick={handleSendVerification}
                disabled={sendingVerification}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingVerification && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                Verify Now
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Contact Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Phone className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Contact Info</h2>
            </div>
          </div>

          <div className="p-6">
            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPhone}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {savingPhone ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Phone Number</p>
                  {user?.phoneNumber ? (
                    <p className="font-medium text-slate-900">
                      {user.phoneNumber}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">
                      No phone number added
                    </p>
                  )}
                </div>
                {user?.phoneNumber ? (
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Number
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Change Password
              </h2>
            </div>
            {!isEditingPassword ? (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-blue-600 font-medium hover:text-blue-700 text-sm"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditingPassword(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6">
            {isEditingPassword ? (
              <form
                onSubmit={handleSavePassword}
                className="grid grid-cols-1 gap-6"
              >
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmationPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmationPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {savingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-slate-500 text-sm">
                For security reasons, you cannot view your password here. To
                change your password, click on "Edit" to set a new password.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
