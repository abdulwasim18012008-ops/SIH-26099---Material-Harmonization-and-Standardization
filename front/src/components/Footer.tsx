import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-10 bg-[#eae6de]/70 backdrop-blur-sm z-30 flex items-center justify-between px-8 text-xs font-sans text-[#4a4e4a] border-t border-[#e4e0d8]">
      <div className="flex items-center gap-6">
        <span>
          Engine: <strong className="text-[#2e3230] font-semibold">v2.4.1-rc3 (SemVec-Bharat)</strong>
        </span>
        <span>
          Standard: <strong className="text-[#2e3230] font-semibold">ISO 8000 Master Data Quality</strong>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>
          Federated Nodes: <strong className="text-[#4a7c59] font-semibold">42 Active / 0 Disconnected</strong>
        </span>
        <span className="text-[11px] opacity-75">National CPSE Data Sovereign Grid</span>
      </div>
    </footer>
  );
};
