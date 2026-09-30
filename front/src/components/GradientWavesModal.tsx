import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import GradientWaves from './GradientWaves';

export const GradientWavesModal: React.FC = () => {
  const { isWaveModalOpen, setIsWaveModalOpen } = useApp();

  const [activeTheme, setActiveTheme] = useState<'electricBlue' | 'reactbits' | 'maroon'>('electricBlue');
  const [speed, setSpeed] = useState<number>(0.4);
  const [amplitude, setAmplitude] = useState<number>(2.5);
  const [turbulence, setTurbulence] = useState<number>(20);
  const [swell, setSwell] = useState<number>(35);
  const [mouseInteraction, setMouseInteraction] = useState<boolean>(true);

  if (!isWaveModalOpen) return null;

  const horizonColor =
    activeTheme === 'maroon' ? '#1a080c' : '#0b0720';
  const waveColor =
    activeTheme === 'electricBlue'
      ? '#2225b7'
      : activeTheme === 'reactbits'
      ? '#b722b7'
      : '#a5555a';
  const crestColor = '#FFFFFF';
  const isDark = activeTheme !== 'maroon';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsWaveModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border ${
            isDark
              ? 'bg-[#0b0720] text-white border-blue-900/40'
              : 'bg-[#faf6f0] text-[#2e3230] border-[#e4e0d8]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-inherit/30">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-[#f0ece4] text-[#a5555a]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">waves</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base tracking-tight">
                    React Bits &lt;GradientWaves /&gt; Studio
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    WebGL2 + OGL
                  </span>
                </div>
                <p className="text-xs opacity-70">
                  Raymarched sine waves rolling toward a hazy horizon with real-time pointer parallax
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Palette Switcher */}
              <div className="flex items-center rounded-xl p-1 bg-black/20 text-xs">
                <button
                  onClick={() => setActiveTheme('electricBlue')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTheme === 'electricBlue'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'opacity-70 hover:opacity-100 text-white'
                  }`}
                  type="button"
                >
                  Electric Blue
                </button>
                <button
                  onClick={() => setActiveTheme('reactbits')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTheme === 'reactbits'
                      ? 'bg-purple-600 text-white shadow-xs font-bold'
                      : 'opacity-70 hover:opacity-100 text-white'
                  }`}
                  type="button"
                >
                  Cyber Magenta
                </button>
                <button
                  onClick={() => setActiveTheme('maroon')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTheme === 'maroon'
                      ? 'bg-rose-700 text-white shadow-xs font-bold'
                      : 'opacity-70 hover:opacity-100 text-white'
                  }`}
                  type="button"
                >
                  Maroon
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsWaveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-inherit opacity-75 hover:opacity-100 transition-opacity"
                type="button"
                aria-label="Close Modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Quick Param Toolbar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-black/5 border-b border-inherit/20 text-xs gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="opacity-75 font-mono text-[11px]">Speed ({speed.toFixed(2)}):</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={speed}
                  onChange={e => setSpeed(parseFloat(e.target.value))}
                  className="w-24 accent-[#a5555a]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="opacity-75 font-mono text-[11px]">Amplitude ({amplitude.toFixed(1)}):</span>
                <input
                  type="range"
                  min="1.0"
                  max="4.5"
                  step="0.2"
                  value={amplitude}
                  onChange={e => setAmplitude(parseFloat(e.target.value))}
                  className="w-24 accent-[#a5555a]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="opacity-75 font-mono text-[11px]">Turbulence ({turbulence}):</span>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={turbulence}
                  onChange={e => setTurbulence(parseFloat(e.target.value))}
                  className="w-20 accent-[#a5555a]"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={mouseInteraction}
                  onChange={e => setMouseInteraction(e.target.checked)}
                  className="accent-[#a5555a]"
                />
                Pointer Parallax
              </label>
            </div>

            <span className="text-[11px] font-mono opacity-70">
              {`horizon="${horizonColor}" wave="${waveColor}"`}
            </span>
          </div>

          {/* 600px Height Canvas Container as specified in prompt usage example */}
          <div
            style={{
              width: '100%',
              height: '560px',
              position: 'relative',
              backgroundColor: horizonColor,
            }}
            className="cursor-crosshair overflow-hidden"
          >
            <GradientWaves
              horizonColor={horizonColor}
              waveColor={waveColor}
              crestColor={crestColor}
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
              grain={true}
              grainIntensity={0.05}
            />

            {/* Overlaid Information */}
            <div className="absolute bottom-4 left-6 pointer-events-none flex flex-col gap-1 z-10">
              <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white text-xs font-mono border border-white/10 shadow-sm inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Raymarched Sine Plasma Waves</span>
                <span className="opacity-40">|</span>
                <span>Move cursor to steer camera</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
