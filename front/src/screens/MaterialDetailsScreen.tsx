import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Hash,
  History,
  Package,
  Search,
  ShieldCheck,
  Tag,
  UserCheck,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { portalApi } from '../services/apiClient';

import {
  staggerContainerVariants,
  staggerCardVariants,
} from '../utils/animationVariants';

interface MaterialDetails {
  id: number;
  national_code: string;
  standard_description: string;
  category: string | null;
  status: string;
  subcategory: string | null;
  unspsc: string | null;
  standardizedSpecs: string | null;
  participatingCpses: string[];
  lineage: {
    cpse: string;
    legacyCode: string;
    legacyErpDescriptor: string;
    unit: string;
  }[];
}

interface NationalMaterial {
  id: number;
  national_code: string;
  standard_description: string;
  category: string | null;
  status: string;
}

interface CpseMaterial {
  cpse_id: number;
  cpse_name?: string | null;
  cpse_code?: string | null;
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

interface OriginalMaterial {
  id: number;
  cpse_id: number;
  material_code: string;
  original_description: string;
  original_specifications?: string | null;
  original_unit?: string | null;
  category?: string | null;
  technical_parameters?: string | null;
}

interface MaterialVersion {
  id?: number;
  version_number?: number;
  standard_description?: string | null;
  category?: string | null;
  status?: string | null;
  changed_by?: string | null;
  change_reason?: string | null;
  created_at?: string | null;
}

const MaterialDetailsScreen: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    selectedCatalogCnmc,
    setSelectedCatalogCnmc,
    showToast,
  } = useApp();

  void activeScreen;

  const [material, setMaterial] =
    useState<MaterialDetails | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [versions, setVersions] =
    useState<MaterialVersion[]>([]);

  const [cpseMaterials, setCpseMaterials] =
    useState<CpseMaterial[]>([]);

  useEffect(() => {
    const loadMaterial = async () => {
      if (!selectedCatalogCnmc) {
        setMaterial(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const nationalMaterials =
          await portalApi.getNationalMaterials();

        const selectedNationalMaterial =
          nationalMaterials.find(
            (item: NationalMaterial) =>
              item.national_code ===
              selectedCatalogCnmc
          ) as NationalMaterial | undefined;

        if (!selectedNationalMaterial) {
          setMaterial(null);

          showToast(
            'Material details are not available in the national material master.',
            'warning'
          );

          return;
        }

        const [
          cpseResponse,
          versionResponse,
          mappings,
          materials,
        ] = await Promise.all([
          portalApi.getNationalMaterialCPSEMaterials(
            selectedNationalMaterial.id
          ),

          portalApi.getMaterialVersions(
            selectedNationalMaterial.id
          ),

          portalApi.getMappings(),

          portalApi.getMaterials(),
        ]);

        const cpseRecords: CpseMaterial[] =
          cpseResponse?.cpse_materials || [];

        setCpseMaterials(cpseRecords);

        const loadedVersions: MaterialVersion[] =
          versionResponse || [];

        setVersions(loadedVersions);

        const relatedMappings = mappings.filter(
          (mapping: {
            national_material_id: number;
          }) =>
            mapping.national_material_id ===
            selectedNationalMaterial.id
        );

        const relatedOriginalMaterials =
          materials.filter(
            (original: OriginalMaterial) =>
              relatedMappings.some(
                (mapping: {
                  original_material_id: number;
                }) =>
                  mapping.original_material_id ===
                  original.id
              )
          ) as OriginalMaterial[];

        const participatingCpses = [
          ...new Set(
            cpseRecords
              .map(
                (item) =>
                  item.cpse_name ||
                  item.cpse_code ||
                  ''
              )
              .filter(Boolean)
          ),
        ];

        const lineage =
          cpseRecords.map((item) => ({
            cpse:
              item.cpse_name ||
              item.cpse_code ||
              'Unknown CPSE',

            legacyCode:
              item.material_code,

            legacyErpDescriptor:
              item.original_description,

            unit:
              item.original_unit || '—',
          }));

        const standardizedSpecs =
          relatedOriginalMaterials
            .map(
              (item) =>
                item.original_specifications ||
                item.technical_parameters ||
                ''
            )
            .filter(Boolean)
            .join(' | ');

        const latestVersion =
          loadedVersions.length > 0
            ? loadedVersions[
                loadedVersions.length - 1
              ]
            : null;

        const selectedMaterial: MaterialDetails = {
          id:
            selectedNationalMaterial.id,

          national_code:
            selectedNationalMaterial.national_code,

          standard_description:
            selectedNationalMaterial.standard_description,

          category:
            selectedNationalMaterial.category,

          status:
            selectedNationalMaterial.status,

          subcategory:
            null,

          unspsc:
            null,

          standardizedSpecs:
            standardizedSpecs ||
            latestVersion?.standard_description ||
            null,

          participatingCpses,

          lineage,
        };

        setMaterial(selectedMaterial);
      } catch (error) {
        console.error(
          'Unable to load material details:',
          error
        );

        setMaterial(null);

        showToast(
          'Unable to load material details from backend.',
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterial();
  }, [selectedCatalogCnmc, showToast]);

  const goBack = () => {
    setActiveScreen('global-search');
  };

  const openCatalog = () => {
    setActiveScreen('catalog');
  };

  const clearSelection = () => {
    setSelectedCatalogCnmc(null);
    setActiveScreen('global-search');
  };

  if (isLoading) {
    return (
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="w-full pb-16 space-y-6"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-xl
              bg-white border border-[#e4e0d8]
              text-[#4a4e4a] text-sm
              font-sans font-bold
              hover:bg-[#f0ece4]
              transition-colors
            "
          >
            <ArrowLeft size={16} />
            Back to Search
          </button>
        </div>

        <div
          className="
            rounded-2xl border border-[#e4e0d8]
            bg-white shadow-sm
            py-20 flex flex-col
            items-center justify-center
            text-center
          "
        >
          <div
            className="
              w-11 h-11 rounded-full
              border-4 border-[#e4e0d8]
              border-t-[#4a7c59]
              animate-spin
            "
          />

          <div
            className="
              mt-5 text-sm font-sans
              font-semibold text-[#4a4e4a]
            "
          >
            Loading material details...
          </div>
        </div>
      </motion.div>
    );
  }

  if (!material) {
    return (
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="w-full pb-16 space-y-6"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-xl
              bg-white border border-[#e4e0d8]
              text-[#4a4e4a] text-sm
              font-sans font-bold
              hover:bg-[#f0ece4]
              transition-colors
            "
          >
            <ArrowLeft size={16} />
            Back to Search
          </button>
        </div>

        <div
          className="
            rounded-2xl border border-[#e4e0d8]
            bg-white shadow-sm
            py-20 px-6
            flex flex-col items-center
            justify-center text-center
          "
        >
          <div
            className="
              w-16 h-16 rounded-2xl
              bg-[#f5f1ea]
              flex items-center justify-center
              text-[#705c30]
            "
          >
            <Package size={30} />
          </div>

          <h2
            className="
              mt-5 font-serif text-xl
              font-bold text-[#2e3230]
            "
          >
            Material details unavailable
          </h2>

          <p
            className="
              mt-2 max-w-md text-sm
              leading-6 text-[#6b706d]
              font-sans
            "
          >
            Select a material from the national
            material master to view its complete
            details.
          </p>

          <button
            type="button"
            onClick={goBack}
            className="
              mt-6 inline-flex items-center gap-2
              px-4 py-2.5 rounded-xl
              bg-[#4a7c59] text-white
              text-sm font-sans font-bold
              hover:bg-[#416c4e]
              transition-colors
            "
          >
            <Search size={16} />
            Search Materials
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="
        flex flex-col w-full pb-16 space-y-6
      "
    >
      {/* TOP NAVIGATION */}

      <motion.div
        variants={staggerCardVariants}
        className="
          flex flex-col sm:flex-row
          sm:items-center sm:justify-between
          gap-3
        "
      >
        <button
          type="button"
          onClick={goBack}
          className="
            inline-flex items-center gap-2
            px-3.5 py-2.5 rounded-xl
            bg-white border border-[#e4e0d8]
            text-[#4a4e4a] text-sm
            font-sans font-bold
            hover:bg-[#f0ece4]
            transition-colors
          "
        >
          <ArrowLeft size={17} />
          Back to Search
        </button>

        <button
          type="button"
          onClick={openCatalog}
          className="
            inline-flex items-center justify-center
            gap-2 px-4 py-2.5 rounded-xl
            bg-white border border-[#e4e0d8]
            text-[#2e3230] text-sm
            font-sans font-bold shadow-sm
            hover:bg-[#f0ece4]
            transition-colors
          "
        >
          <Database size={16} />
          Open Master Catalog
          <ArrowRight size={15} />
        </button>
      </motion.div>

      {/* MATERIAL HEADER */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl border border-[#e4e0d8]
          bg-white shadow-sm overflow-hidden
        "
      >
        <div className="p-5 md:p-7">
          <div
            className="
              flex flex-col lg:flex-row
              lg:items-start lg:justify-between
              gap-6
            "
          >
            <div className="min-w-0 flex-1">
              <div
                className="
                  inline-flex items-center gap-1.5
                  px-2.5 py-1 rounded-full
                  bg-[#c8e8d0]/60
                  text-[#2a6038]
                  text-[11px] font-sans
                  font-bold uppercase
                  tracking-wider
                "
              >
                <CheckCircle2 size={13} />
                National Material Record
              </div>

              <div
                className="
                  mt-4 flex flex-wrap
                  items-center gap-3
                "
              >
                <Hash
                  size={20}
                  className="text-[#4a7c59]"
                />

                <span
                  className="
                    font-mono text-xl md:text-2xl
                    font-bold text-[#4a7c59]
                  "
                >
                  {material.national_code}
                </span>
              </div>

              <h1
                className="
                  mt-3 font-serif
                  text-2xl md:text-3xl
                  font-bold tracking-tight
                  text-[#2e3230]
                "
              >
                {material.standard_description}
              </h1>

              <p
                className="
                  mt-2 max-w-4xl
                  text-sm md:text-base
                  leading-6 text-[#6b706d]
                  font-sans
                "
              >
                Standardized national material
                record generated from CPSE material
                mappings.
              </p>
            </div>

            <div
              className="
                shrink-0 flex flex-col gap-2
                min-w-[150px]
              "
            >
              <div
                className="
                  rounded-xl bg-[#f5f1ea]
                  border border-[#e4e0d8]
                  px-4 py-3
                "
              >
                <div
                  className="
                    text-[10px] uppercase
                    tracking-wider font-sans
                    font-bold text-[#6b706d]
                  "
                >
                  Status
                </div>

                <div
                  className="
                    mt-1 flex items-center gap-1.5
                    text-sm font-sans font-bold
                    text-[#2a6038]
                  "
                >
                  <CheckCircle2 size={15} />
                  {material.status}
                </div>
              </div>

              <button
                type="button"
                onClick={clearSelection}
                className="
                  inline-flex items-center
                  justify-center gap-2
                  px-4 py-2.5 rounded-xl
                  bg-[#a5555a] text-white
                  text-xs font-sans font-bold
                  hover:bg-[#914a4f]
                  transition-colors
                "
              >
                <Search size={14} />
                New Search
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CORE ATTRIBUTES */}

      <motion.div
        variants={staggerCardVariants}
        className="
          grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-4 gap-4
        "
      >
        <div
          className="
            rounded-2xl bg-white
            border border-[#e4e0d8]
            p-4 shadow-sm
          "
        >
          <div
            className="
              flex items-center justify-between
            "
          >
            <span
              className="
                text-[10px] uppercase
                tracking-wider font-sans
                font-bold text-[#6b706d]
              "
            >
              Category
            </span>

            <Tag
              size={18}
              className="text-[#705c30]"
            />
          </div>

          <div
            className="
              mt-2 text-sm font-sans
              font-bold text-[#2e3230]
            "
          >
            {material.category || '—'}
          </div>
        </div>

        <div
          className="
            rounded-2xl bg-white
            border border-[#e4e0d8]
            p-4 shadow-sm
          "
        >
          <div
            className="
              flex items-center justify-between
            "
          >
            <span
              className="
                text-[10px] uppercase
                tracking-wider font-sans
                font-bold text-[#6b706d]
              "
            >
              Subcategory
            </span>

            <GitBranch
              size={18}
              className="text-[#a5555a]"
            />
          </div>

          <div
            className="
              mt-2 text-sm font-sans
              font-bold text-[#2e3230]
            "
          >
            {material.subcategory || '—'}
          </div>
        </div>

        <div
          className="
            rounded-2xl bg-white
            border border-[#e4e0d8]
            p-4 shadow-sm
          "
        >
          <div
            className="
              flex items-center justify-between
            "
          >
            <span
              className="
                text-[10px] uppercase
                tracking-wider font-sans
                font-bold text-[#6b706d]
              "
            >
              UNSPSC
            </span>

            <Database
              size={18}
              className="text-[#4a7c59]"
            />
          </div>

          <div
            className="
              mt-2 font-mono text-sm
              font-bold text-[#2e3230]
            "
          >
            {material.unspsc || '—'}
          </div>
        </div>

        <div
          className="
            rounded-2xl bg-white
            border border-[#e4e0d8]
            p-4 shadow-sm
          "
        >
          <div
            className="
              flex items-center justify-between
            "
          >
            <span
              className="
                text-[10px] uppercase
                tracking-wider font-sans
                font-bold text-[#6b706d]
              "
            >
              CPSE Coverage
            </span>

            <Building2
              size={18}
              className="text-[#705c30]"
            />
          </div>

          <div
            className="
              mt-2 text-2xl font-serif
              font-bold text-[#2e3230]
            "
          >
            {material.participatingCpses.length}
          </div>
        </div>
      </motion.div>

      {/* STANDARDIZED SPECIFICATIONS */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl bg-white
          border border-[#e4e0d8]
          shadow-sm overflow-hidden
        "
      >
        <div
          className="
            px-5 py-4 border-b
            border-[#eae6de]
            flex items-center gap-2
          "
        >
          <FileText
            size={18}
            className="text-[#a5555a]"
          />

          <h2
            className="
              font-serif text-lg font-bold
              text-[#2e3230]
            "
          >
            Standardized Specifications
          </h2>
        </div>

        <div className="p-5">
          <div
            className="
              rounded-xl bg-[#f5f1ea]
              border border-[#e4e0d8]
              p-4 text-sm leading-6
              font-sans font-semibold
              text-[#2e3230]
            "
          >
            {material.standardizedSpecs || '—'}
          </div>
        </div>
      </motion.div>

      {/* CPSE MAPPINGS */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl bg-white
          border border-[#e4e0d8]
          shadow-sm overflow-hidden
        "
      >
        <div
          className="
            px-5 py-4 border-b
            border-[#eae6de]
            flex flex-col sm:flex-row
            sm:items-center
            sm:justify-between gap-2
          "
        >
          <div className="flex items-center gap-2">
            <Building2
              size={18}
              className="text-[#705c30]"
            />

            <h2
              className="
                font-serif text-lg font-bold
                text-[#2e3230]
              "
            >
              CPSE Mappings
            </h2>
          </div>

          <span
            className="
              text-xs font-sans
              font-semibold text-[#6b706d]
            "
          >
            Original CPSE identifiers remain unchanged
          </span>
        </div>

        <div className="divide-y divide-[#eae6de]">
          {material.lineage.length === 0 ? (
            <div
              className="
                px-5 py-10 text-center
                text-sm font-sans
                text-[#6b706d]
              "
            >
              No CPSE lineage records available.
            </div>
          ) : (
            material.lineage.map((line, index) => (
              <div
                key={`${line.legacyCode}-${index}`}
                className="
                  p-5 flex flex-col
                  lg:flex-row lg:items-center
                  lg:justify-between gap-4
                "
              >
                <div className="min-w-0">
                  <div
                    className="
                      flex flex-wrap
                      items-center gap-2
                    "
                  >
                    <span
                      className="
                        px-2 py-1 rounded-lg
                        bg-[#f5f1ea]
                        border border-[#e4e0d8]
                        text-[10px] font-sans
                        font-bold text-[#4a4e4a]
                      "
                    >
                      {line.cpse}
                    </span>

                    <span
                      className="
                        text-[10px] uppercase
                        tracking-wider font-sans
                        font-bold text-[#6b706d]
                      "
                    >
                      Legacy Code
                    </span>
                  </div>

                  <div
                    className="
                      mt-2 font-mono text-sm
                      font-bold text-[#2e3230]
                    "
                  >
                    {line.legacyCode}
                  </div>

                  <div
                    className="
                      mt-1 text-xs leading-5
                      font-sans text-[#6b706d]
                    "
                  >
                    {line.legacyErpDescriptor || '—'}
                  </div>

                  <div
                    className="
                      mt-1 text-xs
                      font-sans text-[#6b706d]
                    "
                  >
                    Unit: {line.unit}
                  </div>
                </div>

                <div
                  className="
                    shrink-0 flex items-center
                    gap-2 text-xs font-sans
                    font-bold text-[#4a7c59]
                  "
                >
                  <ArrowRight size={16} />
                  {material.national_code}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* AI ANALYSIS */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl bg-white
          border border-[#e4e0d8]
          shadow-sm overflow-hidden
        "
      >
        <div
          className="
            px-5 py-4 border-b
            border-[#eae6de]
            flex items-center gap-2
          "
        >
          <ShieldCheck
            size={18}
            className="text-[#a5555a]"
          />

          <h2
            className="
              font-serif text-lg font-bold
              text-[#2e3230]
            "
          >
            AI Analysis & Standardization
          </h2>
        </div>

        <div
          className="
            p-5 grid grid-cols-1
            lg:grid-cols-2 gap-4
          "
        >
          <div
            className="
              rounded-xl border
              border-[#e4e0d8]
              bg-[#faf8f4] p-4
            "
          >
            <div
              className="
                text-[10px] uppercase
                tracking-wider font-sans
                font-bold text-[#6b706d]
              "
            >
              Standardized Description
            </div>

            <div
              className="
                mt-2 text-sm leading-6
                font-sans font-semibold
                text-[#2e3230]
              "
            >
              {material.standard_description}
            </div>
          </div>

          <div
            className="
              rounded-xl border
              border-[#e4e0d8]
              bg-[#faf8f4] p-4
            "
          >
            <div
              className="
                text-[10px] uppercase
                tracking-wider font-sans
                font-bold text-[#6b706d]
              "
            >
              Standardized Specifications
            </div>

            <div
              className="
                mt-2 text-sm leading-6
                font-sans font-semibold
                text-[#2e3230]
              "
            >
              {material.standardizedSpecs || '—'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* MAPPING STATUS */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl bg-white
          border border-[#e4e0d8]
          shadow-sm overflow-hidden
        "
      >
        <div
          className="
            px-5 py-4 border-b
            border-[#eae6de]
            flex items-center gap-2
          "
        >
          <ShieldCheck
            size={18}
            className="text-[#4a7c59]"
          />

          <h2
            className="
              font-serif text-lg font-bold
              text-[#2e3230]
            "
          >
            Mapping Validation
          </h2>
        </div>

        <div className="p-5">
          {cpseMaterials.length === 0 ? (
            <div
              className="
                rounded-xl bg-[#f5f1ea]
                border border-[#e4e0d8]
                p-4 text-sm
                text-[#6b706d]
              "
            >
              No mapping records are currently
              associated with this national material.
            </div>
          ) : (
            <div className="space-y-3">
              {cpseMaterials.map((mapping) => (
                <div
                  key={mapping.mapping_id}
                  className="
                    rounded-xl
                    border border-[#e4e0d8]
                    bg-[#faf8f4]
                    p-4
                    flex flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-3
                  "
                >
                  <div>
                    <div
                      className="
                        font-mono text-sm
                        font-bold text-[#2e3230]
                      "
                    >
                      {mapping.material_code}
                    </div>

                    <div
                      className="
                        mt-1 text-xs
                        text-[#6b706d]
                      "
                    >
                      {mapping.match_type}
                      {' · '}
                      Confidence:
                      {' '}
                      {mapping.confidence}
                    </div>
                  </div>

                  <div
                    className="
                      inline-flex items-center
                      gap-2
                    "
                  >
                    <span
                      className="
                        px-2.5 py-1
                        rounded-full
                        bg-[#c8e8d0]/60
                        text-[#2a6038]
                        text-[10px]
                        font-bold
                      "
                    >
                      {mapping.mapping_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* VERSION HISTORY */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl bg-white
          border border-[#e4e0d8]
          shadow-sm
        "
      >
        <div
          className="
            px-5 py-4 border-b
            border-[#eae6de]
            flex items-center gap-2
          "
        >
          <History
            size={18}
            className="text-[#a5555a]"
          />

          <h2
            className="
              font-serif text-lg font-bold
              text-[#2e3230]
            "
          >
            Version History
          </h2>
        </div>

        <div className="p-5">
          {versions.length === 0 ? (
            <div
              className="
                rounded-xl bg-[#f5f1ea]
                border border-[#e4e0d8]
                p-4 text-sm
                text-[#6b706d]
              "
            >
              No version history is available
              for this material yet.
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map(
                (version, index) => (
                  <div
                    key={
                      version.id ??
                      `${version.version_number}-${index}`
                    }
                    className="
                      rounded-xl
                      border border-[#e4e0d8]
                      p-4
                    "
                  >
                    <div
                      className="
                        flex flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-2
                      "
                    >
                      <div
                        className="
                          flex items-center
                          gap-2
                        "
                      >
                        <Clock3
                          size={16}
                          className="text-[#705c30]"
                        />

                        <span
                          className="
                            text-sm font-bold
                            text-[#2e3230]
                          "
                        >
                          Version{' '}
                          {version.version_number ??
                            index + 1}
                        </span>
                      </div>

                      <span
                        className="
                          text-xs
                          text-[#6b706d]
                        "
                      >
                        {version.status || '—'}
                      </span>
                    </div>

                    <div
                      className="
                        mt-2 text-sm
                        text-[#4a4e4a]
                      "
                    >
                      {version.standard_description ||
                        'No description recorded.'}
                    </div>

                    {version.changed_by && (
                      <div
                        className="
                          mt-2 text-xs
                          text-[#6b706d]
                        "
                      >
                        Changed by:{' '}
                        {version.changed_by}
                      </div>
                    )}

                    {version.change_reason && (
                      <div
                        className="
                          mt-1 text-xs
                          text-[#6b706d]
                        "
                      >
                        Reason:{' '}
                        {version.change_reason}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* FOOTER ACTIONS */}

      <motion.div
        variants={staggerCardVariants}
        className="
          flex flex-col sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3 pt-2
        "
      >
        <button
          type="button"
          onClick={goBack}
          className="
            inline-flex items-center
            justify-center gap-2
            px-4 py-2.5 rounded-xl
            bg-white border border-[#e4e0d8]
            text-[#4a4e4a] text-sm
            font-sans font-bold
            hover:bg-[#f0ece4]
            transition-colors
          "
        >
          <ArrowLeft size={16} />
          Back to Search
        </button>

        <button
          type="button"
          onClick={openCatalog}
          className="
            inline-flex items-center
            justify-center gap-2
            px-4 py-2.5 rounded-xl
            bg-[#4a7c59] text-white
            text-sm font-sans font-bold
            hover:bg-[#416c4e]
            transition-colors
          "
        >
          Open Master Catalog
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
};

export { MaterialDetailsScreen };
export default MaterialDetailsScreen;