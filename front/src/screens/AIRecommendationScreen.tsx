import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MaterialRecommendation } from '../types';
import { portalApi } from '../services/apiClient';

export const AIRecommendationScreen: React.FC = () => {
  const { setActiveScreen, showToast } = useApp();

  /*
   * AI recommendation data will be supplied by the backend.
   *
   * No material/demo record is created here.
   */
  const [recommendation, setRecommendation] =
    useState<MaterialRecommendation | null>(null);
  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        const [
          mappings,
          materials,
          nationalMaterials,
        ] = await Promise.all([
          portalApi.getMappings(),
          portalApi.getMaterials(),
          portalApi.getNationalMaterials(),
        ]);

        if (!mappings.length) {
          setRecommendation(null);
          return;
        }

        const pendingMappings = mappings.filter(
  (mapping: any) =>
    mapping.status === 'PENDING' ||
    mapping.status === 'pending'
);

const pendingMapping =
  pendingMappings.length > 0
    ? pendingMappings.reduce(
        (latest: any, current: any) =>
          Number(current.id) > Number(latest.id)
            ? current
            : latest
      )
    : mappings.reduce(
        (latest: any, current: any) =>
          Number(current.id) > Number(latest.id)
            ? current
            : latest
      );

        const originalMaterial =
          materials.find(
            (material: any) =>
              Number(material.id) ===
              Number(
                pendingMapping.original_material_id
              )
          );

        const nationalMaterial =
          nationalMaterials.find(
            (material: any) =>
              Number(material.id) ===
              Number(
                pendingMapping.national_material_id
              )
          );

        if (!originalMaterial || !nationalMaterial) {
          setRecommendation(null);
          return;
        }
const rawConfidence =
  Number(pendingMapping.confidence) || 0;

const confidenceValue =
  rawConfidence <= 1
    ? rawConfidence * 100
    : rawConfidence;

        const attributes =
          originalMaterial.technical_parameters
            ? originalMaterial.technical_parameters
                .split(',')
                .map((value: string) => ({
                  label: 'Technical Parameter',
                  value: value.trim(),
                  confidence: confidenceValue,
                }))
                .filter(
                  (item: any) => item.value.length > 0
                )
            : [];

        const recommendationData: MaterialRecommendation = {
          groupId:
            `MAPPING-${pendingMapping.id}`,

          sourceDescriptions: [
            {
              cpse:
                `CPSE ${originalMaterial.cpse_id}`,
              code:
                originalMaterial.material_code,
              description:
                originalMaterial.original_description,
            },
          ],

          standardizedDescription:
            nationalMaterial.standard_description,

          proposedNationalCode:
            nationalMaterial.national_code,

          category:
            nationalMaterial.category ||
            originalMaterial.category ||
            'Unclassified',

          subcategory:
            originalMaterial.category ||
            'Unclassified',

          confidence:
            confidenceValue,

          matchType:
            pendingMapping.match_type as
              MaterialRecommendation['matchType'],

          attributes,

          missingAttributes: [],

          explanation: [
            {
              label: 'AI Matching Decision',
              detail:
                pendingMapping.explanation ||
                'AI-generated material mapping recommendation.',
              positive:
                pendingMapping.status !== 'REJECTED' &&
                pendingMapping.status !== 'rejected',
            },
          ],
        };

        setRecommendation(
          recommendationData
        );

        setStatus(
          pendingMapping.status === 'APPROVED' ||
          pendingMapping.status === 'approved'
            ? 'approved'
            : pendingMapping.status === 'REJECTED' ||
              pendingMapping.status === 'rejected'
              ? 'rejected'
              : 'pending'
        );

      } catch (error) {
        console.error(
          'Unable to load AI recommendation:',
          error
        );

        setRecommendation(null);

        showToast(
          'Unable to load AI recommendation.',
          'error'
        );
      }
    };

    loadRecommendation();
  }, [showToast]);
  const [status, setStatus] = useState<
    'pending' | 'approved' | 'modified' | 'rejected'
  >('pending');
  

  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);

  const [draftDescription, setDraftDescription] = useState('');
  const [draftCode, setDraftCode] = useState('');

  const scoreWidth = useMemo(
    () =>
      recommendation
        ? `${Math.min(100, recommendation.confidence)}%`
        : '0%',
    [recommendation]
  );

  const approve = () => {
    if (!recommendation) {
      showToast(
        'No AI recommendation is available for approval.',
        'warning'
      );
      return;
    }

    setStatus('approved');

    showToast(
      'AI recommendation approved. Ready for CPSE mapping.',
      'success'
    );

    setActiveScreen('mapping');
  };

  const reject = () => {
    if (!recommendation) {
      showToast(
        'No AI recommendation is available for rejection.',
        'warning'
      );
      return;
    }

    setStatus('rejected');

    showToast(
      'AI recommendation rejected and recorded for feedback.',
      'warning'
    );
  };

  const saveModification = () => {
    if (!recommendation) {
      showToast(
        'No AI recommendation is available to modify.',
        'warning'
      );
      return;
    }

    setRecommendation(prev =>
      prev
        ? {
            ...prev,
            standardizedDescription: draftDescription,
            proposedNationalCode: draftCode,
          }
        : prev
    );

    setStatus('modified');
    setEditing(false);

    showToast(
      'Recommendation modified. New version will be created.',
      'info'
    );
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
            onClick={() => setActiveScreen('verification')}
            className="text-xs font-bold text-[#4a7c59] mb-2 hover:underline"
          >
            ← Back to Human Verification
          </button>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a5555a]">
              psychology
            </span>

            <h1 className="text-2xl font-serif font-bold text-[#2e3230]">
              AI Recommendation & Standardization
            </h1>
          </div>

          <p className="text-sm text-[#4a4e4a] mt-1">
            Material Group {recommendation?.groupId || '—'}
          </p>
        </div>

        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            status === 'approved'
              ? 'bg-[#c8e8d0] text-[#2a6038]'
              : status === 'rejected'
                ? 'bg-[#f3d1d1] text-[#7b3338]'
                : status === 'modified'
                  ? 'bg-[#e5ddf2] text-[#654b7b]'
                  : 'bg-[#f4e6c7] text-[#705c30]'
          }`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {!recommendation ? (
        <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-8">
          <div className="flex flex-col items-center justify-center text-center min-h-[360px]">
            <span className="material-symbols-outlined text-5xl text-[#a5555a] mb-4">
              psychology
            </span>

            <h2 className="text-lg font-bold text-[#2e3230]">
              No AI recommendation available
            </h2>

            <p className="text-sm text-[#4a4e4a] mt-2 max-w-md leading-relaxed">
              AI recommendation results will appear here after the
              material analysis and matching process is completed by
              the backend AI engine.
            </p>

            <button
              type="button"
              onClick={() => setActiveScreen('verification')}
              className="mt-5 px-4 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
            >
              Back to Human Verification
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-6">
            <div className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#eae6de] bg-[#f0ece4] flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                    AI Recommendation
                  </p>

                  <h2 className="font-bold text-[#2e3230] mt-1">
                    Standardized Material Candidate
                  </h2>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#c8e8d0]/70 text-[#2a6038] text-[10px] font-bold">
                  {recommendation.matchType}
                </span>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                    Standardized Description
                  </label>

                  {editing ? (
                    <input
                      value={draftDescription}
                      onChange={e =>
                        setDraftDescription(e.target.value)
                      }
                      className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#d9d2c8] bg-[#f5f1ea] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5555a]/20"
                    />
                  ) : (
                    <div className="mt-2 p-3.5 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8] font-bold text-[#2e3230]">
                      {recommendation.standardizedDescription}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
                    <p className="text-[10px] font-bold text-[#4a4e4a]">
                      CATEGORY
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {recommendation.category}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
                    <p className="text-[10px] font-bold text-[#4a4e4a]">
                      SUBCATEGORY
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {recommendation.subcategory}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]">
                    <p className="text-[10px] font-bold text-[#4a4e4a]">
                      MATCH TYPE
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {recommendation.matchType}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                    Proposed National Material Code
                  </label>

                  {editing ? (
                    <input
                      value={draftCode}
                      onChange={e =>
                        setDraftCode(e.target.value)
                      }
                      className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#d9d2c8] bg-[#f5f1ea] text-sm font-mono font-bold focus:outline-none"
                    />
                  ) : (
                    <div className="mt-2 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#fffaf0] border border-[#ead9ad]">
                      <span className="font-mono font-bold text-[#705c30]">
                        {recommendation.proposedNationalCode}
                      </span>

                      <span className="text-[9px] font-bold uppercase text-[#8a6d30]">
                        Prototype proposal
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                      AI Confidence
                    </span>

                    <span className="font-bold text-[#a5555a]">
                      {recommendation.confidence.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[#eae6de] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#a5555a]"
                      style={{ width: scoreWidth }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#a5555a]">
                  fact_check
                </span>

                <h2 className="font-bold">Explainable AI</h2>
              </div>

              <div className="space-y-3">
                {recommendation.explanation.map(item => (
                  <div
                    key={item.label}
                    className="flex gap-3 p-3 rounded-xl bg-[#f5f1ea] border border-[#eae6de]"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        item.positive
                          ? 'text-[#4a7c59]'
                          : 'text-[#a5555a]'
                      }`}
                    >
                      {item.positive
                        ? 'check_circle'
                        : 'warning'}
                    </span>

                    <div>
                      <p className="text-xs font-bold">
                        {item.label}
                      </p>

                      <p className="text-[11px] text-[#4a4e4a] mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl border border-[#ead9ad] bg-[#fffaf0]">
                <p className="text-[10px] font-bold uppercase text-[#705c30]">
                  Missing / Non-identity Attributes
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {recommendation.missingAttributes.map(
                    attribute => (
                      <span
                        key={attribute}
                        className="px-2 py-1 rounded-lg bg-white border border-[#ead9ad] text-[10px] font-semibold"
                      >
                        {attribute}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#eae6de]">
              <h2 className="font-bold">
                Extracted Technical Attributes
              </h2>

              <p className="text-[11px] text-[#4a4e4a] mt-1">
                Attributes used by the matching and
                standardization pipeline.
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recommendation.attributes.map(attribute => (
                <div
                  key={attribute.label}
                  className="p-3 rounded-xl bg-[#f5f1ea] border border-[#e4e0d8]"
                >
                  <p className="text-[10px] font-bold text-[#4a4e4a]">
                    {attribute.label}
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {attribute.value}
                  </p>

                  <p className="mt-1 text-[10px] text-[#4a7c59] font-semibold">
                    AI confidence {attribute.confidence}%
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#eae6de]">
              <h2 className="font-bold">Original CPSE Records</h2>

              <p className="text-[11px] text-[#4a4e4a] mt-1">
                Original CPSE identity remains traceable.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0ece4]">
                  <tr>
                    <th className="px-5 py-3 font-bold">
                      CPSE
                    </th>

                    <th className="px-5 py-3 font-bold">
                      Original Code
                    </th>

                    <th className="px-5 py-3 font-bold">
                      Original Description
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recommendation.sourceDescriptions.map(
                    record => (
                      <tr
                        key={`${record.cpse}-${record.code}`}
                        className="border-b border-[#eae6de]"
                      >
                        <td className="px-5 py-3 font-bold">
                          {record.cpse}
                        </td>

                        <td className="px-5 py-3 font-mono text-[#4a7c59]">
                          {record.code}
                        </td>

                        <td className="px-5 py-3">
                          {record.description}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#e4e0d8] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#a5555a]">
                rate_review
              </span>

              <div>
                <h2 className="font-bold">
                  Human Validation
                </h2>

                <p className="text-[11px] text-[#4a4e4a]">
                  AI output requires human governance before
                  final mapping.
                </p>
              </div>
            </div>

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Reviewer comment / decision rationale..."
              className="w-full min-h-24 px-3 py-3 rounded-xl border border-[#e4e0d8] bg-[#f5f1ea] text-sm focus:outline-none focus:ring-2 focus:ring-[#a5555a]/20"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftDescription(
                      recommendation.standardizedDescription
                    );

                    setDraftCode(
                      recommendation.proposedNationalCode
                    );

                    setEditing(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#f0ece4] border border-[#e4e0d8] text-xs font-bold"
                >
                  Modify
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={saveModification}
                    className="px-4 py-2.5 rounded-xl bg-[#a5555a] text-white text-xs font-bold"
                  >
                    Save Modification
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#f0ece4] border border-[#e4e0d8] text-xs font-bold"
                  >
                    Cancel
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={reject}
                className="px-4 py-2.5 rounded-xl bg-[#f3d1d1] text-[#7b3338] text-xs font-bold"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={approve}
                className="px-4 py-2.5 rounded-xl bg-[#4a7c59] text-white text-xs font-bold"
              >
                Approve & Continue
              </button>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
};