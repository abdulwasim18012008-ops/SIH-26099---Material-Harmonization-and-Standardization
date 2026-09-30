import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ScreenType } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    currentUser,
  } = useApp();

  const navItems: {
    id: ScreenType;
    label: string;
    icon: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
    },
    {
      id: 'global-search',
      label: 'Global Material Search',
      icon: 'search',
    },
    {
      id: 'ingestion',
      label: '1. Ingestion & AI Vector Engine',
      icon: 'hub',
    },
    {
      id: 'verification',
      label: '2. Human Verification & Consensus',
      icon: 'verified',
    },
    {
      id: 'catalog',
      label: '3. Standardized Catalog & Analytics',
      icon: 'dataset',
    },
    {
      id: 'ai-recommendation',
      label: '4. AI Recommendation',
      icon: 'psychology',
    },
    {
      id: 'mapping',
      label: '5. CPSE ↔ National Mapping',
      icon: 'account_tree',
    },
    {
      id: 'migration',
      label: '6. Migration & Rationalization',
      icon: 'sync_alt',
    },
    {
      id: 'erp',
      label: '7. ERP / SAP Integration',
      icon: 'lan',
    },
    {
      id: 'assistant',
      label: '8. Material Assistant',
      icon: 'smart_toy',
    },
  ];

  const handleNavigation = (screen: ScreenType) => {
    setActiveScreen(screen);
  };

  return (
    <aside
      className="
        fixed
        left-0
        top-16
        h-[calc(100vh-4rem)]
        w-72
        bg-[#f5f1ea]/95
        backdrop-blur-md
        z-40
        flex
        flex-col
        justify-between
        py-6
        px-4
        shadow-[0_1px_8px_rgba(46,50,48,0.04)]
        border-r
        border-[#eae6de]
        overflow-y-auto
      "
    >
      <div className="flex flex-col gap-6">
        {/* Section Heading */}

        <div className="px-3">
          <span
            className="
              text-[11px]
              font-sans
              uppercase
              font-bold
              tracking-wider
              text-[#4a4e4a]
            "
          >
            Harmonization Lifecycle
          </span>
        </div>

        {/* Navigation */}

        <nav className="flex flex-col gap-2 relative">
          {navItems.map(item => {
            const isActive =
              activeScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() =>
                  handleNavigation(item.id)
                }
                type="button"
                className={`
                  relative
                  flex
                  items-center
                  gap-3
                  px-3.5
                  py-3
                  rounded-xl
                  transition-colors
                  text-left
                  text-sm
                  font-sans
                  w-full

                  ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-[#4a4e4a] hover:bg-[#eae6de]/70 hover:text-[#2e3230]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStageIndicator"
                    className="
                      absolute
                      inset-0
                      rounded-xl
                      bg-[#a5555a]
                      shadow-[0_2px_8px_rgba(165,85,90,0.3)]
                      z-0
                    "
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 32,
                      duration: 0.35,
                    }}
                  />
                )}

                <span
                  className="
                    material-symbols-outlined
                    text-[20px]
                    relative
                    z-10
                    shrink-0
                  "
                >
                  {item.icon}
                </span>

                <span
                  className="
                    font-sans
                    leading-tight
                    relative
                    z-10
                  "
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Status */}

      <div className="mt-6 flex flex-col gap-4">
        {/* Current User */}

        {currentUser && (
          <div
            className="
              px-3
              py-3
              rounded-xl
              bg-[#ffffff]/70
              border
              border-[#e4e0d8]
            "
          >
            <div className="flex items-center gap-2.5">
              <div
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-[#a5555a]
                  text-white
                  flex
                  items-center
                  justify-center
                  text-xs
                  font-bold
                  shrink-0
                "
              >
                {currentUser.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-xs
                    font-bold
                    text-[#2e3230]
                    truncate
                  "
                >
                  {currentUser.name}
                </p>

                <p
                  className="
                    text-[10px]
                    text-[#4a4e4a]
                    font-sans
                    capitalize
                  "
                >
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Model Quorum */}

        <div
          className="
            px-3
            py-4
            rounded-xl
            bg-[#f0ece4]
            text-xs
            text-[#4a4e4a]
            flex
            flex-col
            gap-1.5
            border
            border-[#e4e0d8]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              font-sans
              font-bold
              text-[#2e3230]
            "
          >
            <span>Model Quorum</span>

            <span
              className="
                text-[#a5555a]
                font-bold
              "
            >
              99.4%
            </span>
          </div>

          <div
            className="
              w-full
              bg-[#eae6de]
              rounded-full
              h-1.5
              overflow-hidden
            "
          >
            <div
              className="
                bg-[#a5555a]
                h-1.5
                rounded-full
                transition-all
                duration-700
              "
              style={{
                width: '99.4%',
              }}
            />
          </div>

          <span
            className="
              text-[11px]
              mt-1
              text-[#4a4e4a]
            "
          >
            Transformer v4.8 active
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;