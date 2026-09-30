import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { useApp } from '../context/AppContext';
import { portalApi } from '../services/apiClient';
import {
  staggerContainerVariants,
  staggerCardVariants,
} from '../utils/animationVariants';

interface NationalMaterial {
  id: number;
  national_code: string;
  standard_description: string | null;
  category: string | null;
  status: string;
}

interface Material {
  id: number;
  cpse_id: number;
  material_code: string;
  original_description: string;
  original_specifications?: string | null;
  original_unit?: string | null;
  category?: string | null;
  technical_parameters?: string | null;
}

interface CPSE {
  id: number;
  code: string;
  name: string;
}

interface Mapping {
  id: number;
  original_material_id: number;
  national_material_id: number;
  match_type: string;
  confidence: string;
  explanation?: string | null;
  status: string;
}

interface Analytics {
  total_cpse: number;
  total_materials: number;
  total_national_materials: number;
  total_mappings: number;
  approved_mappings: number;
  pending_mappings: number;
  rejected_mappings: number;
  total_audit_logs: number;
}

interface AuditLog {
  id: number;
  entity_id?: number | null;
  action?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  user?: string | null;
  timestamp?: string | null;
  reason?: string | null;
}

interface TraceabilityRecord {
  cpse_id: number;
  cpse_name: string;
  cpse_code: string;
  material_id: number;
  material_code: string;
  original_description: string;
  original_specifications?: string | null;
  original_unit?: string | null;
  mapping_id: number;
  match_type: string;
  confidence: string;
  mapping_status: string;
}

export const CatalogScreen: React.FC = () => {
  const {
    showToast,
    selectedCatalogCnmc,
    setSelectedCatalogCnmc,
    setActiveScreen,
  } = useApp();

  const [nationalMaterials, setNationalMaterials] = useState<
    NationalMaterial[]
  >([]);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [cpseList, setCpseList] = useState<CPSE[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [traceability, setTraceability] = useState<
    TraceabilityRecord[]
  >([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCpse, setSelectedCpse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<NationalMaterial | null>(null);

  const [loading, setLoading] = useState(true);
  const [traceLoading, setTraceLoading] = useState(false);
  const [erpLoading, setErpLoading] = useState(false);

  /*
   * ------------------------------------------------------------
   * LOAD REAL BACKEND DATA
   * ------------------------------------------------------------
   */

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        fetchedNationalMaterials,
        fetchedMaterials,
        fetchedCpses,
        fetchedMappings,
        fetchedAnalytics,
      ] = await Promise.all([
        portalApi.getNationalMaterials(),
        portalApi.getMaterials(),
        portalApi.getCPSEs(),
        portalApi.getMappings(),
        portalApi.getAnalytics(),
      ]);

      setNationalMaterials(fetchedNationalMaterials || []);
      setMaterials(fetchedMaterials || []);
      setCpseList(fetchedCpses || []);
      setMappings(fetchedMappings || []);
      setAnalytics(fetchedAnalytics || null);

      // Audit logs are intentionally loaded separately.
      // A large audit table should never block the catalog.
      try {
        const fetchedAuditLogs = await portalApi.getAuditLogs();
        setAuditLogs(fetchedAuditLogs || []);
      } catch (auditError) {
        console.warn(
          'Audit logs could not be loaded:',
          auditError
        );
        setAuditLogs([]);
      }

      if (selectedCatalogCnmc) {
        const existing =
          (fetchedNationalMaterials || []).find(
            (item: NationalMaterial) =>
              item.national_code === selectedCatalogCnmc
          );

        if (existing) {
          setSelectedMaterial(existing);
        }
      }
    } catch (error) {
      console.error(
        'Failed to load catalog data:',
        error
      );

      showToast(
        'Unable to load standardized catalog data from backend.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
   * ------------------------------------------------------------
   * MATERIAL + MAPPING HELPERS
   * ------------------------------------------------------------
   */

  const getMappingsForNationalMaterial = (
    nationalMaterialId: number
  ) => {
    return mappings.filter(
      mapping =>
        mapping.national_material_id === nationalMaterialId
    );
  };

  const getMaterial = (materialId: number) => {
    return materials.find(
      material => material.id === materialId
    );
  };

  const getCpse = (cpseId: number) => {
    return cpseList.find(
      cpse => cpse.id === cpseId
    );
  };

  const getCpseNamesForNationalMaterial = (
    nationalMaterialId: number
  ) => {
    const relatedMappings =
      getMappingsForNationalMaterial(
        nationalMaterialId
      );

    const names = relatedMappings
      .map(mapping => {
        const material = getMaterial(
          mapping.original_material_id
        );

        if (!material) {
          return null;
        }

        const cpse = getCpse(material.cpse_id);

        return (
          cpse?.name ||
          cpse?.code ||
          null
        );
      })
      .filter(Boolean) as string[];

    return [...new Set(names)];
  };

  /*
   * ------------------------------------------------------------
   * FILTERING
   * ------------------------------------------------------------
   */

  const filteredMaterials = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return nationalMaterials.filter(material => {
      const mappingsForMaterial =
        getMappingsForNationalMaterial(material.id);

      const cpseNames =
        getCpseNamesForNationalMaterial(material.id);

      const matchesSearch =
        query === '' ||
        material.national_code
          .toLowerCase()
          .includes(query) ||
        (material.standard_description || '')
          .toLowerCase()
          .includes(query) ||
        (material.category || '')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        selectedStatus === 'ALL' ||
        mappingsForMaterial.some(
          mapping =>
            mapping.status === selectedStatus
        );

      const matchesCpse =
        selectedCpse === 'ALL' ||
        mappingsForMaterial.some(mapping => {
          const original = getMaterial(
            mapping.original_material_id
          );

          if (!original) {
            return false;
          }

          const cpse = getCpse(original.cpse_id);

          return (
            cpse?.code === selectedCpse ||
            cpse?.name === selectedCpse
          );
        });

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCpse &&
        cpseNames.length >= 0
      );
    });
  }, [
    nationalMaterials,
    mappings,
    materials,
    cpseList,
    searchTerm,
    selectedStatus,
    selectedCpse,
  ]);

  /*
   * ------------------------------------------------------------
   * SELECT MATERIAL
   * ------------------------------------------------------------
   */

  const handleSelectMaterial = async (
    material: NationalMaterial
  ) => {
    setSelectedMaterial(material);
    setSelectedCatalogCnmc(material.national_code);
    setSelectedIds([material.id]);

    setTraceLoading(true);

    try {
      const result =
        await portalApi.getNationalMaterialCPSEMaterials(
          material.id
        );

      setTraceability(result?.results || []);
    } catch (error) {
      console.error(error);

      setTraceability([]);

      showToast(
        'Unable to load CPSE traceability.',
        'error'
      );
    } finally {
      setTraceLoading(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * CHECKBOX
   * ------------------------------------------------------------
   */

  const toggleSelection = (
    id: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    setSelectedIds(previous =>
      previous.includes(id)
        ? previous.filter(item => item !== id)
        : [...previous, id]
    );
  };

  /*
   * ------------------------------------------------------------
   * EXPORT REAL DATA
   * ------------------------------------------------------------
   */

  const handleExport = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      national_materials: nationalMaterials,
      mappings,
      materials,
      cpse: cpseList,
      analytics,
      audit_logs: auditLogs,
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      {
        type: 'application/json',
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download =
      `national-material-master-${new Date()
        .toISOString()
        .split('T')[0]}.json`;

    anchor.click();

    URL.revokeObjectURL(url);

    showToast(
      'Real catalog data exported successfully.',
      'success'
    );
  };

  /*
   * ------------------------------------------------------------
   * ERP SYNC
   * ------------------------------------------------------------
   */

  const handleErpSync = async () => {
    if (!selectedMaterial) {
      showToast(
        'Select a national material first.',
        'info'
      );
      return;
    }

    setErpLoading(true);

    try {
      const result =
        await portalApi.syncERP(
          selectedMaterial.id
        );

      showToast(
        result?.message ||
          'ERP synchronization completed.',
        'success'
      );
    } catch (error) {
      console.error(error);

      showToast(
        'ERP synchronization failed.',
        'error'
      );
    } finally {
      setErpLoading(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * RESET
   * ------------------------------------------------------------
   */

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCpse('ALL');
    setSelectedStatus('ALL');

    showToast(
      'Catalog filters reset.',
      'info'
    );
  };

  /*
   * ------------------------------------------------------------
   * STATUS COUNTS
   * ------------------------------------------------------------
   */

  const pendingCount =
    analytics?.pending_mappings ??
    mappings.filter(
      mapping => mapping.status === 'PENDING'
    ).length;

  const approvedCount =
    analytics?.approved_mappings ??
    mappings.filter(
      mapping => mapping.status === 'APPROVED'
    ).length;

  const rejectedCount =
    analytics?.rejected_mappings ??
    mappings.filter(
      mapping => mapping.status === 'REJECTED'
    ).length;

  /*
   * ------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------
   */

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col w-full pb-16 space-y-8"
    >
      {/* HEADER */}

      <motion.div
        variants={staggerCardVariants}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#c8e8d0]/60 text-[#2a6038]">
              <span className="w-2 h-2 rounded-full bg-[#4a7c59]" />
              LIVE BACKEND DATA
            </span>

            <span className="text-xs font-semibold text-[#705c30]">
              NATIONAL MATERIAL MASTER
            </span>
          </div>

          <h1 className="font-serif font-semibold text-3xl text-[#2e3230]">
            Standardized Material Catalog
          </h1>

          <p className="text-sm text-[#4a4e4a] mt-2 max-w-3xl">
            Centralized national material master with CPSE
            mappings, approval status, traceability and
            audit information.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4a7c59] text-white text-xs font-bold hover:bg-[#3f6d4d]"
        >
          <span className="material-symbols-outlined text-[17px]">
            file_download
          </span>

          Export Real Data
        </button>
      </motion.div>

      {/* ANALYTICS */}

      <motion.div
        variants={staggerCardVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4a4e4a]">
            National Materials
          </p>

          <p className="text-3xl font-bold text-[#2e3230] mt-2">
            {analytics?.total_national_materials ??
              nationalMaterials.length}
          </p>

          <p className="text-xs text-[#4a4e4a] mt-1">
            Standardized master records
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4a4e4a]">
            Source Materials
          </p>

          <p className="text-3xl font-bold text-[#2e3230] mt-2">
            {analytics?.total_materials ??
              materials.length}
          </p>

          <p className="text-xs text-[#4a4e4a] mt-1">
            Original CPSE records
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4a4e4a]">
            Mappings
          </p>

          <p className="text-3xl font-bold text-[#2e3230] mt-2">
            {analytics?.total_mappings ??
              mappings.length}
          </p>

          <p className="text-xs text-[#4a4e4a] mt-1">
            CPSE → national mappings
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4a4e4a]">
            Audit Records
          </p>

          <p className="text-3xl font-bold text-[#2e3230] mt-2">
            {analytics?.total_audit_logs ??
              auditLogs.length}
          </p>

          <p className="text-xs text-[#4a4e4a] mt-1">
            Recorded system events
          </p>
        </div>
      </motion.div>

      {/* WORKFLOW STATUS */}

      <motion.div
        variants={staggerCardVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-[#fff8e8] border border-[#ead9b7] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#705c30]">
            PENDING REVIEW
          </p>

          <p className="text-2xl font-bold text-[#2e3230] mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="bg-[#eef8f1] border border-[#c8e8d0] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#2a6038]">
            APPROVED
          </p>

          <p className="text-2xl font-bold text-[#2e3230] mt-1">
            {approvedCount}
          </p>
        </div>

        <div className="bg-[#fff0f0] border border-[#eccaca] rounded-2xl p-4">
          <p className="text-xs font-bold text-[#8a3d3d]">
            REJECTED
          </p>

          <p className="text-2xl font-bold text-[#2e3230] mt-1">
            {rejectedCount}
          </p>
        </div>
      </motion.div>

      {/* MAIN */}

      <motion.div
        variants={staggerCardVariants}
        className="grid grid-cols-1 xl:grid-cols-8 gap-6"
      >
        {/* LEFT */}

        <div className="xl:col-span-5 space-y-5">

          {/* FILTERS */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3">

              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4e4a] text-[20px]">
                  search
                </span>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={event =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search national code, description or category..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f5f1ea] rounded-xl border border-[#e4e0d8] text-sm focus:outline-none"
                />
              </div>

              <select
                value={selectedCpse}
                onChange={event =>
                  setSelectedCpse(event.target.value)
                }
                className="bg-[#f5f1ea] rounded-xl border border-[#e4e0d8] px-3 py-2.5 text-sm"
              >
                <option value="ALL">
                  All CPSEs
                </option>

                {cpseList.map(cpse => (
                  <option
                    key={cpse.id}
                    value={cpse.code}
                  >
                    {cpse.name || cpse.code}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={event =>
                  setSelectedStatus(event.target.value)
                }
                className="bg-[#f5f1ea] rounded-xl border border-[#e4e0d8] px-3 py-2.5 text-sm"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
                </option>
              </select>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2.5 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-sm font-semibold"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#4a4e4a]">
              <span>
                Showing{' '}
                <strong>
                  {filteredMaterials.length}
                </strong>{' '}
                of{' '}
                <strong>
                  {nationalMaterials.length}
                </strong>{' '}
                national materials
              </span>

              <span>
                {selectedIds.length} selected
              </span>
            </div>
          </div>

          {/* TABLE */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">

                <thead className="bg-[#f0ece4] text-[#4a4e4a] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">
                      Select
                    </th>

                    <th className="px-3 py-3">
                      National Code
                    </th>

                    <th className="px-3 py-3">
                      Standard Description
                    </th>

                    <th className="px-3 py-3">
                      CPSE Mappings
                    </th>

                    <th className="px-3 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-[#4a4e4a]"
                      >
                        Loading real catalog data...
                      </td>
                    </tr>
                  ) : filteredMaterials.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-[#4a4e4a]"
                      >
                        No national materials found.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map(material => {
                      const mappingsForMaterial =
                        getMappingsForNationalMaterial(
                          material.id
                        );

                      const mappingCount =
                        mappingsForMaterial.length;

                      const isSelected =
                        selectedMaterial?.id ===
                        material.id;

                      const isChecked =
                        selectedIds.includes(
                          material.id
                        );

                      return (
                        <tr
                          key={material.id}
                          onClick={() =>
                            handleSelectMaterial(
                              material
                            )
                          }
                          className={`
                            cursor-pointer border-t border-[#eae6de]
                            transition-colors
                            ${
                              isSelected
                                ? 'bg-[#4a7c59]/5'
                                : 'hover:bg-[#f5f1ea]'
                            }
                          `}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onClick={event =>
                                toggleSelection(
                                  material.id,
                                  event
                                )
                              }
                              onChange={() => {}}
                              className="accent-[#4a7c59]"
                            />
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-mono font-bold text-[#4a7c59]">
                              {material.national_code}
                            </div>

                            <div className="text-[10px] text-[#4a4e4a] mt-1">
                              ID #{material.id}
                            </div>
                          </td>

                          <td className="px-3 py-3 max-w-[260px]">
                            <div className="font-semibold text-[#2e3230]">
                              {material.standard_description}
                            </div>

                            {material.category && (
                              <div className="text-[10px] text-[#4a4e4a] mt-1">
                                Category:{' '}
                                {material.category}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f0ece4] font-bold text-[#4a4e4a]">
                              {mappingCount}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className={`
                                inline-flex px-2 py-1 rounded-full text-xs
                                ${
                                  mappingsForMaterial.some(
                                    mapping =>
                                      mapping.status ===
                                      'APPROVED'
                                  )
                                    ? 'bg-[#c8e8d0]/60 text-[#2a6038]'
                                    : mappingsForMaterial.some(
                                        mapping =>
                                          mapping.status ===
                                          'REJECTED'
                                      )
                                      ? 'bg-[#f8dada] text-[#8a3d3d]'
                                      : 'bg-[#f5e7c7] text-[#705c30]'
                                }
                              `}
                            >
                              {mappingsForMaterial.some(
                                mapping =>
                                  mapping.status ===
                                  'APPROVED'
                              )
                                ? 'APPROVED'
                                : mappingsForMaterial.some(
                                    mapping =>
                                      mapping.status ===
                                      'REJECTED'
                                  )
                                  ? 'REJECTED'
                                  : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>
          </div>

          {/* SELECTED MATERIAL */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
                Material Details
              </h2>

              <span className="material-symbols-outlined text-[#4a7c59]">
                inventory_2
              </span>
            </div>

            {!selectedMaterial ? (
              <div className="py-8 text-center text-sm text-[#4a4e4a]">
                Select a national material from the
                table to inspect it.
              </div>
            ) : (
              <div className="space-y-4">

                <div className="p-4 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                    National Code
                  </p>

                  <p className="font-mono font-bold text-[#4a7c59] mt-1">
                    {selectedMaterial.national_code}
                  </p>

                  <p className="font-semibold text-[#2e3230] mt-3">
                    {selectedMaterial.standard_description}
                  </p>

                  {selectedMaterial.category && (
                    <p className="text-xs text-[#4a4e4a] mt-2">
                      Category:{' '}
                      {selectedMaterial.category}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div className="p-3 rounded-xl bg-[#f5f1ea]">
                    <p className="text-[10px] text-[#4a4e4a]">
                      Mappings
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {
                        getMappingsForNationalMaterial(
                          selectedMaterial.id
                        ).length
                      }
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f5f1ea]">
                    <p className="text-[10px] text-[#4a4e4a]">
                      Status
                    </p>

                    <p className="text-sm font-bold mt-2">
                      {(() => {
                        const selectedMappings =
                          getMappingsForNationalMaterial(
                            selectedMaterial.id
                          );

                        return selectedMappings.some(
                          mapping =>
                            mapping.status ===
                            'APPROVED'
                        )
                          ? 'APPROVED'
                          : selectedMappings.some(
                              mapping =>
                                mapping.status ===
                                'REJECTED'
                            )
                            ? 'REJECTED'
                            : 'PENDING';
                      })()}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveScreen(
                      'material-details'
                    )
                  }
                  className="w-full py-2.5 rounded-xl bg-[#4a7c59] text-white text-xs font-bold"
                >
                  Open Material Details
                </button>

                <button
                  type="button"
                  onClick={handleErpSync}
                  disabled={erpLoading}
                  className="w-full py-2.5 rounded-xl bg-[#f0ece4] border border-[#e4e0d8] text-[#2e3230] text-xs font-bold disabled:opacity-50"
                >
                  {erpLoading
                    ? 'Synchronizing...'
                    : 'Sync to ERP'}
                </button>

              </div>
            )}
          </div>

          {/* TRACEABILITY */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
                CPSE Traceability
              </h2>

              <span className="material-symbols-outlined text-[#705c30]">
                account_tree
              </span>
            </div>

            {!selectedMaterial ? (
              <p className="text-xs text-[#4a4e4a]">
                Select a material to view its original
                CPSE records.
              </p>
            ) : traceLoading ? (
              <p className="text-xs text-[#4a4e4a]">
                Loading traceability...
              </p>
            ) : traceability.length === 0 ? (
              <p className="text-xs text-[#4a4e4a]">
                No CPSE mappings found for this national
                material.
              </p>
            ) : (
              <div className="space-y-3">
                {traceability.map(record => (
                  <div
                    key={record.mapping_id}
                    className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#2e3230]">
                        {record.cpse_name}
                      </span>

                      <span className="text-[10px] font-bold text-[#705c30]">
                        {record.mapping_status}
                      </span>
                    </div>

                    <div className="text-xs mt-2">
                      <span className="font-mono font-bold text-[#4a7c59]">
                        {record.material_code}
                      </span>
                    </div>

                    <p className="text-xs text-[#4a4e4a] mt-1">
                      {record.original_description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                      <span className="px-2 py-1 rounded bg-white border border-[#e4e0d8]">
                        {record.match_type}
                      </span>

                      <span className="px-2 py-1 rounded bg-white border border-[#e4e0d8]">
                        {record.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AUDIT */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
                Recent Audit Activity
              </h2>

              <span className="material-symbols-outlined text-[#4a7c59]">
                history
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-[#4a4e4a]">
                No audit records available.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
                {auditLogs
                  .slice(-8)
                  .reverse()
                  .map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#2e3230]">
                          {log.action ||
                            'AUDIT EVENT'}
                        </span>

                        <span className="text-[10px] text-[#4a4e4a]">
                          #{log.id}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#4a4e4a] mt-1">
                        User:{' '}
                        {log.user || 'SYSTEM'}
                      </p>

                      {log.reason && (
                        <p className="text-[11px] text-[#4a4e4a] mt-1">
                          {log.reason}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT */}

        <div className="xl:col-span-3 space-y-5">

          {/* MATERIAL DETAILS */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
                Material Details
              </h2>

              <span className="material-symbols-outlined text-[#4a7c59]">
                inventory_2
              </span>
            </div>

            {!selectedMaterial ? (
              <div className="py-8 text-center text-sm text-[#4a4e4a]">
                Select a national material from the
                table to inspect it.
              </div>
            ) : (
              <div className="space-y-4">

                <div className="p-4 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                    National Code
                  </p>

                  <p className="font-mono font-bold text-[#4a7c59] mt-1">
                    {selectedMaterial.national_code}
                  </p>

                  <p className="font-semibold text-[#2e3230] mt-3">
                    {selectedMaterial.standard_description}
                  </p>

                  {selectedMaterial.category && (
                    <p className="text-xs text-[#4a4e4a] mt-2">
                      Category:{' '}
                      {selectedMaterial.category}
                    </p>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* TRACEABILITY */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
                CPSE Traceability
              </h2>

              <span className="material-symbols-outlined text-[#705c30]">
                account_tree
              </span>
            </div>

            {!selectedMaterial ? (
              <p className="text-xs text-[#4a4e4a]">
                Select a material to view its original
                CPSE records.
              </p>
            ) : traceLoading ? (
              <p className="text-xs text-[#4a4e4a]">
                Loading traceability...
              </p>
            ) : traceability.length === 0 ? (
              <p className="text-xs text-[#4a4e4a]">
                No CPSE mappings found for this national
                material.
              </p>
            ) : (
              <div className="space-y-3">
                {traceability.map(record => (
                  <div
                    key={record.mapping_id}
                    className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#2e3230]">
                        {record.cpse_name}
                      </span>

                      <span className="text-[10px] font-bold text-[#705c30]">
                        {record.mapping_status}
                      </span>
                    </div>

                    <div className="text-xs mt-2">
                      <span className="font-mono font-bold text-[#4a7c59]">
                        {record.material_code}
                      </span>
                    </div>

                    <p className="text-xs text-[#4a4e4a] mt-1">
                      {record.original_description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AUDIT */}

          <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
                Recent Audit Activity
              </h2>

              <span className="material-symbols-outlined text-[#4a7c59]">
                history
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-[#4a4e4a]">
                No audit records available.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
                {auditLogs
                  .slice(-8)
                  .reverse()
                  .map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#2e3230]">
                          {log.action ||
                            'AUDIT EVENT'}
                        </span>

                        <span className="text-[10px] text-[#4a4e4a]">
                          #{log.id}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#4a4e4a] mt-1">
                        User:{' '}
                        {log.user || 'SYSTEM'}
                      </p>

                      {log.reason && (
                        <p className="text-[11px] text-[#4a4e4a] mt-1">
                          {log.reason}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default CatalogScreen;