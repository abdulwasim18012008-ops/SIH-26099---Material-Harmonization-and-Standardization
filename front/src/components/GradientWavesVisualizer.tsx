import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GradientWaves from './GradientWaves';

export interface GradientWavesVisualizerProps {
  className?: string;
}

export const GradientWavesVisualizer: React.FC<GradientWavesVisualizerProps> = ({ className = '' }) => {
  const [preset, setPreset] = useState<'maroon' | 'reactbits' | 'mhi'>('maroon');
  const [speed, setSpeed] = useState<number>(0.4);
  const [amplitude, setAmplitude] = useState<number>(2.5);
  const [turbulence, setTurbulence] = useState<number>(20);
  const [swell, setSwell] = useState<number>(35);
  const [mouseInteraction, setMouseInteraction] = useState<boolean>(true);
  const [grain, setGrain] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);

  const getColors = () => {
    switch (preset) {
      case 'reactbits':
        return {
          horizonColor: '#0b0720',
          waveColor: '#b722b7',
          crestColor: '#FFFFFF',
          bg: '#0b0720',
          badgeText: 'React Bits Default',
        };
      case 'mhi':
        return {
          horizonColor: '#f5f1ea',
          waveColor: '#4a7c59',
          crestColor: '#c8e8d0',
          bg: '#f0ece4',
          badgeText: 'MHI Forest & Sage',
        };
      case 'maroon':
      default:
        return {
          horizonColor: '#f7ece9',
          waveColor: '#a5555a',
          crestColor: '#FFFFFF',
          bg: '#f7ece9',
          badgeText: 'Pipeline Maroon & Cream',
        };
    }
  };

  const currentColors = getColors();

  return (
    <div
      className={`rounded-2xl border border-[#e4e0d8] overflow-hidden shadow-sm transition-all duration-300 ${
        preset === 'reactbits' ? 'bg-[#0b0720] text-white border-purple-900/40' : 'bg-[#f0ece4] text-[#2e3230]'
      } ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-inherit/40 gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              preset === 'reactbits' ? 'bg-purple-900/60 text-purple-200' : 'bg-[#eae6de] text-[#a5555a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">waves</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm tracking-tight">
                Raymarched Vector Wavefield
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  preset === 'reactbits'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-[#a5555a]/10 text-[#a5555a] border border-[#a5555a]/20'
                }`}
              >
                ogl WebGL2
              </span>
            </div>
            <p className="text-[11px] opacity-70">
              Interactive 3D sine-plasma simulation (React Bits &lt;GradientWaves /&gt;)
            </p>
          </div>
        </div>

        {/* Action Buttons & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg p-0.5 bg-black/5 dark:bg-white/10 text-xs">
            <button
              onClick={() => setPreset('maroon')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                preset === 'maroon'
                  ? 'bg-white text-[#a5555a] shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              type="button"
            >
              Maroon
            </button>
            <button
              onClick={() => setPreset('reactbits')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                preset === 'reactbits'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              type="button"
            >
              React Bits
            </button>
            <button
              onClick={() => setPreset('mhi')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                preset === 'mhi'
                  ? 'bg-white text-[#4a7c59] shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              type="button"
            >
              Forest
            </button>
          </div>

          <button
            onClick={() => setShowControls(!showControls)}
            className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 transition-all border ${
              showControls
                ? 'bg-[#a5555a] text-white border-[#a5555a]'
                : 'bg-black/5 hover:bg-black/10 border-transparent opacity-80'
            }`}
            type="button"
            title="Toggle Shader Parameters"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            Controls
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-inherit opacity-80 hover:opacity-100 transition-opacity"
            type="button"
            title={isExpanded ? 'Collapse Height' : 'Expand to Full Height'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExpanded ? 'close_fullscreen' : 'open_in_full'}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar (Collapsible) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-inherit/30 px-5 py-3 bg-black/5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="opacity-75 font-mono text-[11px]">Speed:</span>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                className="w-20 accent-[#a5555a]"
              />
              <span className="font-mono text-[11px] w-8">{speed.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="opacity-75 font-mono text-[11px]">Amplitude:</span>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={amplitude}
                onChange={e => setAmplitude(parseFloat(e.target.value))}
                className="w-20 accent-[#a5555a]"
              />
              <span className="font-mono text-[11px] w-8">{amplitude.toFixed(1)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="opacity-75 font-mono text-[11px]">Turbulence:</span>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={turbulence}
                onChange={e => setTurbulence(parseFloat(e.target.value))}
                className="w-20 accent-[#a5555a]"
              />
              <span className="font-mono text-[11px] w-6">{turbulence}</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={mouseInteraction}
                  onChange={e => setMouseInteraction(e.target.checked)}
                  className="accent-[#a5555a]"
                />
                Mouse Parallax
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={grain}
                  onChange={e => setGrain(e.target.checked)}
                  className="accent-[#a5555a]"
                />
                Film Grain
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The GradientWaves Canvas Area */}
      <div
        style={{
          width: '100%',
          height: isExpanded ? '600px' : '320px',
          position: 'relative',
          backgroundColor: currentColors.bg,
        }}
        className="transition-[height] duration-300 ease-in-out cursor-crosshair group overflow-hidden"
      >
        <GradientWaves
          horizonColor={currentColors.horizonColor}
          waveColor={currentColors.waveColor}
          crestColor={currentColors.crestColor}
          speed={speed}
          amplitude={amplitude}
          waveScale={0.6}
          waveRatio={0.9}
          swell={swell}
          turbulence={turbulence}
          tilt={1.11}
          zoom={1.0}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1.0}
          opacity={1.0}
          mouseInteraction={mouseInteraction}
          parallaxStrength={0.5}
          grain={grain}
          grainIntensity={0.05}
        />

        {/* Live Floating Telemetry Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-mono border border-white/10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>WebGL2 Raymarcher active</span>
            <span className="opacity-50">|</span>
            <span>70 steps/ray</span>
          </div>

          {mouseInteraction && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs text-white/80 text-[10px] font-sans">
              <span className="material-symbols-outlined text-[13px]">mouse</span>
              Move cursor over wave field to steer camera parallax
            </div>
          )}
        </div>

        {/* Bottom Right Theme Indicator */}
        <div className="absolute bottom-3 right-3 pointer-events-none z-10 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[11px] font-mono border border-white/10">
            {currentColors.badgeText}
          </span>
        </div>
      </div>
    </div>
  );
};
