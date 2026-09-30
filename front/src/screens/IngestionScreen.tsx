import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { portalApi } from '../services/apiClient';
import { useApp } from '../context/AppContext';

export const IngestionScreen: React.FC = () => {
  const { showToast, setActiveScreen } = useApp();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleSelectedFile = (file: File | undefined) => {
    if (!file) return;

    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.json'];
    const fileName = file.name.toLowerCase();

    const isSupported = allowedExtensions.some(extension =>
      fileName.endsWith(extension)
    );

    const maxSizeBytes = 250 * 1024 * 1024;

    if (!isSupported) {
      showToast(
        'Unsupported file type. Please select CSV, XLSX, XLS, or JSON.',
        'error'
      );
      return;
    }

    if (file.size > maxSizeBytes) {
      showToast(
        'File is larger than the 250 MB upload limit.',
        'error'
      );
      return;
    }

    setSelectedFile(file);
    setResult(null);

    showToast(
      `${file.name} selected and ready for AI analysis.`,
      'success'
    );
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleSelectedFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (
  event: React.DragEvent<HTMLLabelElement>
) => {
    event.preventDefault();
    setIsDragging(false);

    handleSelectedFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a material master file first.', 'error');
      return;
    }

    try {
      setIsUploading(true);
      setResult(null);

      showToast(
        'Uploading material master and running AI analysis...',
        'info'
      );

      const response = await portalApi.uploadMaterials(selectedFile);

      setResult(response);

      showToast(
        'Materials uploaded and AI analysis completed successfully.',
        'success'
      );
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : 'Material upload or AI analysis failed.',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatConfidence = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue)) {
      return numericValue <= 1
        ? `${(numericValue * 100).toFixed(1)}%`
        : `${numericValue.toFixed(1)}%`;
    }

    return String(value);
  };

  const getGroups = () => {
    const aiAnalysis = result?.ai_analysis;

    if (!aiAnalysis) {
      return [];
    }

    if (Array.isArray(aiAnalysis)) {
      return aiAnalysis;
    }

    if (Array.isArray(aiAnalysis.groups)) {
      return aiAnalysis.groups;
    }

    if (Array.isArray(aiAnalysis.validation_queue)) {
      return aiAnalysis.validation_queue;
    }

    if (aiAnalysis.group_id) {
      return [aiAnalysis];
    }

    return [];
  };

  const groups = getGroups();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full pb-16"
    >
      {/* Header */}
      <div className="bg-[#f0ece4] rounded-2xl p-6 mb-8 shadow-sm border border-[#e4e0d8]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#4a7c59] text-white">
              Stage 01
            </span>

            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#2e3230] tracking-tight mt-2">
              Material Ingestion & AI Analysis
            </h1>

            <p className="text-sm text-[#4a4e4a] max-w-2xl mt-2 leading-relaxed">
              Upload CPSE material master data. The backend stores the
              original records, runs the integrated AI engine, creates
              national material recommendations, mappings and audit logs.
            </p>
          </div>

          <div className="bg-[#f5f1ea] rounded-xl px-4 py-3 border border-[#e4e0d8]">
            <div className="text-[10px] uppercase tracking-wider text-[#4a4e4a] font-bold">
              Backend
            </div>
            <div className="text-sm font-bold text-[#4a7c59] mt-1">
              FastAPI :8002
            </div>
            <div className="text-[10px] text-[#4a4e4a] mt-1">
              AI Engine Connected
            </div>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-[#f0ece4] p-6 rounded-2xl shadow-sm border border-[#e4e0d8]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
              Upload Material Master
            </h2>

            <p className="text-xs text-[#4a4e4a] mt-1">
              Supported: CSV, XLSX, XLS and JSON
            </p>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#eae6de] text-[#4a4e4a] rounded-lg border border-[#e4e0d8]">
            Max 250 MB
          </span>
        </div>

        <input
          id="material-file"
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <label
          htmlFor="material-file"
          onDragOver={event => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`group relative rounded-xl p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed ${
            isDragging
              ? 'border-[#4a7c59] bg-[#c8e8d0]/20'
              : 'border-[#c4c8bc] bg-white/80 hover:bg-white'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#eae6de] flex items-center justify-center text-[#4a7c59] mb-4">
            <span className="material-symbols-outlined text-[30px]">
              cloud_upload
            </span>
          </div>

          <p className="text-sm font-bold text-[#2e3230] mb-1">
            Drag & drop your material master here
          </p>

          <p className="text-xs text-[#4a4e4a] max-w-md">
            Or click to select a CPSE material master file from your computer.
          </p>

          {selectedFile && (
            <div className="w-full max-w-xl mt-5 rounded-xl border border-[#c8e8d0] bg-[#c8e8d0]/30 px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#4a7c59]">
                  description
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#2e3230] truncate">
                    {selectedFile.name}
                  </p>

                  <p className="text-[10px] text-[#4a4e4a] mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
        </label>

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-5 py-2.5 rounded-xl bg-[#4a7c59] hover:bg-[#4a7c59]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isUploading ? 'progress_activity' : 'auto_awesome'}
            </span>

            {isUploading
              ? 'Uploading & Analyzing...'
              : 'Upload & Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* Result Summary */}
      {result && (
        <div className="mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f0ece4] p-5 rounded-2xl border border-[#e4e0d8]">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                Records Created
              </p>
              <p className="text-3xl font-bold text-[#2e3230] mt-2">
                {result.records_created ?? 0}
              </p>
            </div>

            <div className="bg-[#f0ece4] p-5 rounded-2xl border border-[#e4e0d8]">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                National Materials
              </p>
              <p className="text-3xl font-bold text-[#4a7c59] mt-2">
                {result.national_materials_created?.length ?? 0}
              </p>
            </div>

            <div className="bg-[#f0ece4] p-5 rounded-2xl border border-[#e4e0d8]">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                Mappings Created
              </p>
              <p className="text-3xl font-bold text-[#705c30] mt-2">
                {result.mappings_created?.length ?? 0}
              </p>
            </div>

            <div className="bg-[#f0ece4] p-5 rounded-2xl border border-[#e4e0d8]">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#4a4e4a]">
                Audit Logs
              </p>
              <p className="text-3xl font-bold text-[#2e3230] mt-2">
                {result.audit_logs_created?.length ?? 0}
              </p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-[#f0ece4] p-6 rounded-2xl border border-[#e4e0d8] mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif font-semibold text-lg text-[#2e3230]">
                  AI Recommendations
                </h2>

                <p className="text-xs text-[#4a4e4a] mt-1">
                  Generated by the integrated backend AI engine
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#c8e8d0] text-[#2a6038] text-[10px] font-bold">
                AI COMPLETE
              </span>
            </div>

            {groups.length === 0 ? (
              <div className="rounded-xl bg-[#f5f1ea] border border-[#e4e0d8] p-5 text-sm text-[#4a4e4a]">
                The upload completed, but the AI response did not contain
                displayable recommendation groups.
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group: any, index: number) => {
                  const recommendation =
                    group?.ai_recommendation ?? {};

                  const nationalCode =
                    recommendation.recommended_national_code ??
                    recommendation.national_code ??
                    group?.recommended_national_code ??
                    group?.national_code ??
                    'N/A';

                  const description =
                    recommendation.standardized_description ??
                    recommendation.standard_description ??
                    group?.standardized_description ??
                    group?.standard_description ??
                    'N/A';

                  const confidence =
                    recommendation.confidence ??
                    group?.confidence ??
                    group?.national_code_confidence;

                  const matchType =
                    group?.match_type ??
                    recommendation.match_type ??
                    'AI_RECOMMENDED';

                  const explanation =
                    recommendation.explanation ??
                    group?.explanation ??
                    'No explanation returned by the AI engine.';

                  const members = Array.isArray(group?.members)
                    ? group.members
                    : [];

                  return (
                    <div
                      key={index}
                      className="rounded-xl bg-white border border-[#e4e0d8] p-5"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                            National Code
                          </p>

                          <p className="font-mono font-bold text-[#2e3230] mt-1">
                            {nationalCode}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                            Match Type
                          </p>

                          <p className="font-bold text-[#705c30] mt-1">
                            {matchType}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                            Confidence
                          </p>

                          <p className="font-bold text-[#4a7c59] mt-1">
                            {formatConfidence(confidence)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                            Materials in Group
                          </p>

                          <p className="font-bold text-[#2e3230] mt-1">
                            {members.length}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#eae6de]">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                          Standardized Description
                        </p>

                        <p className="text-sm font-semibold text-[#2e3230] mt-1">
                          {description}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#eae6de]">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a]">
                          AI Explanation
                        </p>

                        <p className="text-xs text-[#4a4e4a] mt-1 leading-relaxed">
                          {explanation}
                        </p>
                      </div>

                      {members.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#eae6de]">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a4e4a] mb-2">
                            Group Members
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {members.map(
                              (member: any, memberIndex: number) => (
                                <span
                                  key={memberIndex}
                                  className="px-2.5 py-1 rounded-lg bg-[#f5f1ea] border border-[#e4e0d8] text-[11px] font-mono text-[#2e3230]"
                                >
                                  {member.material_id ??
                                    member.original_code ??
                                    `Material ${memberIndex + 1}`}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-end mt-5">
            <button
              type="button"
              onClick={() => setActiveScreen('verification')}
              className="px-5 py-2.5 rounded-xl bg-[#2e3230] hover:bg-[#202321] text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              Continue to Human Verification
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};