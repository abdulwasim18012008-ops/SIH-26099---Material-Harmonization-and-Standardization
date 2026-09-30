import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Database,
  CheckCircle2,
  Clock3,
  Building2,
  ArrowUpRight,
  Upload,
  ShieldCheck,
  Sparkles,
  Activity,
  FileText,
  Link2,
  RefreshCw,
} from 'lucide-react';

import { motion } from 'framer-motion';

import { useApp } from '../context/AppContext';

import { portalApi } from '../services/apiClient';


interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  delay?: number;
}


interface AnalyticsData {
  total_cpse?: number;
  total_materials?: number;
  total_national_materials?: number;
  total_mappings?: number;
  approved_mappings?: number;
  pending_mappings?: number;
  rejected_mappings?: number;
  total_audit_logs?: number;
}


interface CPSE {
  id?: number;
  name?: string;
  code?: string;
}


interface Material {
  id?: number;
  cpse_id?: number;
  material_code?: string;
  original_description?: string;
}


interface AuditLog {
  id?: number;
  action?: string;
  entity_id?: number;
  user?: string;
  timestamp?: string;
  reason?: string;
}


const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay,
      }}
      className="
        rounded-2xl
        border
        border-[#e4e0d8]
        bg-white
        p-5
        shadow-[0_3px_14px_rgba(46,50,48,0.045)]
        hover:shadow-[0_6px_20px_rgba(46,50,48,0.07)]
        transition-shadow
      "
    >
      <div className="flex items-start justify-between">

        <div>

          <p
            className="
              text-[11px]
              uppercase
              tracking-wider
              font-bold
              text-[#74796e]
            "
          >
            {title}
          </p>

          <div
            className="
              mt-2
              text-2xl
              font-serif
              font-semibold
              text-[#2e3230]
            "
          >
            {value}
          </div>

          <p
            className="
              mt-1
              text-[11px]
              text-[#74796e]
            "
          >
            {subtitle}
          </p>

        </div>

        <div
          className={`
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            ${accent}
          `}
        >
          {icon}
        </div>

      </div>
    </motion.div>
  );
};


const DashboardScreen: React.FC = () => {

  const {
    currentUser,
    setActiveScreen,
  } = useApp();


  /* =======================================================
     STATE
     ======================================================= */

  const [
    analytics,
    setAnalytics,
  ] = useState<AnalyticsData | null>(null);


  const [
    cpseList,
    setCpseList,
  ] = useState<CPSE[]>([]);


  const [
    materials,
    setMaterials,
  ] = useState<Material[]>([]);


  const [
    auditLogs,
    setAuditLogs,
  ] = useState<AuditLog[]>([]);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);


  /* =======================================================
     LOAD LIVE DASHBOARD DATA
     ======================================================= */

  const loadDashboardData = async (
    showRefreshState = false
  ) => {

    try {

      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }


      const [
        analyticsResponse,
        cpseResponse,
        materialsResponse,
        auditResponse,
      ] = await Promise.all([
        portalApi.getAnalytics(),
        portalApi.getCPSEs(),
        portalApi.getMaterials(),
        portalApi.getAuditLogs(),
      ]);


      setAnalytics(
        analyticsResponse ?? {}
      );


      setCpseList(
        Array.isArray(cpseResponse)
          ? cpseResponse
          : []
      );


      setMaterials(
        Array.isArray(materialsResponse)
          ? materialsResponse
          : []
      );


      setAuditLogs(
        Array.isArray(auditResponse)
          ? auditResponse
          : []
      );

    } catch (error) {

      console.error(
        'Unable to load dashboard data:',
        error
      );

      setAnalytics(null);
      setCpseList([]);
      setMaterials([]);
      setAuditLogs([]);

    } finally {

      setIsLoading(false);
      setIsRefreshing(false);

    }

  };


  useEffect(() => {

    loadDashboardData();

  }, []);


  /* =======================================================
     SAFE LIVE VALUES
     ======================================================= */

  const totalMaterials =
    Number(
      analytics?.total_materials ?? 0
    );


  const totalNationalMaterials =
    Number(
      analytics?.total_national_materials ?? 0
    );


  const totalMappings =
    Number(
      analytics?.total_mappings ?? 0
    );


  const approvedMappings =
    Number(
      analytics?.approved_mappings ?? 0
    );


  const pendingMappings =
    Number(
      analytics?.pending_mappings ?? 0
    );


  const rejectedMappings =
    Number(
      analytics?.rejected_mappings ?? 0
    );


  const totalCPSE =
    Number(
      analytics?.total_cpse ??
      cpseList.length ??
      0
    );


  const totalAuditLogs =
    Number(
      analytics?.total_audit_logs ?? 0
    );


  /* =======================================================
     CPSE MATERIAL COUNTS
     ======================================================= */

  const cpseMaterialCounts =
    useMemo(() => {

      const counts =
        new Map<number, number>();


      materials.forEach(
        material => {

          if (
            material.cpse_id !== undefined &&
            material.cpse_id !== null
          ) {

            const id =
              Number(
                material.cpse_id
              );


            counts.set(
              id,
              (counts.get(id) ?? 0) + 1
            );

          }

        }
      );


      return counts;

    }, [materials]);


  const displayedCPSEs =
    useMemo(() => {

      return cpseList
        .map(cpse => {

          const id =
            Number(
              cpse.id ?? 0
            );


          return {
            ...cpse,
            materialCount:
              cpseMaterialCounts.get(
                id
              ) ?? 0,
          };

        })
        .slice(0, 5);

    }, [
      cpseList,
      cpseMaterialCounts,
    ]);


  /* =======================================================
     APPROVAL RATE
     ======================================================= */

  const approvalRate =
    totalMappings > 0
      ? Math.round(
          (
            approvedMappings /
            totalMappings
          ) * 100
        )
      : 0;


  /* =======================================================
     AUDIT ACTIVITY
     ======================================================= */

  const recentActivity =
    useMemo(() => {

      return [...auditLogs]
        .sort((a, b) => {

          const aTime =
            a.timestamp
              ? new Date(
                  a.timestamp
                ).getTime()
              : 0;


          const bTime =
            b.timestamp
              ? new Date(
                  b.timestamp
                ).getTime()
              : 0;


          return bTime - aTime;

        })
        .slice(0, 5);

    }, [auditLogs]);


  /* =======================================================
     FORMATTERS
     ======================================================= */

  const formatNumber = (
    value: number
  ) => {

    return value.toLocaleString(
      'en-IN'
    );

  };


  const formatTime = (
    timestamp?: string
  ) => {

    if (!timestamp) {
      return 'No timestamp';
    }


    const date =
      new Date(timestamp);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return timestamp;

    }


    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  };


  const getActivityIcon =
    (action?: string) => {

      const normalized =
        (
          action ?? ''
        ).toUpperCase();


      if (
        normalized.includes(
          'APPROV'
        )
      ) {

        return (
          <CheckCircle2
            size={17}
          />
        );

      }


      if (
        normalized.includes(
          'REJECT'
        )
      ) {

        return (
          <ShieldCheck
            size={17}
          />
        );

      }


      if (
        normalized.includes(
          'AI'
        )
      ) {

        return (
          <Sparkles
            size={17}
          />
        );

      }


      if (
        normalized.includes(
          'MAPPING'
        )
      ) {

        return (
          <Link2
            size={17}
          />
        );

      }


      return (
        <FileText
          size={17}
        />
      );

    };


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className="
        w-full
        max-w-[1600px]
        mx-auto
        pb-10
      "
    >

      {/* =====================================================
         HEADER
         ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="
          flex
          flex-col
          md:flex-row
          md:items-end
          md:justify-between
          gap-5
          mb-7
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-2
              mb-2
            "
          >

            <span
              className="
                w-2
                h-2
                rounded-full
                bg-[#4a7c59]
                animate-pulse
              "
            />

            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.16em]
                font-bold
                text-[#4a7c59]
              "
            >
              National Material Intelligence
            </span>

          </div>


          <h1
            className="
              font-serif
              text-3xl
              sm:text-4xl
              font-semibold
              text-[#2e3230]
              tracking-tight
            "
          >
            Good morning
            {currentUser?.name
              ? `, ${currentUser.name.split(' ')[0]}`
              : ''}
          </h1>


          <p
            className="
              mt-2
              text-sm
              text-[#6b6e6b]
              max-w-2xl
            "
          >
            Monitor material harmonization,
            AI matching, human verification
            and national-code standardization
            from one workspace.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <button
            type="button"
            onClick={() =>
              loadDashboardData(true)
            }
            disabled={
              isRefreshing
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              h-10
              px-4
              rounded-xl
              bg-white
              border
              border-[#e4e0d8]
              text-[#4a4e4a]
              text-xs
              font-bold
              hover:bg-[#f5f1ea]
              disabled:opacity-50
              transition-colors
            "
          >

            <RefreshCw
              size={15}
              className={
                isRefreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh

          </button>


          <button
            type="button"
            onClick={() =>
              setActiveScreen(
                'ingestion'
              )
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              h-10
              px-4
              rounded-xl
              bg-[#4a7c59]
              hover:bg-[#3d694b]
              text-white
              text-xs
              font-bold
              transition-colors
            "
          >

            <Upload size={15} />

            Import Materials

          </button>

        </div>

      </motion.div>


      {/* =====================================================
         STATUS
         ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          delay: 0.05,
        }}
        className="
          mb-6
          rounded-2xl
          border
          border-[#dfe8e0]
          bg-[#f3f8f3]
          px-4
          py-3
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              w-8
              h-8
              rounded-lg
              bg-white
              border
              border-[#dfe8e0]
              flex
              items-center
              justify-center
              text-[#4a7c59]
            "
          >

            <Activity size={16} />

          </div>


          <div>

            <div
              className="
                text-xs
                font-bold
                text-[#3d694b]
              "
            >
              {isLoading
                ? 'Loading live system data...'
                : 'Live database status'}
            </div>


            <div
              className="
                text-[10px]
                text-[#6b6e6b]
              "
            >
              FastAPI analytics · material master ·
              mappings · audit logs
            </div>

          </div>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
            text-[10px]
            font-bold
            text-[#4a7c59]
          "
        >

          <span
            className="
              w-1.5
              h-1.5
              rounded-full
              bg-[#4a7c59]
            "
          />

          {isLoading
            ? 'Loading'
            : 'Live data'}

        </div>

      </motion.div>


      {/* =====================================================
         MAIN METRICS
         ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
          mb-7
        "
      >

        <MetricCard
          title="Total Materials"
          value={formatNumber(
            totalMaterials
          )}
          subtitle="Original CPSE material records"
          icon={
            <Database size={19} />
          }
          accent="
            bg-[#eef3ef]
            text-[#4a7c59]
          "
          delay={0.08}
        />


        <MetricCard
          title="National Materials"
          value={formatNumber(
            totalNationalMaterials
          )}
          subtitle="Materials in the national master"
          icon={
            <Database size={19} />
          }
          accent="
            bg-[#f7eeee]
            text-[#a5555a]
          "
          delay={0.12}
        />


        <MetricCard
          title="Total Mappings"
          value={formatNumber(
            totalMappings
          )}
          subtitle="CPSE to national material mappings"
          icon={
            <Link2 size={19} />
          }
          accent="
            bg-[#f2eff7]
            text-[#765b8f]
          "
          delay={0.16}
        />


        <MetricCard
          title="Approved Mappings"
          value={formatNumber(
            approvedMappings
          )}
          subtitle={`${approvalRate}% of all mappings approved`}
          icon={
            <CheckCircle2 size={19} />
          }
          accent="
            bg-[#eef3f8]
            text-[#52738f]
          "
          delay={0.20}
        />

      </div>


      {/* =====================================================
         SECONDARY METRICS
         ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
          mb-7
        "
      >

        <MetricCard
          title="Pending Approvals"
          value={formatNumber(
            pendingMappings
          )}
          subtitle="Awaiting human verification"
          icon={
            <Clock3 size={19} />
          }
          accent="
            bg-[#faf4e8]
            text-[#9a7636]
          "
          delay={0.24}
        />


        <MetricCard
          title="Rejected Mappings"
          value={formatNumber(
            rejectedMappings
          )}
          subtitle="Mappings rejected during review"
          icon={
            <ShieldCheck size={19} />
          }
          accent="
            bg-[#f7eeee]
            text-[#a5555a]
          "
          delay={0.28}
        />


        <MetricCard
          title="CPSEs Connected"
          value={formatNumber(
            totalCPSE
          )}
          subtitle="CPSE records in the database"
          icon={
            <Building2 size={19} />
          }
          accent="
            bg-[#eef1f5]
            text-[#596f83]
          "
          delay={0.32}
        />


        <MetricCard
          title="Audit Events"
          value={formatNumber(
            totalAuditLogs
          )}
          subtitle="Traceability events recorded"
          icon={
            <FileText size={19} />
          }
          accent="
            bg-[#eef5ef]
            text-[#4a7c59]
          "
          delay={0.36}
        />

      </div>


      {/* =====================================================
         MAIN CONTENT
         ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[1.35fr_0.65fr]
          gap-5
        "
      >

        {/* ===================================================
           CPSE DATA
           =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            delay: 0.25,
          }}
          className="
            rounded-2xl
            border
            border-[#e4e0d8]
            bg-white
            p-5
            sm:p-6
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              mb-6
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Building2
                  size={17}
                  className="
                    text-[#a5555a]
                  "
                />

                <h2
                  className="
                    font-serif
                    text-lg
                    font-semibold
                  "
                >
                  CPSE Material Data
                </h2>

              </div>


              <p
                className="
                  text-xs
                  text-[#74796e]
                  mt-1
                "
              >
                Live material records grouped by
                participating CPSE
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setActiveScreen(
                  'catalog'
                )
              }
              className="
                hidden
                sm:flex
                items-center
                gap-1
                text-[11px]
                font-bold
                text-[#a5555a]
                hover:underline
              "
            >

              View Catalog

              <ArrowUpRight
                size={13}
              />

            </button>

          </div>


          {displayedCPSEs.length === 0 ? (

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-[#e4e0d8]
                p-8
                text-center
              "
            >

              <Building2
                size={25}
                className="
                  mx-auto
                  text-[#9a9d97]
                "
              />

              <p
                className="
                  mt-3
                  text-xs
                  font-bold
                  text-[#4a4e4a]
                "
              >
                No CPSE data available yet
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-[#74796e]
                "
              >
                CPSE records will appear here
                after they are added to the backend.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {displayedCPSEs.map(
                (cpse, index) => {

                  const materialCount =
                    cpse.materialCount;


                  const maxMaterials =
                    Math.max(
                      ...displayedCPSEs.map(
                        item =>
                          item.materialCount
                      ),
                      1
                    );


                  const progress =
                    Math.round(
                      (
                        materialCount /
                        maxMaterials
                      ) * 100
                    );


                  return (

                    <motion.div
                      key={
                        cpse.id ??
                        cpse.code ??
                        index
                      }
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        delay:
                          0.35 +
                          index * 0.05,
                      }}
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          mb-2
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <div
                            className="
                              w-9
                              h-9
                              rounded-lg
                              bg-[#f5f1ea]
                              border
                              border-[#e4e0d8]
                              flex
                              items-center
                              justify-center
                              text-xs
                              font-bold
                              text-[#4a4e4a]
                            "
                          >
                            {(
                              cpse.code ??
                              cpse.name ??
                              'CP'
                            )
                              .slice(0, 3)
                              .toUpperCase()}
                          </div>


                          <div>

                            <div
                              className="
                                text-xs
                                font-bold
                                text-[#2e3230]
                              "
                            >
                              {cpse.name ??
                                cpse.code ??
                                `CPSE ${index + 1}`}
                            </div>


                            <div
                              className="
                                text-[10px]
                                text-[#858884]
                              "
                            >
                              {formatNumber(
                                materialCount
                              )}{' '}
                              materials
                            </div>

                          </div>

                        </div>


                        <div
                          className="
                            text-xs
                            font-bold
                            text-[#4a7c59]
                          "
                        >
                          {progress}%
                        </div>

                      </div>


                      <div
                        className="
                          h-2
                          rounded-full
                          bg-[#eeeae2]
                          overflow-hidden
                        "
                      >

                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width:
                              `${progress}%`,
                          }}
                          transition={{
                            duration: 0.7,
                            delay:
                              0.4 +
                              index * 0.08,
                          }}
                          className="
                            h-full
                            rounded-full
                            bg-[#4a7c59]
                          "
                        />

                      </div>

                    </motion.div>

                  );

                }
              )}

            </div>

          )}


          <button
            type="button"
            onClick={() =>
              setActiveScreen(
                'verification'
              )
            }
            className="
              sm:hidden
              mt-5
              w-full
              h-9
              rounded-xl
              border
              border-[#e4e0d8]
              text-xs
              font-bold
              text-[#a5555a]
            "
          >
            View Verification Queue
          </button>

        </motion.div>


        {/* ===================================================
           RECENT AUDIT ACTIVITY
           =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            delay: 0.3,
          }}
          className="
            rounded-2xl
            border
            border-[#e4e0d8]
            bg-white
            p-5
            sm:p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              mb-1
            "
          >

            <Sparkles
              size={17}
              className="
                text-[#a5555a]
              "
            />

            <h2
              className="
                font-serif
                text-lg
                font-semibold
              "
            >
              Recent Activity
            </h2>

          </div>


          <p
            className="
              text-xs
              text-[#74796e]
              mb-5
            "
          >
            Latest real audit events
          </p>


          {recentActivity.length === 0 ? (

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-[#e4e0d8]
                p-8
                text-center
              "
            >

              <Activity
                size={25}
                className="
                  mx-auto
                  text-[#9a9d97]
                "
              />

              <p
                className="
                  mt-3
                  text-xs
                  font-bold
                  text-[#4a4e4a]
                "
              >
                No audit activity yet
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-[#74796e]
                "
              >
                Upload and verify materials
                to generate audit events.
              </p>

            </div>

          ) : (

            <div className="space-y-1">

              {recentActivity.map(
                (activity, index) => (

                  <div
                    key={
                      activity.id ??
                      `${activity.action}-${index}`
                    }
                    className="
                      flex
                      gap-3
                      py-3
                      border-b
                      border-[#eeeae2]
                      last:border-0
                    "
                  >

                    <div
                      className="
                        w-8
                        h-8
                        shrink-0
                        rounded-lg
                        bg-[#f5f1ea]
                        flex
                        items-center
                        justify-center
                        text-[#a5555a]
                      "
                    >

                      {getActivityIcon(
                        activity.action
                      )}

                    </div>


                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <div
                        className="
                          text-xs
                          font-bold
                          text-[#2e3230]
                        "
                      >
                        {activity.action ??
                          'Audit event'}
                      </div>


                      <div
                        className="
                          text-[10px]
                          text-[#74796e]
                          mt-0.5
                          leading-4
                        "
                      >
                        {activity.reason ??
                          `Entity ${activity.entity_id ?? '—'} · ${activity.user ?? 'System'}`}
                      </div>

                    </div>


                    <div
                      className="
                        text-[9px]
                        text-[#9a9d97]
                        whitespace-nowrap
                      "
                    >
                      {formatTime(
                        activity.timestamp
                      )}
                    </div>

                  </div>

                )
              )}

            </div>

          )}


          <button
            type="button"
            onClick={() =>
              setActiveScreen(
                'verification'
              )
            }
            className="
              mt-4
              w-full
              h-9
              rounded-xl
              bg-[#f5f1ea]
              hover:bg-[#eeeae2]
              text-[11px]
              font-bold
              text-[#4a4e4a]
              transition-colors
            "
          >
            Open Verification Queue
          </button>

        </motion.div>

      </div>


      {/* =====================================================
         QUICK ACTIONS
         ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          delay: 0.4,
        }}
        className="mt-5"
      >

        <div className="mb-3">

          <h2
            className="
              font-serif
              text-lg
              font-semibold
            "
          >
            Quick Actions
          </h2>


          <p
            className="
              text-xs
              text-[#74796e]
              mt-1
            "
          >
            Continue your material
            harmonization workflow
          </p>

        </div>


        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-3
          "
        >

          {/* IMPORT */}

          <button
            type="button"
            onClick={() =>
              setActiveScreen(
                'ingestion'
              )
            }
            className="
              group
              text-left
              rounded-2xl
              border
              border-[#e4e0d8]
              bg-white
              p-4
              hover:border-[#cfc8bb]
              transition-all
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-[#eef3ef]
                  text-[#4a7c59]
                  flex
                  items-center
                  justify-center
                "
              >

                <Upload size={17} />

              </div>


              <ArrowUpRight
                size={15}
                className="
                  text-[#9a9d97]
                  group-hover:text-[#a5555a]
                "
              />

            </div>


            <div
              className="
                mt-3
                text-xs
                font-bold
              "
            >
              Import Materials
            </div>


            <div
              className="
                mt-1
                text-[10px]
                text-[#74796e]
              "
            >
              Upload CSV, Excel or JSON
              material masters
            </div>

          </button>


          {/* REVIEW */}

          <button
            type="button"
            onClick={() =>
              setActiveScreen(
                'verification'
              )
            }
            className="
              group
              text-left
              rounded-2xl
              border
              border-[#e4e0d8]
              bg-white
              p-4
              hover:border-[#cfc8bb]
              transition-all
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-[#f7eeee]
                  text-[#a5555a]
                  flex
                  items-center
                  justify-center
                "
              >

                <ShieldCheck
                  size={17}
                />

              </div>


              <ArrowUpRight
                size={15}
                className="
                  text-[#9a9d97]
                  group-hover:text-[#a5555a]
                "
              />

            </div>


            <div
              className="
                mt-3
                text-xs
                font-bold
              "
            >
              Review Matches
            </div>


            <div
              className="
                mt-1
                text-[10px]
                text-[#74796e]
              "
            >
              Approve or reject AI
              recommendations
            </div>

          </button>


          {/* CATALOG */}

          <button
            type="button"
            onClick={() =>
              setActiveScreen(
                'catalog'
              )
            }
            className="
              group
              text-left
              rounded-2xl
              border
              border-[#e4e0d8]
              bg-white
              p-4
              hover:border-[#cfc8bb]
              transition-all
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-[#eef1f5]
                  text-[#596f83]
                  flex
                  items-center
                  justify-center
                "
              >

                <Database size={17} />

              </div>


              <ArrowUpRight
                size={15}
                className="
                  text-[#9a9d97]
                  group-hover:text-[#a5555a]
                "
              />

            </div>


            <div
              className="
                mt-3
                text-xs
                font-bold
              "
            >
              Unified Material Master
            </div>


            <div
              className="
                mt-1
                text-[10px]
                text-[#74796e]
              "
            >
              Browse standardized national
              material records
            </div>

          </button>

        </div>

      </motion.div>

    </div>

  );

};


export default DashboardScreen;