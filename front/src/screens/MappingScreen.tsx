import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { portalApi } from '../services/apiClient';

interface MappingRecord {
  cpse: string;
  legacyCode: string;
  originalDescription: string;
  nationalCode: string;
  standardizedDescription: string;
  status: 'APPROVED' | 'PENDING' | 'MODIFIED';
  confidence: number;
}

export const MappingScreen: React.FC = () => {
  const {
  setActiveScreen,
  setSelectedCatalogCnmc,
  showToast,
} = useApp();

  /*
   * Mock mapping records have been removed.
   *
   * Real mapping records will be supplied by the backend
   * when the mapping API is connected.
   */
  const [mappings, setMappings] = useState<MappingRecord[]>([]);
const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  useEffect(() => {
  const loadMappings = async () => {
    setLoading(true);

    try {
      const [
        backendMappings,
        materials,
        cpses,
        nationalMaterials,
      ] = await Promise.all([
        portalApi.getMappings(),
        portalApi.getMaterials(),
        portalApi.getCPSEs(),
        portalApi.getNationalMaterials(),
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

      const nationalMaterialMap = new Map(
        nationalMaterials.map((material: any) => [
          material.id,
          material,
        ])
      );

      const mappedRecords: MappingRecord[] =
        backendMappings.map((mapping: any) => {
          const originalMaterial =
            materialMap.get(
              mapping.original_material_id
            );

          const nationalMaterial =
            nationalMaterialMap.get(
              mapping.national_material_id
            );

          return {
            cpse:
              cpseMap.get(
                originalMaterial?.cpse_id
              ) ||
              `CPSE-${originalMaterial?.cpse_id || 'UNKNOWN'}`,

            legacyCode:
              originalMaterial?.material_code ||
              `MATERIAL-${mapping.original_material_id}`,

            originalDescription:
              originalMaterial?.original_description ||
              'Description unavailable',

            nationalCode:
              nationalMaterial?.national_code ||
              'UNASSIGNED',

            standardizedDescription:
              nationalMaterial?.standard_description ||
              'Unavailable',

            status:
              mapping.status === 'APPROVED'
                ? 'APPROVED'
                : mapping.status === 'MODIFIED'
                ? 'MODIFIED'
                : 'PENDING',

            confidence:
              parseFloat(
                String(mapping.confidence)
              ) * 100,
          };
        });

      setMappings(mappedRecords);

    } catch (error) {
      console.error(
        'Failed to load CPSE-national mappings:',
        error
      );

      showToast(
        'Unable to load CPSE-national mappings from backend.',
        'error'
      );

      setMappings([]);

    } finally {
      setLoading(false);
    }
  };

  loadMappings();
}, []);

  const filteredMappings = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return mappings;

    return mappings.filter(mapping =>
      [
        mapping.cpse,
        mapping.legacyCode,
        mapping.originalDescription,
        mapping.nationalCode,
        mapping.standardizedDescription,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [mappings, search]);

  const approveMapping = async (legacyCode: string) => {
  const mapping = mappings.find(
    item => item.legacyCode === legacyCode
  );

  if (!mapping) {
    showToast(
      'Mapping record not found.',
      'error'
    );
    return;
  }

  try {
    const backendMappings =
      await portalApi.getMappings();

    const materialRecords =
      await portalApi.getMaterials();

    const material = materialRecords.find(
      (item: any) =>
        item.material_code === legacyCode
    );

    if (!material) {
      showToast(
        'Original CPSE material not found.',
        'error'
      );
      return;
    }

    const backendMapping =
      backendMappings.find(
        (item: any) =>
          item.original_material_id === material.id
      );

    if (!backendMapping) {
      showToast(
        'Backend mapping not found.',
        'error'
      );
      return;
    }

    await portalApi.approveMapping(
      backendMapping.id
    );

    setMappings(previous =>
      previous.map(item =>
        item.legacyCode === legacyCode
          ? {
              ...item,
              status: 'APPROVED',
            }
          : item
      )
    );

    showToast(
      `Mapping ${legacyCode} approved.`,
      'success'
    );

  } catch (error) {
    console.error(
      'Failed to approve mapping:',
      error
    );

    showToast(
      'Unable to approve mapping.',
      'error'
    );
  }
};

  const exportMapping = () => {
    const payload = JSON.stringify(mappings, null, 2);
    const blob = new Blob([payload], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'cpse-national-material-mapping.json';
    anchor.click();

    URL.revokeObjectURL(url);

    showToast('CPSE ↔ National mapping exported.', 'success');
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
            onClick={() => setActiveScreen('ai-recommendation')}
            className="text-xs font-bold text-[#4a7c59] mb-2 hover:underline"
          >
            ← Back to AI Recommendation
          </button>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a5555a]">
              account_tree
            </span>

            <h1 className="text-2xl font-serif font-bold text-[#2e3230]">
              CPSE ↔ National Material Mapping
            </h1>
          </div>

          <p className="text-sm text-[#4a4e4a] mt-1">
            Bidirectional traceability between original CPSE codes and the
            proposed national material code.
          </p>
        </div>

        <button
          type="button"
          onClick={exportMapping}
          className="px-4 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
        >
          Export Mapping
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5">
          <p className="text-[10px] uppercase font-bold text-[#4a4e4a]">
            National Material Code
          </p>

          <p className="mt-2 font-mono font-bold text-[#705c30]">
            —
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5">
          <p className="text-[10px] uppercase font-bold text-[#4a4e4a]">
            CPSE Sources
          </p>

          <p className="mt-2 text-2xl font-serif font-bold">
            {new Set(mappings.map(mapping => mapping.cpse)).size}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5">
          <p className="text-[10px] uppercase font-bold text-[#4a4e4a]">
            Legacy Records
          </p>

          <p className="mt-2 text-2xl font-serif font-bold">
            {mappings.length}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#eae6de] bg-[#f0ece4]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-bold">Bidirectional Traceability</h2>

              <p className="text-[11px] text-[#4a4e4a] mt-1">
                National Code → CPSE Codes and CPSE Code → National Code.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#4a4e4a]">
                search
              </span>

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search CPSE code or national code..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-[#e4e0d8] text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f1ea]">
              <tr>
                <th className="px-5 py-3 font-bold">CPSE</th>
                <th className="px-5 py-3 font-bold">Legacy Code</th>
                <th className="px-5 py-3 font-bold">
                  Original Description
                </th>
                <th className="px-5 py-3 font-bold">
                  Proposed National Code
                </th>
                <th className="px-5 py-3 font-bold">Confidence</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
  <tr>
    <td
      colSpan={7}
      className="px-5 py-12 text-center"
    >
      Loading real mapping data...
    </td>
  </tr>
) : filteredMappings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl text-[#a5555a]">
                        account_tree
                      </span>

                      <p className="mt-3 text-sm font-bold text-[#2e3230]">
                        No mapping records available
                      </p>

                      <p className="mt-1 text-[11px] text-[#4a4e4a]">
                        Mapping records will appear here when they are
                        provided by the backend.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMappings.map(mapping => (
                  <tr
                    key={mapping.legacyCode}
                    className="border-b border-[#eae6de] hover:bg-[#f5f1ea]/70"
                  >
                    <td className="px-5 py-4 font-bold">
                      {mapping.cpse}
                    </td>

                    <td className="px-5 py-4 font-mono text-[#4a7c59]">
                      {mapping.legacyCode}
                    </td>

                    <td className="px-5 py-4 min-w-[220px]">
                      {mapping.originalDescription}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#705c30]">
                        {mapping.nationalCode}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {mapping.confidence.toFixed(1)}%
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[9px] font-bold ${
                          mapping.status === 'APPROVED'
                            ? 'bg-[#c8e8d0] text-[#2a6038]'
                            : mapping.status === 'MODIFIED'
                            ? 'bg-[#e5ddf2] text-[#654b7b]'
                            : 'bg-[#f4e6c7] text-[#705c30]'
                        }`}
                      >
                        {mapping.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {mapping.status !== 'APPROVED' ? (
                        <button
                          type="button"
                          onClick={() =>
                            approveMapping(mapping.legacyCode)
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#4a7c59] text-white text-[10px] font-bold"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
  type="button"
  onClick={() => {
    setSelectedCatalogCnmc(mapping.nationalCode);
    setActiveScreen('material-details');
  }}
  className="text-[10px] font-semibold text-[#4a7c59] hover:underline"
>
  Traceable
</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5">
          <h2 className="font-bold">National → CPSE</h2>

          <div className="mt-4 p-4 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
            <p className="font-mono font-bold text-[#705c30]">
              —
            </p>

            <div className="mt-3 space-y-2">
              {mappings.length === 0 ? (
                <p className="text-[11px] text-[#4a4e4a]">
                  No CPSE mappings available.
                </p>
              ) : (
                mappings.map(mapping => (
                  <div
                    key={mapping.legacyCode}
                    className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-lg border border-[#eae6de]"
                  >
                    <span className="font-bold">{mapping.cpse}</span>

                    <span className="font-mono text-[#4a7c59]">
                      {mapping.legacyCode}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e0d8] p-5">
          <h2 className="font-bold">CPSE → National</h2>

          <div className="mt-4 p-4 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
            <p className="font-mono font-bold text-[#4a7c59]">
              —
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#a5555a]">
                arrow_forward
              </span>

              <span className="font-mono font-bold text-[#705c30]">
                —
              </span>
            </div>

            <p className="mt-3 text-[11px] text-[#4a4e4a]">
              Original CPSE record remains unchanged while the standardized
              mapping evolves.
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setActiveScreen('migration')}
          className="px-5 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
        >
          Continue to Migration →
        </button>
      </div>
    </motion.div>
  );
};