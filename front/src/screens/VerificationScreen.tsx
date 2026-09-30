import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  motion,
} from 'framer-motion';

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  ShieldCheck,
  Database,
  Link2,
  ClipboardCheck,
} from 'lucide-react';

import {
  useApp,
} from '../context/AppContext';

import {
  portalApi,
} from '../services/apiClient';

import {
  staggerContainerVariants,
  staggerCardVariants,
} from '../utils/animationVariants';


interface MappingRecord {
  id: number;
  original_material_id: number;
  national_material_id: number;
  match_type: string;
  confidence: string;
  explanation?: string | null;
  status: string;
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
  raw_record?: string | null;
}


interface NationalMaterial {
  id: number;
  national_code: string;
  standard_description: string;
  category?: string | null;
  status?: string | null;
}


interface VerificationRecord {
  mapping: MappingRecord;
  original: OriginalMaterial | null;
  national: NationalMaterial | null;
}


type QueueTab =
  | 'pending'
  | 'rejected'
  | 'approved';


const VerificationScreen: React.FC = () => {

  const {
    showToast,
  } = useApp();


  /* =======================================================
     STATE
     ======================================================= */

  const [
    records,
    setRecords,
  ] = useState<VerificationRecord[]>([]);


  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);


  const [
    queueTab,
    setQueueTab,
  ] = useState<QueueTab>('pending');


  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    isActionLoading,
    setIsActionLoading,
  ] = useState(false);


  const [
    adjustmentNotes,
    setAdjustmentNotes,
  ] = useState('');


  const [
    showAdjustment,
    setShowAdjustment,
  ] = useState(false);


  /* =======================================================
     LOAD REAL VERIFICATION DATA
     ======================================================= */

  const loadData = async () => {

    try {

      setIsLoading(true);

      const [
        mappings,
        materials,
        nationalMaterials,
      ] = await Promise.all([
        portalApi.getMappings(),
        portalApi.getMaterials(),
        portalApi.getNationalMaterials(),
      ]);


      const materialMap =
        new Map<number, OriginalMaterial>();


      materials.forEach(
        (material: OriginalMaterial) => {

          materialMap.set(
            Number(material.id),
            material
          );

        }
      );


      const nationalMap =
        new Map<number, NationalMaterial>();


      nationalMaterials.forEach(
        (material: NationalMaterial) => {

          nationalMap.set(
            Number(material.id),
            material
          );

        }
      );


      const verificationRecords =
        (mappings as MappingRecord[])
          .map(mapping => ({
            mapping,
            original:
              materialMap.get(
                Number(
                  mapping.original_material_id
                )
              ) ?? null,
            national:
              nationalMap.get(
                Number(
                  mapping.national_material_id
                )
              ) ?? null,
          }))
          .filter(
            record =>
              Boolean(record.original) ||
              Boolean(record.national)
          );


      setRecords(
        verificationRecords
      );

    } catch (error) {

      console.error(
        'Unable to load verification data:',
        error
      );

      setRecords([]);

      showToast(
        'Unable to load verification queue.',
        'error'
      );

    } finally {

      setIsLoading(false);

    }

  };


  useEffect(() => {

    loadData();

  }, []);


  /* =======================================================
     FILTER QUEUE
     ======================================================= */

  const filteredRecords =
    useMemo(() => {

      const query =
        searchTerm
          .trim()
          .toLowerCase();


      let result =
        records.filter(record => {

          const status =
            (
              record.mapping.status ||
              ''
            ).toUpperCase();


          if (
            queueTab === 'pending'
          ) {

            return (
              status === 'PENDING'
            );

          }


          if (
            queueTab === 'approved'
          ) {

            return (
              status === 'APPROVED'
            );

          }


          return (
            status === 'REJECTED'
          );

        });


      if (!query) {

        return result;

      }


      result =
        result.filter(record => {

          const mapping =
            record.mapping;

          const original =
            record.original;

          const national =
            record.national;


          const searchable = [
            String(mapping.id),
            mapping.match_type,
            mapping.confidence,
            mapping.explanation ?? '',
            original?.material_code ?? '',
            original?.original_description ?? '',
            original?.category ?? '',
            national?.national_code ?? '',
            national?.standard_description ?? '',
            national?.category ?? '',
          ]
            .join(' ')
            .toLowerCase();


          return searchable.includes(
            query
          );

        });


      return result;

    }, [
      records,
      queueTab,
      searchTerm,
    ]);


  /* =======================================================
     CURRENT RECORD
     ======================================================= */

  const currentRecord =
    filteredRecords.length > 0
      ? filteredRecords[
          Math.min(
            selectedIndex,
            filteredRecords.length - 1
          )
        ]
      : null;


  /* =======================================================
     COUNTS
     ======================================================= */

  const pendingCount =
    records.filter(
      record =>
        record.mapping.status?.toUpperCase() ===
        'PENDING'
    ).length;


  const approvedCount =
    records.filter(
      record =>
        record.mapping.status?.toUpperCase() ===
        'APPROVED'
    ).length;


  const rejectedCount =
    records.filter(
      record =>
        record.mapping.status?.toUpperCase() ===
        'REJECTED'
    ).length;


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const goNext = () => {

    if (
      filteredRecords.length === 0
    ) {
      return;
    }


    setSelectedIndex(
      currentIndex =>
        currentIndex <
        filteredRecords.length - 1
          ? currentIndex + 1
          : 0
    );

  };


  const goPrevious = () => {

    if (
      filteredRecords.length === 0
    ) {
      return;
    }


    setSelectedIndex(
      currentIndex =>
        currentIndex > 0
          ? currentIndex - 1
          : filteredRecords.length - 1
    );

  };


  /* =======================================================
     CHANGE QUEUE
     ======================================================= */

  const changeQueue = (
    tab: QueueTab
  ) => {

    setQueueTab(tab);

    setSelectedIndex(0);

  };


  /* =======================================================
     APPROVE
     ======================================================= */

  const approveCurrent = async (
    reason?: string
  ) => {

    if (!currentRecord) {
      return;
    }


    try {

      setIsActionLoading(true);


      const result =
        await portalApi.approveMapping(
          currentRecord.mapping.id,
          'VERIFICATION_USER',
          reason ||
            'Material mapping approved after human verification.'
        );


      showToast(
        result?.message ||
          'Material mapping approved successfully.',
        'success'
      );


      setSelectedIndex(0);

      await loadData();

    } catch (error: any) {

      console.error(
        'Approval failed:',
        error
      );

      showToast(
        error?.message ||
          'Unable to approve mapping.',
        'error'
      );

    } finally {

      setIsActionLoading(false);

    }

  };


  /* =======================================================
     REJECT
     ======================================================= */

  const rejectCurrent = async (
    reason?: string
  ) => {

    if (!currentRecord) {
      return;
    }


    try {

      setIsActionLoading(true);


      const result =
        await portalApi.rejectMapping(
          currentRecord.mapping.id,
          'VERIFICATION_USER',
          reason ||
            'Material mapping rejected during human verification.'
        );


      showToast(
        result?.message ||
          'Material mapping rejected.',
        'warning'
      );


      setSelectedIndex(0);

      await loadData();

    } catch (error: any) {

      console.error(
        'Rejection failed:',
        error
      );

      showToast(
        error?.message ||
          'Unable to reject mapping.',
        'error'
      );

    } finally {

      setIsActionLoading(false);

    }

  };


  /* =======================================================
     APPROVE WITH ADJUSTMENT
     ======================================================= */

  const approveWithAdjustment = async () => {

    const reason =
      adjustmentNotes.trim();


    if (!reason) {

      showToast(
        'Please enter the adjustment reason.',
        'warning'
      );

      return;

    }


    setShowAdjustment(false);

    await approveCurrent(
      `Approved with specification adjustment: ${reason}`
    );


    setAdjustmentNotes('');

  };


  /* =======================================================
     REFRESH
     ======================================================= */

  const refreshQueue = async () => {

    setSelectedIndex(0);

    await loadData();

    showToast(
      'Verification queue refreshed.',
      'success'
    );

  };


  /* =======================================================
     HELPERS
     ======================================================= */

  const getStatusLabel = (
    status: string
  ) => {

    const normalized =
      status.toUpperCase();


    if (
      normalized === 'APPROVED'
    ) {
      return 'APPROVED';
    }


    if (
      normalized === 'REJECTED'
    ) {
      return 'REJECTED';
    }


    return 'PENDING';

  };


  const getConfidenceNumber = (
    confidence: string
  ) => {

    const numeric =
      Number(
        String(confidence)
          .replace('%', '')
      );


    if (
      Number.isNaN(numeric)
    ) {

      return null;

    }


    return numeric <= 1
      ? numeric * 100
      : numeric;

  };


  const confidence =
    currentRecord
      ? getConfidenceNumber(
          currentRecord.mapping.confidence
        )
      : null;


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="
        flex
        flex-col
        w-full
        pb-16
        space-y-6
      "
    >

      {/* =====================================================
         HEADER
         ===================================================== */}

      <motion.section
        variants={staggerCardVariants}
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-end
          lg:justify-between
          gap-5
        "
      >

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-1.5
              px-2.5
              py-1
              rounded-full
              text-[11px]
              font-sans
              font-bold
              bg-[#c8e8d0]/60
              text-[#2a6038]
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

            HUMAN VERIFICATION

          </div>


          <h1
            className="
              mt-2
              font-serif
              text-3xl
              md:text-4xl
              font-bold
              tracking-tight
              text-[#2e3230]
            "
          >
            Material Verification
          </h1>


          <p
            className="
              mt-2
              max-w-3xl
              text-sm
              md:text-base
              leading-6
              text-[#4a4e4a]
              font-sans
            "
          >
            Review AI-generated material mappings,
            verify the proposed national material,
            and approve or reject the mapping.
          </p>

        </div>


        <button
          type="button"
          onClick={refreshQueue}
          disabled={isLoading}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            bg-white
            border
            border-[#e4e0d8]
            text-[#2e3230]
            text-sm
            font-sans
            font-bold
            shadow-sm
            hover:bg-[#f0ece4]
            disabled:opacity-50
            transition-colors
          "
        >

          <RefreshCw
            size={16}
            className={
              isLoading
                ? 'animate-spin'
                : ''
            }
          />

          Refresh Queue

        </button>

      </motion.section>


      {/* =====================================================
         KPI BAR
         ===================================================== */}

      <motion.section
        variants={staggerCardVariants}
        className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-4
        "
      >

        <div
          className="
            bg-[#f5f1ea]
            rounded-2xl
            p-5
            shadow-sm
            border
            border-[#e4e0d8]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-xs
                font-sans
                uppercase
                tracking-wider
                text-[#4a4e4a]
                font-bold
              "
            >
              Pending Reviews
            </span>

            <ClipboardCheck
              size={20}
              className="text-[#705c30]"
            />

          </div>


          <div
            className="
              mt-2
              font-serif
              text-3xl
              font-bold
              text-[#2e3230]
            "
          >
            {pendingCount}
          </div>

        </div>


        <div
          className="
            bg-[#f5f1ea]
            rounded-2xl
            p-5
            shadow-sm
            border
            border-[#e4e0d8]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-xs
                font-sans
                uppercase
                tracking-wider
                text-[#4a4e4a]
                font-bold
              "
            >
              Approved
            </span>

            <CheckCircle2
              size={20}
              className="text-[#4a7c59]"
            />

          </div>


          <div
            className="
              mt-2
              font-serif
              text-3xl
              font-bold
              text-[#4a7c59]
            "
          >
            {approvedCount}
          </div>

        </div>


        <div
          className="
            bg-[#f5f1ea]
            rounded-2xl
            p-5
            shadow-sm
            border
            border-[#e4e0d8]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-xs
                font-sans
                uppercase
                tracking-wider
                text-[#4a4e4a]
                font-bold
              "
            >
              Rejected
            </span>

            <XCircle
              size={20}
              className="text-[#b83230]"
            />

          </div>


          <div
            className="
              mt-2
              font-serif
              text-3xl
              font-bold
              text-[#b83230]
            "
          >
            {rejectedCount}
          </div>

        </div>

      </motion.section>


      {/* =====================================================
         QUEUE
         ===================================================== */}

      <motion.section
        variants={staggerCardVariants}
        className="
          bg-[#f5f1ea]
          rounded-2xl
          p-5
          shadow-sm
          border
          border-[#e4e0d8]
        "
      >

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-4
          "
        >

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <button
              type="button"
              onClick={() =>
                changeQueue('pending')
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-xs
                font-sans
                font-bold
                border
                transition-colors
                ${
                  queueTab === 'pending'
                    ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                    : 'bg-white text-[#4a4e4a] border-[#e4e0d8]'
                }
              `}
            >
              Pending ({pendingCount})
            </button>


            <button
              type="button"
              onClick={() =>
                changeQueue('approved')
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-xs
                font-sans
                font-bold
                border
                transition-colors
                ${
                  queueTab === 'approved'
                    ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                    : 'bg-white text-[#4a4e4a] border-[#e4e0d8]'
                }
              `}
            >
              Approved ({approvedCount})
            </button>


            <button
              type="button"
              onClick={() =>
                changeQueue('rejected')
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-xs
                font-sans
                font-bold
                border
                transition-colors
                ${
                  queueTab === 'rejected'
                    ? 'bg-[#b83230] text-white border-[#b83230]'
                    : 'bg-white text-[#4a4e4a] border-[#e4e0d8]'
                }
              `}
            >
              Rejected ({rejectedCount})
            </button>

          </div>


          <div
            className="
              relative
              w-full
              lg:w-80
            "
          >

            <Search
              size={17}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[#6b706d]
              "
            />


            <input
              value={searchTerm}
              onChange={event => {
                setSearchTerm(
                  event.target.value
                );
                setSelectedIndex(0);
              }}
              placeholder="
                Search code, description,
                category or mapping...
              "
              className="
                w-full
                h-10
                pl-10
                pr-3
                rounded-xl
                bg-white
                border
                border-[#e4e0d8]
                text-xs
                font-sans
                text-[#2e3230]
                outline-none
                focus:border-[#4a7c59]
              "
            />

          </div>

        </div>

      </motion.section>


      {/* =====================================================
         VERIFICATION CARD
         ===================================================== */}

      {isLoading ? (

        <motion.section
          variants={staggerCardVariants}
          className="
            bg-[#f5f1ea]
            rounded-2xl
            p-16
            border
            border-[#e4e0d8]
            flex
            flex-col
            items-center
            justify-center
          "
        >

          <div
            className="
              w-10
              h-10
              rounded-full
              border-4
              border-[#e4e0d8]
              border-t-[#4a7c59]
              animate-spin
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-sans
              font-semibold
              text-[#4a4e4a]
            "
          >
            Loading verification queue...
          </p>

        </motion.section>

      ) : !currentRecord ? (

        <motion.section
          variants={staggerCardVariants}
          className="
            bg-[#f5f1ea]
            rounded-2xl
            p-16
            border
            border-[#e4e0d8]
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <div
            className="
              w-16
              h-16
              rounded-2xl
              bg-[#c8e8d0]/60
              flex
              items-center
              justify-center
              text-[#4a7c59]
            "
          >

            <ShieldCheck
              size={32}
            />

          </div>


          <h2
            className="
              mt-4
              font-serif
              text-xl
              font-bold
              text-[#2e3230]
            "
          >
            No records in this queue
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-[#6b706d]
              font-sans
            "
          >
            There are currently no matching
            material mappings to display.
          </p>

        </motion.section>

      ) : (

        <motion.section
          variants={staggerCardVariants}
          className="
            bg-[#f5f1ea]
            rounded-2xl
            p-5
            lg:p-7
            shadow-md
            border
            border-[#e4e0d8]
          "
        >

          {/* Candidate header */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
              pb-5
              border-b
              border-[#eae6de]
            "
          >

            <div>

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >

                <span
                  className="
                    px-2.5
                    py-1
                    rounded-lg
                    bg-white
                    border
                    border-[#e4e0d8]
                    text-[11px]
                    font-mono
                    font-bold
                    text-[#4a7c59]
                  "
                >
                  Mapping #
                  {currentRecord.mapping.id}
                </span>


                <span
                  className="
                    px-2.5
                    py-1
                    rounded-full
                    bg-[#f8e0a8]
                    text-[#554020]
                    text-[10px]
                    font-sans
                    font-bold
                  "
                >
                  {getStatusLabel(
                    currentRecord.mapping.status
                  )}
                </span>

              </div>


              <h2
                className="
                  mt-2
                  font-serif
                  text-xl
                  lg:text-2xl
                  font-bold
                  text-[#2e3230]
                "
              >
                Material Mapping Verification
              </h2>


              <p
                className="
                  mt-1
                  text-xs
                  font-sans
                  text-[#6b706d]
                "
              >
                Review candidate{' '}
                {selectedIndex + 1}{' '}
                of{' '}
                {filteredRecords.length}
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
                onClick={goPrevious}
                disabled={
                  filteredRecords.length <= 1
                }
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-white
                  border
                  border-[#e4e0d8]
                  flex
                  items-center
                  justify-center
                  text-[#4a4e4a]
                  hover:bg-[#eae6de]
                  disabled:opacity-40
                "
              >

                <ChevronLeft
                  size={18}
                />

              </button>


              <button
                type="button"
                onClick={goNext}
                disabled={
                  filteredRecords.length <= 1
                }
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-white
                  border
                  border-[#e4e0d8]
                  flex
                  items-center
                  justify-center
                  text-[#4a4e4a]
                  hover:bg-[#eae6de]
                  disabled:opacity-40
                "
              >

                <ChevronRight
                  size={18}
                />

              </button>

            </div>

          </div>


          {/* =================================================
             SIDE BY SIDE MATERIALS
             ================================================= */}

          <div
            className="
              mt-6
              grid
              grid-cols-1
              lg:grid-cols-11
              gap-5
            "
          >

            {/* ORIGINAL MATERIAL */}

            <div
              className="
                lg:col-span-5
                bg-white
                rounded-2xl
                p-5
                border
                border-[#e4e0d8]
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-5
                "
              >

                <span
                  className="
                    w-2.5
                    h-2.5
                    rounded-full
                    bg-[#705c30]
                  "
                />

                <h3
                  className="
                    font-serif
                    font-bold
                    text-base
                    text-[#2e3230]
                  "
                >
                  Original CPSE Material
                </h3>

              </div>


              <div
                className="
                  space-y-4
                "
              >

                <div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#6b706d]
                      font-sans
                      font-bold
                    "
                  >
                    Material Code
                  </span>


                  <div
                    className="
                      mt-1
                      inline-block
                      px-3
                      py-1.5
                      rounded-lg
                      bg-[#f5f1ea]
                      border
                      border-[#e4e0d8]
                      font-mono
                      text-sm
                      font-bold
                      text-[#2e3230]
                    "
                  >
                    {currentRecord.original
                      ?.material_code ||
                      'Unavailable'}
                  </div>

                </div>


                <div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#6b706d]
                      font-sans
                      font-bold
                    "
                  >
                    Original Description
                  </span>


                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      font-sans
                      font-semibold
                      text-[#2e3230]
                    "
                  >
                    {currentRecord.original
                      ?.original_description ||
                      'Unavailable'}
                  </p>

                </div>


                <div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#6b706d]
                      font-sans
                      font-bold
                    "
                  >
                    Specifications
                  </span>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      font-sans
                      text-[#4a4e4a]
                      whitespace-pre-wrap
                    "
                  >
                    {currentRecord.original
                      ?.original_specifications ||
                      currentRecord.original
                        ?.technical_parameters ||
                      'No specifications recorded.'}
                  </p>

                </div>


                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                  "
                >

                  <div
                    className="
                      bg-[#f5f1ea]
                      rounded-xl
                      p-3
                      border
                      border-[#e4e0d8]
                    "
                  >

                    <span
                      className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-[#6b706d]
                        font-bold
                      "
                    >
                      Category
                    </span>


                    <div
                      className="
                        mt-1
                        text-xs
                        font-bold
                        text-[#2e3230]
                      "
                    >
                      {currentRecord.original
                        ?.category ||
                        'Not classified'}
                    </div>

                  </div>


                  <div
                    className="
                      bg-[#f5f1ea]
                      rounded-xl
                      p-3
                      border
                      border-[#e4e0d8]
                    "
                  >

                    <span
                      className="
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-[#6b706d]
                        font-bold
                      "
                    >
                      Unit
                    </span>


                    <div
                      className="
                        mt-1
                        text-xs
                        font-bold
                        text-[#2e3230]
                      "
                    >
                      {currentRecord.original
                        ?.original_unit ||
                        '—'}
                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* MATCH INDICATOR */}

            <div
              className="
                lg:col-span-1
                flex
                flex-col
                items-center
                justify-center
                gap-3
              "
            >

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-[#c8e8d0]
                  flex
                  items-center
                  justify-center
                  text-[#4a7c59]
                "
              >

                <Link2
                  size={23}
                />

              </div>


              {confidence !== null && (

                <div
                  className="
                    text-center
                  "
                >

                  <div
                    className="
                      font-serif
                      font-bold
                      text-lg
                      text-[#4a7c59]
                    "
                  >
                    {confidence.toFixed(1)}%
                  </div>


                  <div
                    className="
                      text-[9px]
                      uppercase
                      tracking-tight
                      text-[#6b706d]
                      font-sans
                      font-bold
                    "
                  >
                    AI Confidence
                  </div>

                </div>

              )}

            </div>


            {/* NATIONAL MATERIAL */}

            <div
              className="
                lg:col-span-5
                bg-white
                rounded-2xl
                p-5
                border
                border-[#e4e0d8]
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-5
                "
              >

                <span
                  className="
                    w-2.5
                    h-2.5
                    rounded-full
                    bg-[#4a7c59]
                  "
                />

                <h3
                  className="
                    font-serif
                    font-bold
                    text-base
                    text-[#2e3230]
                  "
                >
                  Proposed National Material
                </h3>

              </div>


              <div
                className="
                  space-y-4
                "
              >

                <div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#6b706d]
                      font-sans
                      font-bold
                    "
                  >
                    National Material Code
                  </span>


                  <div
                    className="
                      mt-1
                      inline-block
                      px-3
                      py-1.5
                      rounded-lg
                      bg-[#c8e8d0]/60
                      border
                      border-[#b5d6bd]
                      font-mono
                      text-sm
                      font-bold
                      text-[#2a6038]
                    "
                  >
                    {currentRecord.national
                      ?.national_code ||
                      'Unavailable'}
                  </div>

                </div>


                <div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#6b706d]
                      font-sans
                      font-bold
                    "
                  >
                    Standardized Description
                  </span>


                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      font-sans
                      font-semibold
                      text-[#2e3230]
                    "
                  >
                    {currentRecord.national
                      ?.standard_description ||
                      'Unavailable'}
                  </p>

                </div>


                <div>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#6b706d]
                      font-sans
                      font-bold
                    "
                  >
                    Category
                  </span>


                  <p
                    className="
                      mt-1
                      text-xs
                      font-sans
                      text-[#4a4e4a]
                    "
                  >
                    {currentRecord.national
                      ?.category ||
                      'Not classified'}
                  </p>

                </div>


                <div
                  className="
                    rounded-xl
                    bg-[#f5f1ea]
                    border
                    border-[#e4e0d8]
                    p-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      text-[#2e3230]
                    "
                  >

                    <Database
                      size={15}
                      className="text-[#4a7c59]"
                    />

                    Match Type

                  </div>


                  <div
                    className="
                      mt-1
                      text-xs
                      font-mono
                      font-bold
                      text-[#4a7c59]
                    "
                  >
                    {currentRecord.mapping
                      .match_type ||
                      'UNSPECIFIED'}
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
             AI EXPLANATION
             ================================================= */}

          <div
            className="
              mt-5
              rounded-2xl
              bg-white
              border
              border-[#e4e0d8]
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <ShieldCheck
                size={18}
                className="text-[#4a7c59]"
              />

              <h3
                className="
                  font-serif
                  font-bold
                  text-base
                  text-[#2e3230]
                "
              >
                AI Recommendation Explanation
              </h3>

            </div>


            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[#4a4e4a]
                font-sans
              "
            >
              {currentRecord.mapping
                .explanation ||
                'No explanation was recorded for this recommendation.'}
            </p>

          </div>


          {/* =================================================
             ACTION BAR
             ================================================= */}

          <div
            className="
              mt-5
              pt-5
              border-t
              border-[#eae6de]
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
            "
          >

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              <button
                type="button"
                disabled={
                  isActionLoading ||
                  currentRecord.mapping.status?.toUpperCase() !==
                    'PENDING'
                }
                onClick={() =>
                  approveCurrent()
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  bg-[#4a7c59]
                  text-white
                  text-xs
                  font-sans
                  font-bold
                  shadow-sm
                  hover:bg-[#416c4e]
                  disabled:opacity-40
                  transition-colors
                "
              >

                <CheckCircle2
                  size={17}
                />

                Approve Mapping

              </button>


              <button
                type="button"
                disabled={
                  isActionLoading ||
                  currentRecord.mapping.status?.toUpperCase() !==
                    'PENDING'
                }
                onClick={() =>
                  setShowAdjustment(true)
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  bg-[#f0ece4]
                  border
                  border-[#e4e0d8]
                  text-[#2e3230]
                  text-xs
                  font-sans
                  font-bold
                  hover:bg-[#eae6de]
                  disabled:opacity-40
                  transition-colors
                "
              >

                <ClipboardCheck
                  size={16}
                />

                Approve with Reason

              </button>


              <button
                type="button"
                disabled={
                  isActionLoading ||
                  currentRecord.mapping.status?.toUpperCase() !==
                    'PENDING'
                }
                onClick={() =>
                  rejectCurrent()
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  bg-[#fff4f3]
                  border
                  border-[#e4e0d8]
                  text-[#b83230]
                  text-xs
                  font-sans
                  font-bold
                  hover:bg-[#ffdad8]
                  disabled:opacity-40
                  transition-colors
                "
              >

                <XCircle
                  size={16}
                />

                Reject Mapping

              </button>

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
                onClick={goPrevious}
                disabled={
                  filteredRecords.length <= 1
                }
                className="
                  px-3
                  py-2
                  rounded-xl
                  bg-white
                  border
                  border-[#e4e0d8]
                  text-xs
                  font-sans
                  font-bold
                  disabled:opacity-40
                "
              >
                ← Previous
              </button>


              <button
                type="button"
                onClick={goNext}
                disabled={
                  filteredRecords.length <= 1
                }
                className="
                  px-3
                  py-2
                  rounded-xl
                  bg-white
                  border
                  border-[#e4e0d8]
                  text-xs
                  font-sans
                  font-bold
                  disabled:opacity-40
                "
              >
                Next →
              </button>

            </div>

          </div>

        </motion.section>

      )}


      {/* =====================================================
         REAL DATA SUMMARY
         ===================================================== */}

      <motion.section
        variants={staggerCardVariants}
        className="
          bg-[#f5f1ea]
          rounded-2xl
          p-5
          border
          border-[#e4e0d8]
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <AlertTriangle
            size={17}
            className="text-[#705c30]"
          />

          <h3
            className="
              font-serif
              font-bold
              text-base
              text-[#2e3230]
            "
          >
            Verification Workflow
          </h3>

        </div>


        <div
          className="
            mt-4
            grid
            grid-cols-1
            md:grid-cols-4
            gap-3
          "
        >

          <div
            className="
              bg-white
              rounded-xl
              p-3
              border
              border-[#e4e0d8]
            "
          >

            <div
              className="
                text-[10px]
                uppercase
                tracking-wider
                text-[#6b706d]
                font-bold
              "
            >
              01
            </div>

            <div
              className="
                mt-1
                text-xs
                font-bold
                text-[#2e3230]
              "
            >
              AI Recommendation
            </div>

          </div>


          <div
            className="
              bg-white
              rounded-xl
              p-3
              border
              border-[#e4e0d8]
            "
          >

            <div
              className="
                text-[10px]
                uppercase
                tracking-wider
                text-[#6b706d]
                font-bold
              "
            >
              02
            </div>

            <div
              className="
                mt-1
                text-xs
                font-bold
                text-[#2e3230]
              "
            >
              Human Review
            </div>

          </div>


          <div
            className="
              bg-white
              rounded-xl
              p-3
              border
              border-[#e4e0d8]
            "
          >

            <div
              className="
                text-[10px]
                uppercase
                tracking-wider
                text-[#6b706d]
                font-bold
              "
            >
              03
            </div>

            <div
              className="
                mt-1
                text-xs
                font-bold
                text-[#2e3230]
              "
            >
              Approve / Reject
            </div>

          </div>


          <div
            className="
              bg-white
              rounded-xl
              p-3
              border
              border-[#e4e0d8]
            "
          >

            <div
              className="
                text-[10px]
                uppercase
                tracking-wider
                text-[#6b706d]
                font-bold
              "
            >
              04
            </div>

            <div
              className="
                mt-1
                text-xs
                font-bold
                text-[#2e3230]
              "
            >
              Audit Trail
            </div>

          </div>

        </div>

      </motion.section>


      {/* =====================================================
         ADJUSTMENT MODAL
         ===================================================== */}

      {showAdjustment && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            backdrop-blur-sm
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-2xl
              max-w-md
              w-full
              shadow-2xl
              border
              border-[#e4e0d8]
              p-6
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div>

                <h3
                  className="
                    font-serif
                    font-bold
                    text-lg
                    text-[#2e3230]
                  "
                >
                  Approval Reason
                </h3>


                <p
                  className="
                    mt-1
                    text-xs
                    text-[#6b706d]
                    font-sans
                  "
                >
                  Record why this mapping was
                  accepted during human verification.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowAdjustment(false)
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  hover:bg-[#f0ece4]
                  text-[#4a4e4a]
                "
              >
                ×
              </button>

            </div>


            <textarea
              value={adjustmentNotes}
              onChange={event =>
                setAdjustmentNotes(
                  event.target.value
                )
              }
              rows={5}
              placeholder="
                Enter the verification /
                adjustment reason...
              "
              className="
                mt-5
                w-full
                bg-[#f5f1ea]
                border
                border-[#e4e0d8]
                rounded-xl
                p-3
                text-sm
                text-[#2e3230]
                font-sans
                outline-none
                focus:border-[#4a7c59]
              "
            />


            <div
              className="
                mt-4
                flex
                justify-end
                gap-2
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowAdjustment(false)
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-[#f0ece4]
                  border
                  border-[#e4e0d8]
                  text-xs
                  font-bold
                  text-[#4a4e4a]
                "
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  isActionLoading
                }
                onClick={
                  approveWithAdjustment
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-[#4a7c59]
                  text-white
                  text-xs
                  font-bold
                  disabled:opacity-50
                "
              >
                Approve & Record Reason
              </button>

            </div>

          </div>

        </div>

      )}

    </motion.div>

  );

};


export { VerificationScreen };

export default VerificationScreen;