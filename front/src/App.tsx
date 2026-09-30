import React, { useEffect, useState } from 'react';import { motion, AnimatePresence } from 'framer-motion';

import { AppProvider, useApp } from './context/AppContext';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { GradientWavesModal } from './components/GradientWavesModal';

import { LoginScreen } from './screens/LoginScreen';
import { IngestionScreen } from './screens/IngestionScreen';
import { VerificationScreen } from './screens/VerificationScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import MaterialDetailsScreen from './screens/MaterialDetailsScreen';

/*
 * MaterialSearchScreen uses:
 *
 * export default MaterialSearchScreen;
 *
 * Therefore it must be imported without { }.
 */
import MaterialSearchScreen from './screens/MaterialSearchScreen';

import { AIRecommendationScreen } from './screens/AIRecommendationScreen';
import { MappingScreen } from './screens/MappingScreen';
import { MigrationScreen } from './screens/MigrationScreen';
import { ERPIntegrationScreen } from './screens/ERPIntegrationScreen';
import { MaterialAssistantScreen } from './screens/MaterialAssistantScreen';
import { portalApi } from './services/apiClient';
interface AnalyticsSummary {
  total_cpse: number;
  total_materials: number;
  total_national_materials: number;
  total_mappings: number;
  approved_mappings: number;
  pending_mappings: number;
  rejected_mappings: number;
  total_audit_logs: number;
}
/* =========================================================
   DASHBOARD
   ========================================================= */

/* =========================================================
   DASHBOARD
   ========================================================= */

const Dashboard: React.FC = () => {
  const { setActiveScreen } = useApp();

  const [analytics, setAnalytics] =
    useState<AnalyticsSummary | null>(null);

  const [analyticsError, setAnalyticsError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await portalApi.getAnalytics();

        setAnalytics(data);
        setAnalyticsError(null);
      } catch (error) {
        console.error(
          'Failed to load live analytics:',
          error
        );

        setAnalyticsError(
          'Unable to load live analytics'
        );
      }
    };

    loadAnalytics();
  }, []);

  const cards = [
    {
      title: 'Material Ingestion',
      value: analytics
        ? analytics.total_materials.toLocaleString()
        : '...',
      description:
        'Materials imported across CPSEs',
      icon: 'upload_file',
      screen: 'ingestion' as const,
    },
    {
      title: 'AI Verification',
      value: analytics
        ? analytics.pending_mappings.toLocaleString()
        : '...',
      description:
        'Materials waiting for review',
      icon: 'verified',
      screen: 'verification' as const,
    },
    {
      title: 'Standardized Master',
      value: analytics
        ? analytics.total_national_materials.toLocaleString()
        : '...',
      description:
        'Materials harmonized into national master',
      icon: 'dataset',
      screen: 'catalog' as const,
    },
    {
      title: 'AI Recommendations',
      value: analytics
        ? analytics.total_mappings.toLocaleString()
        : '...',
      description:
        'AI-generated material recommendations',
      icon: 'psychology',
      screen: 'ai-recommendation' as const,
    },
  ];

  return (
    <div className="w-full pb-16">

      {/* Page heading */}

      <div className="mb-8">

        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#a5555a] mb-2">
          National Unified Material Master
        </p>

        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-[#2e3230]">
          Material Harmonization Dashboard
        </h1>

        <p className="mt-2 text-sm text-[#4a4e4a]">
          AI-driven standardization, duplicate detection and
          cross-CPSE material harmonization.
        </p>

      </div>

      {/* LIVE ANALYTICS ERROR */}

      {analyticsError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {analyticsError}
        </div>
      )}

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        {cards.map(card => (

          <button
            key={card.title}
            type="button"
            onClick={() =>
              setActiveScreen(card.screen)
            }
            className="
              text-left
              bg-[#f5f1ea]
              border
              border-[#e4e0d8]
              rounded-2xl
              p-5
              shadow-sm
              hover:shadow-md
              transition
            "
          >

            <div className="flex justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-[#4a4e4a]">
                  {card.title}
                </p>

                <p className="font-serif text-3xl font-bold text-[#2e3230] mt-3">
                  {card.value}
                </p>

              </div>

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-[#eee3df]
                  text-[#a5555a]
                  flex
                  items-center
                  justify-center
                "
              >

                <span className="material-symbols-outlined">
                  {card.icon}
                </span>

              </div>

            </div>

            <p className="text-xs text-[#4a4e4a] mt-4">
              {card.description}
            </p>

          </button>

        ))}

      </div>

      {/* HARMONIZATION LIFECYCLE */}

      <section
        className="
          bg-[#f5f1ea]
          border
          border-[#e4e0d8]
          rounded-2xl
          p-6
          lg:p-8
          shadow-sm
        "
      >

        <h2 className="font-serif text-xl font-bold text-[#2e3230]">
          Harmonization Lifecycle
        </h2>

        <p className="text-xs text-[#4a4e4a] mt-1 mb-6">
          End-to-end workflow from CPSE material ingestion to
          national material master.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {[
            {
              number: '01',
              title: 'Upload',
              description:
                'Import CPSE material masters',
              icon: 'cloud_upload',
              screen: 'ingestion' as const,
            },
            {
              number: '02',
              title: 'AI Analysis',
              description:
                'Extract attributes and detect duplicates',
              icon: 'psychology',
              screen: 'ai-recommendation' as const,
            },
            {
              number: '03',
              title: 'Human Review',
              description:
                'Validate AI recommendations',
              icon: 'verified',
              screen: 'verification' as const,
            },
            {
              number: '04',
              title: 'National Master',
              description:
                'Create standardized material mapping',
              icon: 'account_tree',
              screen: 'mapping' as const,
            },
          ].map(step => (

            <button
              key={step.number}
              type="button"
              onClick={() =>
                setActiveScreen(step.screen)
              }
              className="
                flex
                items-center
                gap-4
                p-4
                rounded-xl
                bg-white/70
                border
                border-[#e4e0d8]
                text-left
                hover:bg-white
                transition
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-[#a5555a]
                  text-white
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >

                <span className="material-symbols-outlined">
                  {step.icon}
                </span>

              </div>

              <div>

                <div className="flex items-center gap-2">

                  <span className="text-[10px] font-bold text-[#a5555a]">
                    {step.number}
                  </span>

                  <h3 className="text-sm font-bold text-[#2e3230]">
                    {step.title}
                  </h3>

                </div>

                <p className="text-[11px] text-[#4a4e4a] mt-1">
                  {step.description}
                </p>

              </div>

            </button>

          ))}

        </div>

      </section>

    </div>
  );
};
/* =========================================================
   MAIN LAYOUT
   ========================================================= */

const MainLayout: React.FC = () => {

  const {
    activeScreen,
    isAuthenticated,
  } = useApp();


  /*
   * LOGIN
   */

  if (!isAuthenticated) {
    return <LoginScreen />;
  }


  /*
   * SCREEN ROUTER
   */

  const renderScreen = () => {

    switch (activeScreen) {

      case 'dashboard':
        return <Dashboard />;

      case 'global-search':
        return <MaterialSearchScreen />;

      case 'ingestion':
        return <IngestionScreen />;

      case 'verification':
        return <VerificationScreen />;

      case 'catalog':
  return <CatalogScreen />;

case 'material-details':
  return <MaterialDetailsScreen />;

case 'ai-recommendation':
  return <AIRecommendationScreen />;

      case 'mapping':
        return <MappingScreen />;

      case 'migration':
        return <MigrationScreen />;

      case 'erp':
        return <ERPIntegrationScreen />;

      case 'assistant':
        return <MaterialAssistantScreen />;

      default:
        return <Dashboard />;
    }
  };


  return (
    <div
      className="
        min-h-screen
        bg-[#f5f1ea]
        text-[#2e3230]
        font-sans
        antialiased
        overflow-x-hidden
      "
    >

      {/* Header */}

      <Header />


      {/* Sidebar */}

      <Sidebar />


      {/* Main content */}

      <div className="pl-72">

        <main
          className="
            relative
            pt-20
            min-h-[calc(100vh-5rem)]
            w-full
            px-8
            pb-10
          "
        >

          <AnimatePresence mode="wait">

            <motion.div
              key={activeScreen}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.25,
              }}
              className="w-full"
            >

              {renderScreen()}

            </motion.div>

          </AnimatePresence>

        </main>

        <Footer />

      </div>


      {/* Global UI */}

      <Toast />

      <GradientWavesModal />

    </div>
  );
};


/* =========================================================
   ROOT APPLICATION
   ========================================================= */

const App: React.FC = () => {

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};


export default App;