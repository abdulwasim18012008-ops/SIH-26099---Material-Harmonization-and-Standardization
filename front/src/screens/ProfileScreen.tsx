import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const ProfileScreen: React.FC = () => {
  const { currentUser, logout, showToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [organization, setOrganization] = useState(
    currentUser?.organization || 'NCMH'
  );

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f5f1ea] flex items-center justify-center p-6">
        <div className="bg-white border border-[#e4e0d8] rounded-2xl p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#a5555a]">
            person_off
          </span>

          <h2 className="mt-4 text-xl font-bold text-[#2e3230]">
            No Profile Found
          </h2>

          <p className="mt-2 text-sm text-[#4a4e4a]">
            Please sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';

      case 'reviewer':
        return 'Material Reviewer';

      case 'analyst':
        return 'Data Analyst';

      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full platform administration and governance access.';

      case 'reviewer':
        return 'Reviews AI recommendations and validates material mappings.';

      case 'analyst':
        return 'Analyzes material data, standardization and platform metrics.';

      default:
        return 'NCMH platform user.';
    }
  };

  const handleSave = () => {
    /*
     * Profile persistence will be connected to the backend later.
     * For the current frontend demo, we acknowledge the changes locally.
     */
    setIsEditing(false);

    showToast(
      'Profile changes saved for this session.',
      'success'
    );
  };

  const handleCancel = () => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setOrganization(currentUser.organization || 'NCMH');

    setIsEditing(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f1ea]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#4a4e4a] mb-3">
            <span className="material-symbols-outlined text-[18px] text-[#a5555a]">
              person
            </span>

            <span>Account</span>

            <span className="text-[#aaa49a]">/</span>

            <span className="text-[#2e3230] font-medium">
              Profile
            </span>
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2e3230]">
              My Profile
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#4a4e4a]">
              Manage your NCMH account information and platform access.
            </p>
          </div>
        </div>

        {/* Main profile layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* Profile summary card */}
          <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-[0_2px_8px_rgba(46,50,48,0.04)] overflow-hidden">

            {/* Top accent */}
            <div className="h-2 bg-[#a5555a]" />

            <div className="p-6">

              {/* Avatar */}
              <div className="flex flex-col items-center text-center">

                <div className="w-24 h-24 rounded-full bg-[#a5555a] flex items-center justify-center shadow-[0_4px_14px_rgba(165,85,90,0.25)]">
                  <span className="text-3xl font-bold text-white">
                    {getInitials(currentUser.name)}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold text-[#2e3230]">
                  {currentUser.name}
                </h2>

                <p className="mt-1 text-sm text-[#4a4e4a] break-all">
                  {currentUser.email}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0ece4] border border-[#e4e0d8]">
                  <span className="w-2 h-2 rounded-full bg-[#4b805e]" />

                  <span className="text-xs font-bold text-[#4a4e4a]">
                    Active Account
                  </span>
                </div>
              </div>

              {/* Role */}
              <div className="mt-8 pt-6 border-t border-[#eae6de]">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0ece4] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#a5555a]">
                      verified_user
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide font-bold text-[#77736c]">
                      Platform Role
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#2e3230]">
                      {formatRole(currentUser.role)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-[#66635d]">
                  {getRoleDescription(currentUser.role)}
                </p>
              </div>

              {/* User ID */}
              <div className="mt-6 pt-6 border-t border-[#eae6de]">

                <p className="text-[11px] uppercase tracking-wide font-bold text-[#77736c]">
                  User ID
                </p>

                <p className="mt-2 font-mono text-sm text-[#4a4e4a] break-all">
                  {currentUser.id}
                </p>
              </div>
            </div>
          </section>

          {/* Right content */}
          <div className="space-y-6">

            {/* Personal information */}
            <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-[0_2px_8px_rgba(46,50,48,0.04)]">

              <div className="px-6 py-5 border-b border-[#eae6de] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                  <h2 className="text-lg font-bold text-[#2e3230]">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-xs text-[#77736c]">
                    Your basic NCMH account information.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f0ece4] border border-[#e4e0d8] text-sm font-semibold text-[#4a4e4a] hover:bg-[#eae6de] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>

                    Edit Profile
                  </button>
                )}
              </div>

              <div className="p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Full name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#77736c] mb-2">
                      Full Name
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#d9d4ca] bg-white text-sm text-[#2e3230] outline-none focus:border-[#a5555a] focus:ring-2 focus:ring-[#a5555a]/10"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl bg-[#f8f5ef] border border-[#eae6de] text-sm text-[#2e3230]">
                        {currentUser.name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#77736c] mb-2">
                      Email Address
                    </label>

                    {isEditing ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#d9d4ca] bg-white text-sm text-[#2e3230] outline-none focus:border-[#a5555a] focus:ring-2 focus:ring-[#a5555a]/10"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl bg-[#f8f5ef] border border-[#eae6de] text-sm text-[#2e3230] break-all">
                        {currentUser.email}
                      </div>
                    )}
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#77736c] mb-2">
                      Organization
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#d9d4ca] bg-white text-sm text-[#2e3230] outline-none focus:border-[#a5555a] focus:ring-2 focus:ring-[#a5555a]/10"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl bg-[#f8f5ef] border border-[#eae6de] text-sm text-[#2e3230]">
                        {currentUser.organization || 'NCMH'}
                      </div>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#77736c] mb-2">
                      Platform Role
                    </label>

                    <div className="px-4 py-3 rounded-xl bg-[#f8f5ef] border border-[#eae6de] text-sm text-[#2e3230] flex items-center justify-between">
                      <span>
                        {formatRole(currentUser.role)}
                      </span>

                      <span className="material-symbols-outlined text-[#77736c] text-[18px]">
                        lock
                      </span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-[#77736c]">
                      Role is managed by the platform administrator.
                    </p>
                  </div>
                </div>

                {/* Edit buttons */}
                {isEditing && (
                  <div className="mt-6 pt-6 border-t border-[#eae6de] flex flex-col sm:flex-row gap-3 sm:justify-end">

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2.5 rounded-xl border border-[#d9d4ca] bg-white text-sm font-semibold text-[#4a4e4a] hover:bg-[#f8f5ef] transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-5 py-2.5 rounded-xl bg-[#a5555a] text-white text-sm font-semibold hover:bg-[#914b50] transition-colors shadow-[0_2px_8px_rgba(165,85,90,0.2)]"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Account access */}
            <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-[0_2px_8px_rgba(46,50,48,0.04)]">

              <div className="px-6 py-5 border-b border-[#eae6de]">
                <h2 className="text-lg font-bold text-[#2e3230]">
                  Account & Security
                </h2>

                <p className="mt-1 text-xs text-[#77736c]">
                  Manage your account access and security settings.
                </p>
              </div>

              <div className="p-6 space-y-4">

                {/* Password */}
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Password management will be connected to the backend.',
                      'info'
                    )
                  }
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#eae6de] hover:bg-[#f8f5ef] transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#f0ece4] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#a5555a]">
                      lock
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#2e3230]">
                      Change Password
                    </p>

                    <p className="mt-1 text-xs text-[#77736c]">
                      Update your account password.
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-[#77736c]">
                    chevron_right
                  </span>
                </button>

                {/* Activity */}
                <div className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#eae6de]">

                  <div className="w-11 h-11 rounded-xl bg-[#f0ece4] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#a5555a]">
                      history
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#2e3230]">
                      Account Activity
                    </p>

                    <p className="mt-1 text-xs text-[#77736c]">
                      Login and platform activity will appear here after backend integration.
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-[#f0ece4] text-[10px] font-bold text-[#77736c]">
                    SESSION
                  </span>
                </div>

                {/* Sign out */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#ead8d8] bg-[#fffafa] hover:bg-[#fff2f2] transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#f5e5e5] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#a5555a]">
                      logout
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#8d4449]">
                      Sign Out
                    </p>

                    <p className="mt-1 text-xs text-[#77736c]">
                      Sign out of your NCMH session.
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-[#a5555a]">
                    chevron_right
                  </span>
                </button>

              </div>
            </section>

            {/* Access summary */}
            <section className="bg-[#f0ece4] rounded-2xl border border-[#e4e0d8] p-6">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#a5555a]">
                    admin_panel_settings
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#2e3230]">
                    Platform Access
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-[#4a4e4a]">
                    Your current access level is{' '}
                    <span className="font-bold">
                      {formatRole(currentUser.role)}
                    </span>
                    . Permissions and organization-level access will be
                    enforced by the backend when authentication is integrated.
                  </p>
                </div>

              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;