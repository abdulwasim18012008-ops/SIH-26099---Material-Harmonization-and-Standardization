import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  motion,
} from 'framer-motion';

import {
  Search,
  ArrowRight,
  Database,
  Building2,
  PackageSearch,
  Hash,
  Boxes,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ChevronRight,
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


type SearchMode =
  | 'all'
  | 'national'
  | 'cpse'
  | 'description'
  | 'category';


interface CpseMaterial {
  cpse_id: number;
  cpse_name: string | null;
  cpse_code: string | null;
  material_id: number;
  material_code: string;
  original_description: string;
  original_specifications: string | null;
  original_unit: string | null;
  mapping_id: number;
  match_type: string;
  confidence: string;
  mapping_status: string;
}


interface SearchMaterial {
  id: number;
  nationalCode: string;
  description: string;
  category: string;
  status: string;
  cpseMaterials: CpseMaterial[];
  specifications: string;
}


const SEARCH_MODES: {
  id: SearchMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'all',
    label: 'All',
    icon: <Search size={15} />,
  },
  {
    id: 'national',
    label: 'National Code',
    icon: <Hash size={15} />,
  },
  {
    id: 'cpse',
    label: 'CPSE Code',
    icon: <Building2 size={15} />,
  },
  {
    id: 'description',
    label: 'Description',
    icon: <PackageSearch size={15} />,
  },
  {
    id: 'category',
    label: 'Category',
    icon: <Database size={15} />,
  },
];


const MaterialSearchScreen: React.FC = () => {

  const {
    setActiveScreen,
    setSelectedCatalogCnmc,
    showToast,
  } = useApp();


  /* =======================================================
     STATE
     ======================================================= */

  const [
    items,
    setItems,
  ] = useState<SearchMaterial[]>([]);


  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');


  const [
    searchMode,
    setSearchMode,
  ] = useState<SearchMode>('all');


  const [
    selectedCpse,
    setSelectedCpse,
  ] = useState<string>('All');


  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string>('All');


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);


  const [
    selectedResult,
    setSelectedResult,
  ] = useState<SearchMaterial | null>(null);


  /* =======================================================
     LOAD REAL NATIONAL MATERIAL DATA
     ======================================================= */

  useEffect(() => {

    let cancelled = false;

    const loadMaterials = async () => {

      try {

        setIsLoading(true);

        const [
          nationalMaterials,
        ] = await Promise.all([
          portalApi.getNationalMaterials(),
        ]);


        /*
         * The backend gives us the national material master.
         *
         * CPSE mappings are loaded separately because the
         * backend exposes them through:
         *
         * /national-materials/{id}/cpse-materials
         */

        const materialsWithMappings =
          await Promise.all(
            nationalMaterials.map(
              async (material: any) => {

                try {

  const cpseResponse =
    await portalApi.getNationalMaterialCPSEMaterials(
      Number(material.id)
    );

  return {
    id: Number(material.id),
    nationalCode:
      material.national_code ?? '',
    description:
      material.standard_description ?? '',
    category:
      material.category ||
      (
        material.national_code?.startsWith('FST-')
          ? 'Fastener'
          : material.national_code?.startsWith('PIP-')
            ? 'Piping'
            : material.national_code?.startsWith('VLV-')
              ? 'Valve'
              : material.national_code?.startsWith('BRG-')
                ? 'Bearing'
                : material.national_code?.startsWith('ELE-')
                  ? 'Electrical'
                  : material.national_code?.startsWith('ROT-')
                    ? 'Rotating Equipment'
                    : 'Other'
      ),
    status:
      material.status ?? 'PENDING',
    cpseMaterials:
      Array.isArray(cpseResponse?.cpse_materials)
        ? cpseResponse.cpse_materials
        : [],
    specifications: '',
  };

                } catch (mappingError) {

                  console.warn(
                    `Unable to load CPSE mappings for national material ${material.id}:`,
                    mappingError
                  );

                  return {
                    id: Number(material.id),
                    nationalCode:
                      material.national_code ?? '',
                    description:
                      material.standard_description ?? '',
                    category:
                      material.category ?? '',
                    status:
                      material.status ?? 'PENDING',
                    cpseMaterials: [],
                    specifications: '',
                  };

                }

              }
            )
          );


        if (!cancelled) {
          setItems(materialsWithMappings);
        }

      } catch (error) {

        console.error(
          'Unable to load national material master:',
          error
        );

        if (!cancelled) {

          setItems([]);

          showToast(
            'Unable to load national material master.',
            'error'
          );

        }

      } finally {

        if (!cancelled) {
          setIsLoading(false);
        }

      }

    };


    loadMaterials();


    return () => {
      cancelled = true;
    };

  }, [showToast]);


  /* =======================================================
     SEARCH LOGIC
     ======================================================= */

  const filteredResults = useMemo(() => {

    const query =
      searchTerm.trim().toLowerCase();


    let results = [...items];


    /* -------------------------------------------------------
       CPSE FILTER
       ------------------------------------------------------- */

    if (selectedCpse !== 'All') {

      results =
        results.filter(item =>
          item.cpseMaterials.some(
            cpse =>
              (
                cpse.cpse_name ?? ''
              ).toLowerCase() ===
              selectedCpse.toLowerCase()
          )
        );

    }


    /* -------------------------------------------------------
       CATEGORY FILTER
       ------------------------------------------------------- */

    if (selectedCategory !== 'All') {

      results =
        results.filter(
          item =>
            item.category ===
            selectedCategory
        );

    }


    /* -------------------------------------------------------
       TEXT SEARCH
       ------------------------------------------------------- */

    if (!query) {

      return results.slice(0, 50);

    }


    return results.filter(item => {

      const nationalCode =
        item.nationalCode.toLowerCase();


      const description =
        item.description.toLowerCase();


      const category =
        item.category.toLowerCase();


      const cpseCodes =
        item.cpseMaterials
          .map(
            cpse =>
              `${cpse.material_code} ${
                cpse.cpse_code ?? ''
              } ${
                cpse.cpse_name ?? ''
              }`
          )
          .join(' ')
          .toLowerCase();


      switch (searchMode) {

        case 'national':

          return nationalCode.includes(query);


        case 'cpse':

          return cpseCodes.includes(query);


        case 'description':

          return description.includes(query);


        case 'category':

          return category.includes(query);


        case 'all':
        default:

          return (
            nationalCode.includes(query) ||
            description.includes(query) ||
            category.includes(query) ||
            cpseCodes.includes(query)
          );

      }

    }).slice(0, 50);

  }, [
    items,
    searchTerm,
    searchMode,
    selectedCpse,
    selectedCategory,
  ]);


  /* =======================================================
     HANDLE SEARCH
     ======================================================= */

  const handleSearch = (
    event?: React.FormEvent
  ) => {

    event?.preventDefault();

    setHasSearched(true);

  };


  /* =======================================================
     CLEAR SEARCH
     ======================================================= */

  const clearSearch = () => {

    setSearchTerm('');

    setSearchMode('all');

    setSelectedCpse('All');

    setSelectedCategory('All');

    setHasSearched(false);

    setSelectedResult(null);

  };


  /* =======================================================
     OPEN MATERIAL DETAILS
     ======================================================= */

  const openMaterialDetails = (
    item: SearchMaterial
  ) => {

    setSelectedCatalogCnmc(
      item.nationalCode
    );

    setSelectedResult(item);

    setActiveScreen(
      'material-details'
    );

  };


  /* =======================================================
     CPSE LIST
     ======================================================= */

  const cpseOptions = useMemo(() => {

    const cpseSet =
      new Set<string>();


    items.forEach(item => {

      item.cpseMaterials.forEach(
        cpse => {

          if (cpse.cpse_name) {
            cpseSet.add(
              cpse.cpse_name
            );
          }

        }
      );

    });


    return [
      'All',
      ...Array.from(cpseSet).sort(),
    ];

  }, [items]);


  /* =======================================================
     CATEGORY LIST
     ======================================================= */

  const categoryOptions = useMemo(() => {

    const categorySet =
      new Set<string>();


    items.forEach(item => {

      if (item.category) {

        categorySet.add(
          item.category
        );

      }

    });


    return [
      'All',
      ...Array.from(
        categorySet
      ).sort(),
    ];

  }, [items]);


  /* =======================================================
     QUICK SEARCH
     ======================================================= */

  const quickSearches = useMemo(() => {

    return items
      .slice(0, 5)
      .map(
        item => item.nationalCode
      )
      .filter(Boolean);

  }, [items]);


  /* =======================================================
     CPSE COVERAGE
     ======================================================= */

  const cpseCoverage =
    cpseOptions.length > 0
      ? cpseOptions.length - 1
      : 0;


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

      <motion.div
        variants={staggerCardVariants}
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-end
          lg:justify-between
          gap-5
          pt-2
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

              NATIONAL MATERIAL SEARCH

            </span>

          </div>


          <h1
            className="
              font-serif
              text-3xl
              md:text-4xl
              font-bold
              tracking-tight
              text-[#2e3230]
            "
          >
            Global Material Search
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
            Search the harmonized national material
            master using national codes, CPSE legacy
            codes, descriptions, or categories.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            setActiveScreen('catalog')
          }
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
            transition-colors
          "
        >

          <Database size={17} />

          Open Master Catalog

          <ArrowRight size={16} />

        </button>

      </motion.div>


      {/* =====================================================
         SEARCH PANEL
         ===================================================== */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl
          border
          border-[#e4e0d8]
          bg-white
          shadow-sm
          overflow-hidden
        "
      >

        <form
          onSubmit={handleSearch}
          className="
            p-4
            md:p-5
          "
        >

          {/* Search box */}

          <div
            className="
              flex
              flex-col
              lg:flex-row
              gap-3
            "
          >

            <div
              className="
                flex-1
                relative
              "
            >

              <Search
                size={20}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[#6b706d]
                "
              />


              <input
                type="text"
                value={searchTerm}
                onChange={event =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="
                  Search national code,
                  CPSE code, description
                  or category...
                "
                className="
                  w-full
                  h-12
                  pl-12
                  pr-12
                  rounded-xl
                  bg-[#f5f1ea]
                  border
                  border-[#e4e0d8]
                  text-[#2e3230]
                  text-sm
                  font-sans
                  outline-none
                  focus:border-[#a5555a]
                  focus:ring-2
                  focus:ring-[#a5555a]/10
                "
              />


              {searchTerm && (

                <button
                  type="button"
                  onClick={clearSearch}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    p-1.5
                    rounded-lg
                    text-[#6b706d]
                    hover:bg-[#eae6de]
                    transition-colors
                  "
                  aria-label="Clear search"
                >

                  <X size={17} />

                </button>

              )}

            </div>


            <button
              type="submit"
              className="
                h-12
                px-6
                rounded-xl
                bg-[#4a7c59]
                hover:bg-[#416c4e]
                text-white
                text-sm
                font-sans
                font-bold
                inline-flex
                items-center
                justify-center
                gap-2
                shadow-sm
                transition-colors
              "
            >

              <Search size={17} />

              Search

            </button>

          </div>


          {/* Search modes */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >

            {SEARCH_MODES.map(mode => {

              const active =
                searchMode === mode.id;


              return (

                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    setSearchMode(
                      mode.id
                    )
                  }
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-2
                    rounded-xl
                    border
                    text-xs
                    font-sans
                    font-bold
                    transition-colors
                    ${
                      active
                        ? 'bg-[#a5555a] text-white border-[#a5555a]'
                        : 'bg-[#f5f1ea] text-[#4a4e4a] border-[#e4e0d8] hover:bg-[#eae6de]'
                    }
                  `}
                >

                  {mode.icon}

                  {mode.label}

                </button>

              );

            })}

          </div>


          {/* Filters */}

          <div
            className="
              mt-4
              flex
              flex-col
              md:flex-row
              gap-3
            "
          >

            {/* CPSE */}

            <div
              className="
                flex
                items-center
                gap-2
                flex-1
              "
            >

              <SlidersHorizontal
                size={16}
                className="text-[#705c30]"
              />

              <span
                className="
                  text-xs
                  font-sans
                  font-bold
                  text-[#4a4e4a]
                "
              >
                CPSE
              </span>


              <select
                value={selectedCpse}
                onChange={event =>
                  setSelectedCpse(
                    event.target.value
                  )
                }
                className="
                  flex-1
                  h-10
                  px-3
                  rounded-xl
                  bg-[#f5f1ea]
                  border
                  border-[#e4e0d8]
                  text-xs
                  font-sans
                  font-semibold
                  text-[#2e3230]
                  outline-none
                "
              >

                {cpseOptions.map(cpse => (

                  <option
                    key={cpse}
                    value={cpse}
                  >
                    {cpse}
                  </option>

                ))}

              </select>

            </div>


            {/* Category */}

            <div
              className="
                flex
                items-center
                gap-2
                flex-1
              "
            >

              <PackageSearch
                size={16}
                className="text-[#705c30]"
              />

              <span
                className="
                  text-xs
                  font-sans
                  font-bold
                  text-[#4a4e4a]
                "
              >
                Category
              </span>


              <select
                value={
                  selectedCategory
                }
                onChange={event =>
                  setSelectedCategory(
                    event.target.value
                  )
                }
                className="
                  flex-1
                  h-10
                  px-3
                  rounded-xl
                  bg-[#f5f1ea]
                  border
                  border-[#e4e0d8]
                  text-xs
                  font-sans
                  font-semibold
                  text-[#2e3230]
                  outline-none
                "
              >

                {categoryOptions.map(
                  category => (

                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>

        </form>


        {/* ===================================================
           QUICK SEARCHES
           =================================================== */}

        <div
          className="
            px-4
            md:px-5
            pb-5
          "
        >

          <div
            className="
              text-[11px]
              uppercase
              tracking-wider
              font-sans
              font-bold
              text-[#6b706d]
              mb-2
            "
          >
            Quick Search
          </div>


          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            {quickSearches.length === 0 ? (

              <span
                className="
                  text-xs
                  text-[#6b706d]
                  font-sans
                "
              >
                No national material records available.
              </span>

            ) : (

              quickSearches.map(
                query => (

                  <button
                    key={query}
                    type="button"
                    onClick={() => {

                      setSearchTerm(query);

                      setSearchMode(
                        'national'
                      );

                      setHasSearched(true);

                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-1.5
                      rounded-lg
                      border
                      border-[#e4e0d8]
                      bg-[#faf8f4]
                      hover:bg-[#f0ece4]
                      text-[#4a4e4a]
                      text-xs
                      font-sans
                      transition-colors
                    "
                  >

                    <Search
                      size={13}
                    />

                    {query}

                  </button>

                )
              )

            )}

          </div>

        </div>

      </motion.div>


      {/* =====================================================
         SEARCH SUMMARY
         ===================================================== */}

      <motion.div
        variants={staggerCardVariants}
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-4
        "
      >

        {/* Master Records */}

        <div
          className="
            rounded-2xl
            bg-white
            border
            border-[#e4e0d8]
            p-4
            shadow-sm
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
                text-[11px]
                uppercase
                tracking-wider
                font-sans
                font-bold
                text-[#6b706d]
              "
            >
              National Materials
            </span>

            <Boxes
              size={18}
              className="text-[#4a7c59]"
            />

          </div>


          <div
            className="
              mt-2
              text-2xl
              font-serif
              font-bold
              text-[#2e3230]
            "
          >
            {items.length.toLocaleString()}
          </div>

        </div>


        {/* Results */}

        <div
          className="
            rounded-2xl
            bg-white
            border
            border-[#e4e0d8]
            p-4
            shadow-sm
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
                text-[11px]
                uppercase
                tracking-wider
                font-sans
                font-bold
                text-[#6b706d]
              "
            >
              Results
            </span>

            <Search
              size={18}
              className="text-[#a5555a]"
            />

          </div>


          <div
            className="
              mt-2
              text-2xl
              font-serif
              font-bold
              text-[#2e3230]
            "
          >
            {filteredResults.length}
          </div>

        </div>


        {/* CPSE Coverage */}

        <div
          className="
            rounded-2xl
            bg-white
            border
            border-[#e4e0d8]
            p-4
            shadow-sm
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
                text-[11px]
                uppercase
                tracking-wider
                font-sans
                font-bold
                text-[#6b706d]
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
              mt-2
              text-2xl
              font-serif
              font-bold
              text-[#2e3230]
            "
          >
            {cpseCoverage}
          </div>

        </div>


        {/* Search Status */}

        <div
          className="
            rounded-2xl
            bg-white
            border
            border-[#e4e0d8]
            p-4
            shadow-sm
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
                text-[11px]
                uppercase
                tracking-wider
                font-sans
                font-bold
                text-[#6b706d]
              "
            >
              Search Status
            </span>

            <CheckCircle2
              size={18}
              className="text-[#4a7c59]"
            />

          </div>


          <div
            className="
              mt-2
              text-sm
              font-sans
              font-bold
              text-[#2a6038]
            "
          >

            {isLoading
              ? 'Loading master...'
              : hasSearched
                ? 'Search completed'
                : 'Ready to search'
            }

          </div>

        </div>

      </motion.div>


      {/* =====================================================
         RESULTS
         ===================================================== */}

      <motion.div
        variants={staggerCardVariants}
        className="
          rounded-2xl
          bg-white
          border
          border-[#e4e0d8]
          shadow-sm
          overflow-hidden
        "
      >

        <div
          className="
            px-4
            md:px-5
            py-4
            border-b
            border-[#eae6de]
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-3
          "
        >

          <div>

            <div
              className="
                font-serif
                font-bold
                text-lg
                text-[#2e3230]
              "
            >
              Material Search Results
            </div>

            <div
              className="
                mt-1
                text-xs
                text-[#6b706d]
                font-sans
              "
            >

              {searchTerm
                ? `Showing matches for "${searchTerm}"`
                : 'Search the national harmonized material master'
              }

            </div>

          </div>


          {searchTerm && (

            <button
              type="button"
              onClick={clearSearch}
              className="
                inline-flex
                items-center
                gap-1.5
                px-3
                py-2
                rounded-lg
                bg-[#f5f1ea]
                border
                border-[#e4e0d8]
                text-[#4a4e4a]
                text-xs
                font-sans
                font-bold
                hover:bg-[#eae6de]
              "
            >

              <X size={14} />

              Clear

            </button>

          )}

        </div>


        {/* Loading */}

        {isLoading && (

          <div
            className="
              py-16
              flex
              flex-col
              items-center
              justify-center
              text-center
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

            <div
              className="
                mt-4
                text-sm
                font-sans
                font-semibold
                text-[#4a4e4a]
              "
            >
              Loading national material master...
            </div>

          </div>

        )}


        {/* Empty */}

        {!isLoading &&
          filteredResults.length === 0 && (

            <div
              className="
                py-16
                px-6
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
                  bg-[#f5f1ea]
                  flex
                  items-center
                  justify-center
                  text-[#705c30]
                "
              >

                <PackageSearch
                  size={28}
                />

              </div>


              <h3
                className="
                  mt-4
                  font-serif
                  font-bold
                  text-lg
                  text-[#2e3230]
                "
              >
                No matching materials
              </h3>


              <p
                className="
                  mt-1
                  max-w-md
                  text-sm
                  text-[#6b706d]
                  font-sans
                "
              >
                Try another national code,
                CPSE legacy code, material
                description, or category.
              </p>

            </div>

          )}


        {/* Results */}

        {!isLoading &&
          filteredResults.length > 0 && (

            <div
              className="
                divide-y
                divide-[#eae6de]
              "
            >

              {filteredResults.map(
                (item, index) => (

                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.03,
                    }}
                    className="
                      p-4
                      md:p-5
                      hover:bg-[#faf8f4]
                      transition-colors
                      cursor-pointer
                    "
                    onClick={() =>
                      openMaterialDetails(
                        item
                      )
                    }
                  >

                    <div
                      className="
                        flex
                        flex-col
                        xl:flex-row
                        xl:items-center
                        gap-4
                      "
                    >

                      {/* Identity */}

                      <div
                        className="
                          flex-1
                          min-w-0
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

                          <span
                            className="
                              font-mono
                              text-sm
                              font-bold
                              text-[#4a7c59]
                            "
                          >
                            {item.nationalCode}
                          </span>


                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1
                              px-2
                              py-1
                              rounded-full
                              bg-[#c8e8d0]/60
                              text-[#2a6038]
                              text-[10px]
                              font-sans
                              font-bold
                            "
                          >

                            <CheckCircle2
                              size={11}
                            />

                            {item.status}

                          </span>

                        </div>


                        <div
                          className="
                            mt-2
                            font-sans
                            font-bold
                            text-base
                            text-[#2e3230]
                          "
                        >
                          {item.description}
                        </div>


                        <div
                          className="
                            mt-1
                            text-xs
                            text-[#6b706d]
                            font-sans
                            line-clamp-2
                          "
                        >
                          {item.category ||
                            'No category specified'}
                        </div>

                      </div>


                      {/* CPSE */}

                      <div
                        className="
                          w-full
                          xl:w-56
                        "
                      >

                        <div
                          className="
                            text-[10px]
                            uppercase
                            tracking-wider
                            font-sans
                            font-bold
                            text-[#6b706d]
                          "
                        >
                          CPSE Mappings
                        </div>


                        <div
                          className="
                            mt-1
                            flex
                            flex-wrap
                            gap-1
                          "
                        >

                          {item.cpseMaterials
                            .length === 0 ? (

                            <span
                              className="
                                text-xs
                                text-[#6b706d]
                                font-sans
                              "
                            >
                              No CPSE mapping
                            </span>

                          ) : (

                            item.cpseMaterials
                              .slice(0, 5)
                              .map(cpse => (

                                <span
                                  key={
                                    cpse.mapping_id
                                  }
                                  className="
                                    px-2
                                    py-1
                                    rounded-lg
                                    bg-[#f5f1ea]
                                    border
                                    border-[#e4e0d8]
                                    text-[10px]
                                    font-sans
                                    font-bold
                                    text-[#4a4e4a]
                                  "
                                >
                                  {cpse.material_code}
                                </span>

                              ))

                          )}

                        </div>

                      </div>


                      {/* Mapping count */}

                      <div
                        className="
                          w-full
                          xl:w-28
                        "
                      >

                        <div
                          className="
                            text-[10px]
                            uppercase
                            tracking-wider
                            font-sans
                            font-bold
                            text-[#6b706d]
                          "
                        >
                          CPSE Count
                        </div>


                        <div
                          className="
                            mt-1
                            font-mono
                            text-sm
                            font-bold
                            text-[#2e3230]
                          "
                        >
                          {item.cpseMaterials.length}
                        </div>

                      </div>


                      {/* Category */}

                      <div
                        className="
                          w-full
                          xl:w-40
                        "
                      >

                        <div
                          className="
                            text-[10px]
                            uppercase
                            tracking-wider
                            font-sans
                            font-bold
                            text-[#6b706d]
                          "
                        >
                          Category
                        </div>


                        <div
                          className="
                            mt-1
                            text-xs
                            font-sans
                            font-semibold
                            text-[#2e3230]
                            line-clamp-2
                          "
                        >
                          {item.category ||
                            'Not classified'}
                        </div>

                      </div>


                      {/* Open */}

                      <div
                        className="
                          flex
                          items-center
                          justify-end
                          xl:w-36
                        "
                      >

                        <button
                          type="button"
                          onClick={event => {

                            event.stopPropagation();

                            openMaterialDetails(
                              item
                            );

                          }}
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-2
                            rounded-xl
                            bg-[#f5f1ea]
                            border
                            border-[#e4e0d8]
                            hover:bg-[#eae6de]
                            text-[#2e3230]
                            text-xs
                            font-sans
                            font-bold
                            transition-colors
                          "
                        >

                          View Details

                          <ChevronRight
                            size={15}
                          />

                        </button>

                      </div>

                    </div>

                  </motion.div>

                )
              )}

            </div>

          )}

      </motion.div>


      {/* =====================================================
         SELECTED RESULT PREVIEW
         ===================================================== */}

      {selectedResult && (

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            rounded-2xl
            border
            border-[#d9d2c8]
            bg-[#f5f1ea]
            p-5
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-start
              md:justify-between
              gap-4
            "
          >

            <div>

              <div
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  font-sans
                  font-bold
                  text-[#6b706d]
                "
              >
                Selected Material
              </div>


              <div
                className="
                  mt-1
                  font-mono
                  text-base
                  font-bold
                  text-[#4a7c59]
                "
              >
                {selectedResult.nationalCode}
              </div>


              <div
                className="
                  mt-1
                  font-serif
                  font-bold
                  text-xl
                  text-[#2e3230]
                "
              >
                {selectedResult.description}
              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                openMaterialDetails(
                  selectedResult
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-[#4a7c59]
                text-white
                text-xs
                font-sans
                font-bold
                hover:bg-[#416c4e]
                transition-colors
              "
            >

              Open Material Details

              <ArrowRight
                size={15}
              />

            </button>

          </div>

        </motion.div>

      )}

    </motion.div>

  );

};


export { MaterialSearchScreen };

export default MaterialSearchScreen;