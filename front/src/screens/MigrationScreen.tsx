import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { portalApi } from '../services/apiClient';

type MigrationStatus =
  | 'APPROVED'
  | 'READY'
  | 'IN REVIEW'
  | 'MIGRATED';

interface MigrationRecord {
  cpse: string;
  legacyCode: string;
  nationalCode: string;
  nationalMaterialId: number;
  description: string;
  status: MigrationStatus;
  progress: number;
  targetSystem: string;
}

export const MigrationScreen: React.FC = () => {
  const { setActiveScreen, showToast } = useApp();

  /*
   * Migration records are intentionally empty here.
   *
   * The previous INITIAL_RECORDS mock dataset has been removed.
   * Real migration records will be supplied by the backend API
   * when the migration endpoint is available.
   */
  const [records, setRecords] = useState<MigrationRecord[]>([]);
const [filter, setFilter] = useState<'ALL' | MigrationStatus>('ALL');

useEffect(() => {
  const loadMigrationRecords = async () => {
    try {
      const [
  backendMappings,
  materials,
  cpses,
  nationalMaterials,
  auditLogs,
] = await Promise.all([
  portalApi.getMappings(),
  portalApi.getMaterials(),
  portalApi.getCPSEs(),
  portalApi.getNationalMaterials(),
  portalApi.getAuditLogs(),
]);

      const cpseMap = new Map(
        cpses.map((cpse: any) => [
          cpse.id,
          cpse.name || cpse.code || `CPSE-${cpse.id}`,
        ])
      );

      const materialMap = new Map(
        materials.map((material: any) => [
          material.id,
          material,
        ])
      );

      const nationalMap = new Map(
        nationalMaterials.map((material: any) => [
          material.id,
          material,
        ])
      );
      const syncedNationalMaterialIds = new Set(
  auditLogs
    .filter(
      (log: any) =>
        log.action === 'ERP_SYNC_SIMULATED'
    )
    .map(
      (log: any) =>
        Number(log.entity_id)
    )
    .filter(
      (id: number) => Number.isFinite(id)
    )
);

      const migrationRecords: MigrationRecord[] =
        backendMappings.map((mapping: any) => {
          const original = materialMap.get(
            mapping.original_material_id
          );

          const national = nationalMap.get(
            mapping.national_material_id
          );

          return {
            cpse:
              cpseMap.get(original?.cpse_id) ||
              `CPSE-${original?.cpse_id || 'UNKNOWN'}`,

            legacyCode:
              original?.material_code ||
              `MATERIAL-${mapping.original_material_id}`,

            nationalCode:
              national?.national_code ||
              'UNASSIGNED',

            nationalMaterialId: Number(mapping.national_material_id),

            description:
              original?.original_description ||
              'Description unavailable',

            status: syncedNationalMaterialIds.has(
  Number(mapping.national_material_id)
)
  ? 'MIGRATED'
  : mapping.status === 'APPROVED'
  ? 'READY'
  : 'IN REVIEW',

progress: syncedNationalMaterialIds.has(
  Number(mapping.national_material_id)
)
  ? 100
  : mapping.status === 'APPROVED'
  ? 75
  : 25,
            targetSystem: 'SAP / ERP',
          };
        });

      setRecords(migrationRecords);

    } catch (error) {
      console.error(
        'Failed to load migration records:',
        error
      );

      setRecords([]);

      showToast(
        'Unable to load migration records.',
        'error'
      );
    }
  };

  loadMigrationRecords();
}, []);
  const filteredRecords = useMemo(() => {
    if (filter === 'ALL') return records;

    return records.filter(record => record.status === filter);
  }, [records, filter]);
const runMigration = async (
  record: MigrationRecord
) => {
  try {
    const result =
      await portalApi.syncERP(
        record.nationalMaterialId
      );

    setRecords(prev =>
      prev.map(item =>
        item.legacyCode === record.legacyCode
          ? {
              ...item,
              status: 'MIGRATED',
              progress: 100,
            }
          : item
      )
    );

    showToast(
      `${record.legacyCode} prepared for ERP successfully.`,
      'success'
    );

    console.log(
      'ERP sync result:',
      result
    );

  } catch (error: any) {
    console.error(
      'ERP migration failed:',
      error
    );

    showToast(
      error?.message ||
        'Unable to complete ERP migration.',
      'error'
    );
  }
};

  const exportPlan = () => {
    const blob = new Blob(
      [JSON.stringify(records, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'material-rationalization-migration-plan.json';
    anchor.click();

    URL.revokeObjectURL(url);

    showToast('Migration plan exported.', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pb-16 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => setActiveScreen('mapping')}
            className="text-xs font-bold text-[#4a7c59] mb-2 hover:underline"
          >
            ← Back to CPSE Mapping
          </button>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a5555a]">
              sync_alt
            </span>

            <h1 className="text-2xl font-serif font-bold text-[#2e3230]">
              Migration & Rationalization
            </h1>
          </div>

          <p className="text-sm text-[#4a4e4a] mt-1">
            Legacy CPSE material codes mapped to proposed national material
            codes.
          </p>
        </div>

        <button
          type="button"
          onClick={exportPlan}
          className="px-4 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
        >
          Export Migration Plan
        </button>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Legacy Records', records.length],
          [
            'Migrated',
            records.filter(r => r.status === 'MIGRATED').length,
          ],
          [
            'Ready',
            records.filter(r => r.status === 'READY').length,
          ],
          [
            'In Review',
            records.filter(r => r.status === 'IN REVIEW').length,
          ],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="bg-white rounded-2xl border border-[#e4e0d8] p-5"
          >
            <p className="text-[10px] uppercase font-bold text-[#4a4e4a]">
              {label}
            </p>

            <p className="mt-2 text-2xl font-serif font-bold">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-5">
        <div className="flex flex-wrap gap-2">
          {(
            ['ALL', 'MIGRATED', 'READY', 'IN REVIEW', 'APPROVED'] as const
          ).map(value => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold ${
                filter === value
                  ? 'bg-[#a5555a] text-white'
                  : 'bg-[#f5f1ea] border border-[#e4e0d8] text-[#4a4e4a]'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-[#a5555a]">
              sync_alt
            </span>

            <h3 className="mt-3 text-sm font-bold text-[#2e3230]">
              No migration records available
            </h3>

            <p className="mt-1 text-xs text-[#4a4e4a]">
              Migration records will appear here when they are provided by the
              backend.
            </p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div
              key={record.legacyCode}
              className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-5 items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#4a4e4a]">
                    Legacy CPSE Material
                  </p>

                  <p className="mt-2 font-mono font-bold text-[#4a7c59]">
                    {record.legacyCode}
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {record.cpse}
                  </p>

                  <p className="mt-1 text-[11px] text-[#4a4e4a]">
                    {record.description}
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#f5f1ea] border border-[#e4e0d8] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#a5555a]">
                      arrow_forward
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-[#4a4e4a]">
                    Proposed National Code
                  </p>

                  <p className="mt-2 font-mono font-bold text-[#705c30]">
                    {record.nationalCode}
                  </p>

                  <p className="mt-2 text-[11px] text-[#4a4e4a]">
                    Target: {record.targetSystem}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#4a4e4a]">
                    MIGRATION PROGRESS
                  </span>

                  <span className="text-[10px] font-bold">
                    {record.progress}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#eae6de] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4a7c59]"
                    style={{ width: `${record.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                    record.status === 'MIGRATED'
                      ? 'bg-[#c8e8d0] text-[#2a6038]'
                      : record.status === 'IN REVIEW'
                      ? 'bg-[#f4e6c7] text-[#705c30]'
                      : 'bg-[#e5ddf2] text-[#654b7b]'
                  }`}
                >
                  {record.status}
                </span>

                {record.status !== 'MIGRATED' && (
                  <button
                    type="button"
                    onClick={() =>
  runMigration(record)
}
                    className="px-4 py-2 rounded-xl bg-[#a5555a] text-white text-[10px] font-bold"
                  >
                    Mark Migration Complete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setActiveScreen('erp')}
          className="px-5 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
        >
          Continue to ERP Integration →
        </button>
      </div>
    </motion.div>
  );
};