import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    showToast,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  /*
   * Close profile dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  /*
   * Close dropdown with Escape key.
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  /*
   * Get initials from logged-in user's name.
   */
  const getInitials = (name: string) => {
    const cleanName = name.trim();

    if (!cleanName) {
      return 'U';
    }

    const parts = cleanName.split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`
      .toUpperCase();
  };

  /*
   * Convert role into display text.
   */
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';

      case 'reviewer':
        return 'Material Review Officer';

      case 'analyst':
        return 'Data Analyst';

      default:
        return 'Portal User';
    }
  };

  /*
   * Toggle profile dropdown.
   */
  const handleProfileToggle = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    setIsProfileOpen(prev => !prev);
  };

  /*
   * API configuration.
   *
   * Backend integration will replace this later.
   */
  const handleApiConfiguration = () => {
    setIsProfileOpen(false);

    showToast(
      'API Configuration will be connected to the backend integration.',
      'info'
    );
  };

  /*
   * Sign out.
   */
  const handleLogout = () => {
    setIsProfileOpen(false);

    logout();
  };

  /*
   * Use only authenticated user information.
   * No demo/fallback user is created here.
   */
  const userName = currentUser?.name || '—';

  const userEmail = currentUser?.email || '—';

  const userRole = getRoleLabel(
    currentUser?.role
  );

  const initials = getInitials(
    currentUser?.name || ''
  );

  return (
    <header
      className="
        fixed
        top-0
        left-0
        right-0
        h-16
        bg-[#f5f1ea]/95
        backdrop-blur-md
        border-b
        border-[#e4e0d8]
        z-50
        flex
        items-center
        justify-between
        px-5
        lg:px-7
      "
    >
      {/* =====================================================
          LEFT SIDE — BRAND
      ===================================================== */}

      <div className="flex items-center gap-3 min-w-0">

        {/* Government icon */}

        <div
          className="
            w-11
            h-11
            rounded-xl
            bg-[#f0ece4]
            border
            border-[#e4e0d8]
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <span
            className="
              material-symbols-outlined
              text-[#4a7c59]
              text-[26px]
            "
          >
            account_balance
          </span>
        </div>

        {/* Brand text */}

        <div className="leading-tight min-w-0">

          <h1
            className="
              font-serif
              text-[15px]
              sm:text-[16px]
              font-bold
              text-[#2e3230]
              whitespace-nowrap
            "
          >
            Ministry of Heavy Industries
          </h1>

          <p
            className="
              text-[10px]
              sm:text-[11px]
              uppercase
              tracking-[0.08em]
              font-bold
              text-[#4a4e4a]
              whitespace-nowrap
            "
          >
            National CPSE Material Harmonization Portal
          </p>

        </div>

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="flex items-center gap-2 sm:gap-4">

        {/* ===================================================
            SYNC STATUS
        =================================================== */}

        <div
          className="
            hidden
            md:flex
            items-center
            gap-2
            px-3.5
            py-2
            rounded-xl
            bg-[#f8f5ef]
            border
            border-[#e4e0d8]
          "
        >

          <span
            className="
              w-2
              h-2
              rounded-full
              bg-[#4a7c59]
            "
          />

          <span
            className="
              text-xs
              font-sans
              font-semibold
              text-[#4a4e4a]
            "
          >
            Live Sync
          </span>

        </div>

        {/* ===================================================
            PROFILE
        =================================================== */}

        <div
          ref={profileRef}
          className="relative"
        >

          {/* PROFILE AVATAR BUTTON */}

          <button
            type="button"
            onClick={handleProfileToggle}
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
            className={`
              w-10
              h-10
              rounded-full
              bg-[#4a7c59]
              text-white
              flex
              items-center
              justify-center
              transition-all
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-[#4a7c59]/30
              ${
                isProfileOpen
                  ? 'ring-2 ring-[#4a7c59]/30 scale-[1.03]'
                  : 'hover:scale-[1.03]'
              }
            `}
          >

            <span className="material-symbols-outlined text-[22px]">
              person
            </span>

          </button>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {isProfileOpen && (

            <div
              className="
                absolute
                right-0
                top-[calc(100%+10px)]
                w-[288px]
                bg-white
                rounded-2xl
                border
                border-[#e4e0d8]
                shadow-[0_10px_30px_rgba(46,50,48,0.14)]
                overflow-hidden
                z-[100]
              "
            >

              {/* USER INFORMATION */}

              <div
                className="
                  p-4
                  border-b
                  border-[#eae6de]
                  bg-[#fff]
                "
              >

                <div className="flex items-center gap-3">

                  {/* Avatar */}

                  <div
                    className="
                      w-12
                      h-12
                      rounded-full
                      bg-[#a5555a]
                      text-white
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >

                    <span className="font-bold text-sm">
                      {initials}
                    </span>

                  </div>

                  {/* Name / Role */}

                  <div className="min-w-0">

                    <p
                      className="
                        text-sm
                        font-bold
                        text-[#2e3230]
                        truncate
                      "
                    >
                      {userName}
                    </p>

                    <p
                      className="
                        text-xs
                        text-[#77736c]
                        mt-0.5
                      "
                    >
                      {userRole}
                    </p>

                  </div>

                </div>

                {/* EMAIL */}

                <div
                  className="
                    mt-3
                    px-3
                    py-2.5
                    rounded-xl
                    bg-[#f5f1ea]
                    border
                    border-[#eae6de]
                  "
                >

                  <p
                    className="
                      text-xs
                      text-[#4a4e4a]
                      truncate
                    "
                    title={userEmail}
                  >
                    {userEmail}
                  </p>

                </div>

              </div>

              {/* MENU */}

              <div className="p-3">

                {/* API CONFIGURATION */}

                <button
                  type="button"
                  onClick={handleApiConfiguration}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-xl
                    bg-[#f5f1ea]
                    text-[#4a7c59]
                    hover:bg-[#eee9df]
                    transition-colors
                    text-left
                  "
                >

                  <span
                    className="
                      material-symbols-outlined
                      text-[20px]
                    "
                  >
                    tune
                  </span>

                  <span
                    className="
                      text-xs
                      font-sans
                      font-bold
                    "
                  >
                    API Configuration
                  </span>

                </button>

                {/* SIGN OUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    w-full
                    mt-2
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-xl
                    bg-[#fff4f2]
                    text-[#a5555a]
                    hover:bg-[#fbe9e7]
                    transition-colors
                    text-left
                  "
                >

                  <span
                    className="
                      material-symbols-outlined
                      text-[20px]
                    "
                  >
                    logout
                  </span>

                  <span
                    className="
                      text-xs
                      font-sans
                      font-bold
                    "
                  >
                    Sign Out
                  </span>

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </header>
  );
};

export default Header;