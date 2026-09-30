import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { portalApi } from '../services/apiClient';

interface ERPMaterialRecord {
  nationalMaterialId: number;
  legacyCode: string;
  originalDescription: string;
  nationalCode: string;
  standardizedDescription: string;
  syncStatus: string;
  syncedAt: string;
}

interface ERPConnection {
  cpse: string;
  system: string;
  status: 'CONNECTED' | 'SYNCING' | 'AVAILABLE';
  lastSync: string;
  records: ERPMaterialRecord[];
}

export const ERPIntegrationScreen: React.FC = () => {
  const { setActiveScreen, showToast } = useApp();

  const [connections, setConnections] =
    useState<ERPConnection[]>([]);

  const [selectedConnection, setSelectedConnection] =
    useState<ERPConnection | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadERPData = async () => {
      try {
        setLoading(true);

        const [
          auditLogs,
          nationalMaterials,
          mappings,
          materials,
          cpses,
        ] = await Promise.all([
          portalApi.getAuditLogs(),
          portalApi.getNationalMaterials(),
          portalApi.getMappings(),
          portalApi.getMaterials(),
          portalApi.getCPSEs(),
        ]);

        const cpseMap = new Map(
          cpses.map((cpse: any) => [
            cpse.id,
            cpse.name ||
              cpse.code ||
              `CPSE-${cpse.id}`,
          ])
        );

        const materialMap = new Map(
          materials.map((material: any) => [
            material.id,
            material,
          ])
        );

        const approvedMappings = mappings.filter(
          (mapping: any) =>
            mapping.status === 'APPROVED'
        );

        const erpSyncLogs = auditLogs.filter(
          (log: any) =>
            log.action === 'ERP_SYNC_SIMULATED'
        );

        const syncedMaterialIds = new Set(
          erpSyncLogs.map((log: any) =>
            Number(log.entity_id)
          )
        );

        const connectionMap =
          new Map<string, ERPConnection>();

        for (const mapping of approvedMappings) {
          const nationalMaterialId =
            Number(mapping.national_material_id);

          if (
            !syncedMaterialIds.has(
              nationalMaterialId
            )
          ) {
            continue;
          }

          const original =
            materialMap.get(
              mapping.original_material_id
            );

          const national =
            nationalMaterials.find(
              (item: any) =>
                Number(item.id) ===
                nationalMaterialId
            );

          const cpseName =
            cpseMap.get(
              original?.cpse_id
            ) ||
            `CPSE-${
              original?.cpse_id || 'UNKNOWN'
            }`;

          const syncLog =
            erpSyncLogs.find(
              (log: any) =>
                Number(log.entity_id) ===
                nationalMaterialId
            );

          const materialRecord: ERPMaterialRecord = {
  nationalMaterialId,
  legacyCode:
    original?.material_code ||
              `MATERIAL-${
                mapping.original_material_id
              }`,

            originalDescription:
              original?.original_description ||
              'Description unavailable',

            nationalCode:
              national?.national_code ||
              'UNASSIGNED',

            standardizedDescription:
              national?.standard_description ||
              'Unavailable',

            syncStatus: 'SYNC RECORDED',

            syncedAt:
              syncLog?.timestamp
                ? new Date(
                    syncLog.timestamp
                  ).toLocaleString()
                : 'Recently synced',
          };

          const existing =
            connectionMap.get(cpseName);

          if (existing) {
            existing.records.push(
              materialRecord
            );
          } else {
            connectionMap.set(
              cpseName,
              {
                cpse: cpseName,
                system: 'SAP / ERP',
                status: 'CONNECTED',

                lastSync:
                  syncLog?.timestamp
                    ? new Date(
                        syncLog.timestamp
                      ).toLocaleString()
                    : 'Recently synced',

                records: [
                  materialRecord,
                ],
              }
            );
          }
        }

        setConnections(
          Array.from(
            connectionMap.values()
          )
        );
      } catch (error) {
        console.error(
          'Failed to load ERP integration data:',
          error
        );

        setConnections([]);
      } finally {
        setLoading(false);
      }
    };

    loadERPData();
  }, []);
  const triggerSync = async () => {
    if (connections.length === 0) {
      showToast(
        'No ERP synchronization records are available.',
        'warning'
      );
      return;
    }

    try {
      const nationalMaterialIds = Array.from(
        new Set(
          connections.flatMap(connection =>
            connection.records.map(
              record => record.nationalMaterialId
            )
          )
        )
      );

      for (const nationalMaterialId of nationalMaterialIds) {
        await portalApi.syncERP(nationalMaterialId);
      }

      showToast(
        'ERP synchronization completed successfully.',
        'success'
      );

    } catch (error) {
      console.error(
        'ERP synchronization failed:',
        error
      );

      showToast(
        'ERP synchronization failed.',
        'error'
      );
    }
  };
  const exportMapping = () => {
    if (connections.length === 0) {
      showToast(
        'No ERP mapping data is available to export.',
        'warning'
      );
      return;
    }

    const rows = [
      'CPSE,ERP System,National Material Code,Legacy Code,Status',
    ];

    connections.forEach(connection => {
      connection.records.forEach(record => {
        rows.push(
          [
            connection.cpse,
            connection.system,
            record.nationalCode,
            record.legacyCode,
            record.syncStatus,
          ]
            .map(value =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
            )
            .join(',')
        );
      });
    });

    const data = rows.join('\n');

    const blob = new Blob([data], {
      type: 'text/csv',
    });

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;
    anchor.download =
      'national-material-erp-mapping.csv';

    anchor.click();

    URL.revokeObjectURL(url);

    showToast(
      'ERP mapping exported as CSV.',
      'success'
    );
  };

  const downloadMaster = () => {
    if (connections.length === 0) {
      showToast(
        'No standardized material master data is available to download.',
        'warning'
      );
      return;
    }

    const cpseMappings =
      connections.flatMap(
        connection =>
          connection.records.map(
            record => ({
              cpse: connection.cpse,
              erpSystem:
                connection.system,
              legacyCode:
                record.legacyCode,
              originalDescription:
                record.originalDescription,
              nationalCode:
                record.nationalCode,
              standardizedDescription:
                record.standardizedDescription,
              syncStatus:
                record.syncStatus,
              syncedAt:
                record.syncedAt,
            })
          )
      );

    const master = {
      generatedAt:
        new Date().toISOString(),

      source:
        'SIH_26099_NATIONAL_MATERIAL_MASTER',

      cpseMappings,
    };

    const blob = new Blob(
      [
        JSON.stringify(
          master,
          null,
          2
        ),
      ],
      {
        type: 'application/json',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;

    anchor.download =
      'standardized-national-material-master.json';

    anchor.click();

    URL.revokeObjectURL(url);

    showToast(
      'Standardized material master downloaded.',
      'success'
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="w-full pb-16 space-y-6"
    >

      {/* HEADER */}

      <div>
        <button
          type="button"
          onClick={() =>
            setActiveScreen(
              'migration'
            )
          }
          className="text-xs font-bold text-[#4a7c59] mb-2 hover:underline"
        >
          ← Back to Migration
        </button>

        <div className="flex items-center gap-2">

          <span className="material-symbols-outlined text-[#a5555a]">
            lan
          </span>

          <h1 className="text-2xl font-serif font-bold text-[#2e3230]">
            ERP / SAP Integration
          </h1>

        </div>

        <p className="text-sm text-[#4a4e4a] mt-1">
          Integration-ready layer for participating
          CPSE ERP systems.
        </p>
      </div>


      {/* INTEGRATION MODE */}

      <section className="bg-[#fffaf0] border border-[#ead9ad] rounded-2xl p-5">

        <div className="flex gap-3">

          <span className="material-symbols-outlined text-[#8a6d30]">
            info
          </span>

          <div>

            <p className="font-bold text-[#705c30]">
              Integration Mode
            </p>

            <p className="text-[11px] text-[#705c30] mt-1 leading-relaxed">
              ERP connectivity and export flows will use
              backend-provided integration status and
              standardized material data.
            </p>

          </div>

        </div>

      </section>


      {/* ERP CONNECTION CARDS */}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {loading ? (

          <div className="sm:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-8 text-center">

            <p className="text-sm font-bold">
              Loading ERP synchronization data...
            </p>

          </div>

        ) : connections.length > 0 ? (

          connections.map(
            connection => (

              <button
                type="button"
                key={connection.cpse}
                onClick={() =>
                  setSelectedConnection(
                    connection
                  )
                }
                className="w-full text-left bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-5 hover:shadow-md hover:border-[#a5555a] transition"
              >

                <div className="flex items-center justify-between">

                  <span className="font-serif text-lg font-bold">
                    {connection.cpse}
                  </span>

                  <span className="w-2.5 h-2.5 rounded-full bg-[#4a7c59]" />

                </div>


                <p className="mt-3 text-sm font-bold">
                  {connection.system}
                </p>


                <span className="inline-flex mt-2 px-2 py-1 rounded-full bg-[#c8e8d0] text-[#2a6038] text-[9px] font-bold">
                  {connection.status}
                </span>


                <div className="mt-4 space-y-1">

                  <p className="text-[10px] text-[#4a4e4a]">
                    Last Sync
                  </p>

                  <p className="text-[11px] font-semibold">
                    {connection.lastSync}
                  </p>


                  <p className="text-[10px] text-[#4a4e4a] mt-2">
                    Records
                  </p>

                  <p className="text-sm font-bold">
                    {connection.records.length.toLocaleString()}
                  </p>

                </div>

                <p className="mt-4 text-[10px] font-semibold text-[#4a7c59]">
                  Click to view synced materials →
                </p>

              </button>

            )
          )

        ) : (

          <div className="sm:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-8">

            <div className="flex flex-col items-center justify-center text-center min-h-[180px]">

              <span className="material-symbols-outlined text-4xl text-[#a5555a]">
                lan
              </span>

              <h2 className="mt-3 text-sm font-bold text-[#2e3230]">
                No ERP connections available
              </h2>

              <p className="mt-1 max-w-md text-[11px] text-[#4a4e4a] leading-relaxed">
                ERP connection status and synchronization
                information will appear here when supplied
                by the backend integration service.
              </p>

            </div>

          </div>

        )}

      </section>


      {/* ERP SYNCHRONIZATION DETAILS */}

      {selectedConnection && (

        <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">

          <div className="p-5 border-b border-[#eae6de] bg-[#f0ece4] flex items-center justify-between">

            <div>

              <h2 className="font-bold">
                ERP Synchronization Details
              </h2>

              <p className="text-[11px] text-[#4a4e4a] mt-1">
                {selectedConnection.cpse}
                {' → '}
                SAP / ERP
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedConnection(
                  null
                )
              }
              className="text-xs font-bold text-[#a5555a] hover:underline"
            >
              Close
            </button>

          </div>


          <div className="p-5">

            {/* SUMMARY */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

              <div className="rounded-xl bg-[#f5f1ea] p-4">

                <p className="text-[10px] text-[#4a4e4a]">
                  CPSE
                </p>

                <p className="text-sm font-bold mt-1">
                  {selectedConnection.cpse}
                </p>

              </div>


              <div className="rounded-xl bg-[#f5f1ea] p-4">

                <p className="text-[10px] text-[#4a4e4a]">
                  ERP System
                </p>

                <p className="text-sm font-bold mt-1">
                  {selectedConnection.system}
                </p>

              </div>


              <div className="rounded-xl bg-[#f5f1ea] p-4">

                <p className="text-[10px] text-[#4a4e4a]">
                  Last Sync
                </p>

                <p className="text-sm font-bold mt-1">
                  {selectedConnection.lastSync}
                </p>

              </div>

            </div>


            {/* MATERIAL TABLE */}

            <h3 className="text-sm font-bold mb-3">
              Synced Materials
            </h3>


            <div className="overflow-x-auto border border-[#e4e0d8] rounded-xl">

              <table className="w-full text-left">

                <thead className="bg-[#f5f1ea]">

                  <tr>

                    <th className="px-4 py-3 text-[10px] font-bold">
                      Legacy Code
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold">
                      Original Description
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold">
                      National Code
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold">
                      Standardized Description
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold">
                      Sync Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {selectedConnection.records.map(
                    (
                      record,
                      index
                    ) => (

                      <tr
                        key={`${record.legacyCode}-${index}`}
                        className="border-t border-[#eae6de]"
                      >

                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#4a7c59]">
                          {record.legacyCode}
                        </td>


                        <td className="px-4 py-3 text-xs">
                          {record.originalDescription}
                        </td>


                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#705c30]">
                          {record.nationalCode}
                        </td>


                        <td className="px-4 py-3 text-xs font-semibold">
                          {record.standardizedDescription}
                        </td>


                        <td className="px-4 py-3">

                          <span className="inline-flex px-2 py-1 rounded-full bg-[#c8e8d0] text-[#2a6038] text-[9px] font-bold">
                            {record.syncStatus}
                          </span>

                          <p className="text-[9px] text-[#4a4e4a] mt-1">
                            {record.syncedAt}
                          </p>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* DEMO NOTICE */}

            <div className="mt-4 p-3 rounded-xl bg-[#fffaf0] border border-[#ead9ad]">

              <p className="text-[10px] text-[#705c30]">

                <strong>
                  Integration mode:
                </strong>{' '}

                SAP / ERP synchronization is currently
                recorded through the backend integration
                layer for demonstration.

              </p>

            </div>

          </div>

        </section>

      )}


      {/* INTEGRATION ARCHITECTURE */}

      <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">

        <div className="p-5 border-b border-[#eae6de] bg-[#f0ece4]">

          <h2 className="font-bold">
            Integration Architecture
          </h2>

        </div>


        <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-3">

          {[
            ['SAP / ERP', 'business'],
            ['REST / API Adapter', 'api'],
            ['NCMH Backend', 'dns'],
            ['AI Engine', 'psychology'],
            ['Unified Material Master', 'dataset'],
          ].map(
            ([label, icon], index) => (

              <React.Fragment
                key={label}
              >

                <div className="w-full md:w-44 p-4 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8] text-center">

                  <span className="material-symbols-outlined text-[#a5555a]">
                    {icon}
                  </span>

                  <p className="mt-2 text-xs font-bold">
                    {label}
                  </p>

                </div>


                {index < 4 && (

                  <span className="material-symbols-outlined text-[#4a7c59] rotate-90 md:rotate-0">
                    arrow_forward
                  </span>

                )}

              </React.Fragment>

            )
          )}

        </div>

      </section>


      {/* ERP ACTIONS */}

      <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-5">

        <h2 className="font-bold">
          ERP Actions
        </h2>


        <div className="mt-4 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={exportMapping}
            className="px-4 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
          >
            Export Mapping
          </button>


          <button
            type="button"
            onClick={downloadMaster}
            className="px-4 py-2.5 rounded-xl bg-[#4a7c59] text-white text-xs font-bold"
          >
            Download Standardized Master
          </button>


          <button
  type="button"
  onClick={triggerSync}
  className="px-4 py-2.5 rounded-xl bg-[#f0ece4] border border-[#e4e0d8] text-xs font-bold"
>
  Trigger Sync
</button>

        </div>

      </section>


      {/* CONTINUE */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={() =>
            setActiveScreen(
              'assistant'
            )
          }
          className="px-5 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
        >
          Continue to Material Assistant →
        </button>

      </div>

    </motion.div>
  );
};