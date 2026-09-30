import React, { useState } from 'react';
import GradientWaves from './GradientWaves';

export interface WavePreset {
  id: string;
  name: string;
  horizonColor: string;
  waveColor: string;
  crestColor: string;
  amplitude: number;
  speed: number;
  swell: number;
  turbulence: number;
  opacity: number;
  brightness: number;
  waveScale?: number;
  waveRatio?: number;
  tilt?: number;
  zoom?: number;
  height?: number;
  fogDepth?: number;
  grain?: boolean;
  grainIntensity?: number;
  parallaxStrength?: number;
}

const PRESETS: Record<string, WavePreset> = {
  electricBlue: {
    id: 'electricBlue',
    name: 'Electric Midnight (Requested)',
    horizonColor: '#0b0720',
    waveColor: '#2225b7',
    crestColor: '#FFFFFF',
    amplitude: 2.5,
    speed: 0.4,
    waveScale: 0.6,
    waveRatio: 0.9,
    swell: 35,
    turbulence: 20,
    tilt: 1.11,
    zoom: 1,
    height: 5.5,
    fogDepth: 15,
    opacity: 1,
    brightness: 1,
    grain: true,
    grainIntensity: 0.05,
    parallaxStrength: 0.5,
  },

  neon: {
    id: 'neon',
    name: 'React Bits Cyber',
    horizonColor: '#0b0720',
    waveColor: '#b722b7',
    crestColor: '#ffffff',
    amplitude: 2.5,
    speed: 0.4,
    waveScale: 0.6,
    waveRatio: 0.9,
    swell: 35,
    turbulence: 20,
    tilt: 1.11,
    zoom: 1,
    height: 5.5,
    fogDepth: 15,
    opacity: 1,
    brightness: 1,
    grain: true,
    grainIntensity: 0.05,
    parallaxStrength: 0.5,
  },

  maroon: {
    id: 'maroon',
    name: 'Maroon Pipeline',
    horizonColor: '#1a080c',
    waveColor: '#a5555a',
    crestColor: '#ffffff',
    amplitude: 2.6,
    speed: 0.38,
    waveScale: 0.6,
    waveRatio: 0.9,
    swell: 32,
    turbulence: 20,
    tilt: 1.12,
    zoom: 1.02,
    height: 5.3,
    fogDepth: 16,
    opacity: 0.95,
    brightness: 1.05,
    grain: true,
    grainIntensity: 0.04,
    parallaxStrength: 0.5,
  },

  forest: {
    id: 'forest',
    name: 'Bharat PSU Forest',
    horizonColor: '#0c1a10',
    waveColor: '#23733c',
    crestColor: '#ffffff',
    amplitude: 2.4,
    speed: 0.35,
    waveScale: 0.6,
    waveRatio: 0.9,
    swell: 28,
    turbulence: 18,
    tilt: 1.11,
    zoom: 1,
    height: 5.5,
    fogDepth: 15,
    opacity: 0.95,
    brightness: 1.05,
    grain: true,
    grainIntensity: 0.04,
    parallaxStrength: 0.5,
  },
};

/**
 * AnimatedBackground
 * Persistent full-screen WebGL Raymarched Wave motion background.
 * Provides rich fluid undulating sine-plasma waves, responsive cursor parallax,
 * atmospheric presence behind all pages while keeping maps and content intact.
 *
 * Also includes a subtle NCMH industrial skyline watermark at the bottom
 * of the application to reinforce the CPSE / industrial identity.
 */
export const AnimatedBackground: React.FC = () => {
  const [activePresetKey, setActivePresetKey] =
    useState<string>('electricBlue');

  const [isMotionActive, setIsMotionActive] =
    useState<boolean>(true);

  const [speedMultiplier, setSpeedMultiplier] =
    useState<number>(1.0);

  const [isControlPanelOpen, setIsControlPanelOpen] =
    useState<boolean>(false);

  const preset =
    PRESETS[activePresetKey] ||
    PRESETS.electricBlue;

  const effectiveSpeed =
    isMotionActive
      ? preset.speed * speedMultiplier
      : 0.0001;

  /* =========================================================
     STREAMING VECTOR DATA IMPULSES
     ========================================================= */

  const streamingLines = [
    {
      id: 1,
      top: '16%',
      width: '260px',
      duration: '3.2s',
      delay: '0s',
    },

    {
      id: 2,
      top: '34%',
      width: '340px',
      duration: '2.8s',
      delay: '0.9s',
    },

    {
      id: 3,
      top: '56%',
      width: '220px',
      duration: '3.6s',
      delay: '1.7s',
    },

    {
      id: 4,
      top: '74%',
      width: '300px',
      duration: '2.9s',
      delay: '0.4s',
    },

    {
      id: 5,
      top: '88%',
      width: '240px',
      duration: '3.4s',
      delay: '2.1s',
    },
  ];

  return (
    <>
      {/* =====================================================
         FULL-SCREEN WEBGL RAYMARCHED BACKGROUND LAYER
         ===================================================== */}

      <div
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-[-1]
          pointer-events-none
          overflow-hidden
          select-none
        "
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          overflow: 'hidden',
          backgroundColor: preset.horizonColor,
        }}
      >

        {/* ===================================================
           1. REACT BITS GRADIENT WAVES
           =================================================== */}

        <div
          className="
            absolute
            inset-0
            w-full
            h-full
            pointer-events-none
          "
        >

          <GradientWaves
            horizonColor={preset.horizonColor}
            waveColor={preset.waveColor}
            crestColor={preset.crestColor}
            speed={effectiveSpeed}
            amplitude={preset.amplitude}
            waveScale={preset.waveScale ?? 0.6}
            waveRatio={preset.waveRatio ?? 0.9}
            swell={preset.swell}
            turbulence={preset.turbulence}
            tilt={preset.tilt ?? 1.11}
            zoom={preset.zoom ?? 1}
            height={preset.height ?? 5.5}
            fogDepth={preset.fogDepth ?? 15}
            detail="medium"
            brightness={preset.brightness}
            opacity={preset.opacity}
            grain={preset.grain ?? true}
            grainIntensity={preset.grainIntensity ?? 0.05}
            mouseInteraction={isMotionActive}
            parallaxStrength={
              preset.parallaxStrength ?? 0.5
            }
            className="w-full h-full"
          />

        </div>


        {/* ===================================================
           2. SOFT VIGNETTE
           =================================================== */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
          "
          style={{
            background:
              'radial-gradient(circle at 50% 35%, transparent 35%, rgba(11, 7, 32, 0.25) 85%, rgba(11, 7, 32, 0.45) 100%)',
          }}
        />


        {/* ===================================================
           3. COSMIC VECTOR DOT GRID
           =================================================== */}

        <div
          className="
            absolute
            inset-0
            animate-pan-dot-grid
            opacity-25
            pointer-events-none
          "
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(140, 160, 255, 0.3) 1.2px, transparent 1.2px)',
            backgroundSize: '36px 36px',
            backgroundPosition: '0 0',
          }}
        />


        {/* ===================================================
           4. STREAMING VECTOR IMPULSE LINES
           =================================================== */}

        {isMotionActive && (

          <div
            className="
              absolute
              inset-0
              pointer-events-none
            "
          >

            {streamingLines.map(line => (

              <div
                key={line.id}
                className="
                  absolute
                  left-0
                  h-[2px]
                  animate-stream-line
                "
                style={{
                  top: line.top,
                  width: line.width,
                  animationDuration: line.duration,
                  animationDelay: line.delay,
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(34, 37, 183, 0.7) 40%, rgba(140, 180, 255, 0.9) 60%, transparent 100%)',
                  boxShadow:
                    '0 0 10px rgba(34, 37, 183, 0.5)',
                }}
              />

            ))}

          </div>

        )}


        {/* ===================================================
           5. NCMH INDUSTRIAL SKYLINE WATERMARK
           =================================================== */}

        <div
          aria-hidden="true"
          className="
            fixed
            inset-x-0
            bottom-0
            z-[0]
            pointer-events-none
            select-none
            flex
            justify-center
            overflow-hidden
          "
          style={{
            maskImage:
              'linear-gradient(to top, black 0%, black 72%, transparent 100%)',

            WebkitMaskImage:
              'linear-gradient(to top, black 0%, black 72%, transparent 100%)',
          }}
        >

          <img
            src="/ncmh-industrial-skyline.png"
            alt=""
            draggable={false}
            className="
              w-full
              max-w-[1600px]
              h-auto
              max-h-[230px]
              object-contain
              object-bottom
              opacity-[0.22]
              mix-blend-multiply
              select-none
              pointer-events-none
            "
          />

        </div>

      </div>


      {/* =====================================================
         FLOATING BACKGROUND MOTION CONTROLS HUD
         ===================================================== */}

      <div
        className="
          fixed
          bottom-4
          right-4
          z-40
          flex
          flex-col
          items-end
          gap-2
          text-xs
          font-sans
          select-none
        "
      >

        {/* ===================================================
           EXPANDED CONTROLS DRAWER
           =================================================== */}

        {isControlPanelOpen && (

          <div
            className="
              bg-[#faf6f0]/95
              backdrop-blur-xl
              p-4
              rounded-2xl
              shadow-xl
              border
              border-[#e4e0d8]
              flex
              flex-col
              gap-3
              w-72
              mb-1
              animate-in
              fade-in
              slide-in-from-bottom-2
              duration-200
            "
          >

            {/* Panel header */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                pb-2
                border-[#eae6de]
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >

                <span
                  className="
                    material-symbols-outlined
                    text-[#a5555a]
                    text-[18px]
                  "
                >
                  waves
                </span>

                <span
                  className="
                    font-serif
                    font-bold
                    text-[#2e3230]
                    text-sm
                  "
                >
                  Background Waves
                </span>

              </div>


              <button
                onClick={() =>
                  setIsControlPanelOpen(false)
                }
                className="
                  text-[#4a4e4a]
                  hover:text-[#2e3230]
                  p-1
                  rounded-lg
                  hover:bg-[#eae6de]
                "
                type="button"
                aria-label="Close Controls"
              >

                <span
                  className="
                    material-symbols-outlined
                    text-[16px]
                  "
                >
                  close
                </span>

              </button>

            </div>


            {/* =================================================
               MOTION TOGGLE
               ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  font-medium
                  text-[#4a4e4a]
                "
              >
                Motion Effect:
              </span>


              <button
                onClick={() =>
                  setIsMotionActive(
                    !isMotionActive
                  )
                }
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 text-[11px] ${
                  isMotionActive
                    ? 'bg-[#c8e8d0] text-[#2a6038] hover:bg-[#b2dec0]'
                    : 'bg-[#eae6de] text-[#4a4e4a] hover:bg-[#e4e0d8]'
                }`}
                type="button"
              >

                <span
                  className="
                    material-symbols-outlined
                    text-[14px]
                  "
                >
                  {isMotionActive
                    ? 'play_arrow'
                    : 'pause'}
                </span>

                {isMotionActive
                  ? 'Running'
                  : 'Paused'}

              </button>

            </div>


            {/* =================================================
               SPEED MULTIPLIER
               ================================================= */}

            <div
              className="
                space-y-1
              "
            >

              <div
                className="
                  flex
                  justify-between
                  text-[11px]
                  text-[#4a4e4a]
                "
              >

                <span>
                  Wave Speed:
                </span>

                <span
                  className="
                    font-bold
                    text-[#2e3230]
                  "
                >
                  {speedMultiplier.toFixed(1)}x
                </span>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >

                {[0.5, 1.0, 1.5, 2.0].map(
                  s => (

                    <button
                      key={s}
                      onClick={() => {

                        setSpeedMultiplier(s);

                        if (
                          !isMotionActive
                        ) {
                          setIsMotionActive(
                            true
                          );
                        }

                      }}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${
                        speedMultiplier === s &&
                        isMotionActive
                          ? 'bg-[#2225b7] text-white shadow-xs'
                          : 'bg-[#f0ece4] hover:bg-[#eae6de] text-[#4a4e4a]'
                      }`}
                      type="button"
                    >
                      {s}x
                    </button>

                  )
                )}

              </div>

            </div>


            {/* =================================================
               WAVE PALETTE PRESETS
               ================================================= */}

            <div
              className="
                space-y-1
              "
            >

              <span
                className="
                  text-[11px]
                  font-medium
                  text-[#4a4e4a]
                "
              >
                Color Palette:
              </span>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-1.5
                  pt-0.5
                "
              >

                {Object.entries(
                  PRESETS
                ).map(([key, p]) => (

                  <button
                    key={key}
                    onClick={() =>
                      setActivePresetKey(
                        key
                      )
                    }
                    className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                      activePresetKey === key
                        ? 'border-[#2225b7] bg-[#2225b7]/10 text-[#2225b7] font-bold'
                        : 'border-[#e4e0d8] bg-[#f5f1ea] hover:bg-[#eae6de] text-[#4a4e4a]'
                    }`}
                    type="button"
                  >

                    <span
                      className="
                        w-2.5
                        h-2.5
                        rounded-full
                        shrink-0
                        border
                        border-black/10
                      "
                      style={{
                        backgroundColor:
                          p.waveColor,
                      }}
                    />


                    <span
                      className="
                        truncate
                      "
                    >
                      {p.name.split(' ')[0]}
                    </span>

                  </button>

                ))}

              </div>

            </div>


            {/* =================================================
               INFO
               ================================================= */}

            <p
              className="
                text-[10px]
                text-[#4a4e4a]
                leading-tight
                pt-1
                border-t
                border-[#eae6de]
              "
            >
              ✨ Interactive mouse parallax enabled.
              Move your pointer anywhere across the
              webpage to tilt the wave horizon.
            </p>

          </div>

        )}


        {/* ===================================================
           COMPACT MOTION PILL TRIGGER
           =================================================== */}

        <button
          onClick={() =>
            setIsControlPanelOpen(
              !isControlPanelOpen
            )
          }
          className="
            flex
            items-center
            gap-2
            px-3.5
            py-2
            rounded-full
            bg-[#faf6f0]/95
            hover:bg-[#ffffff]
            text-[#2e3230]
            shadow-[0_2px_12px_rgba(11,7,32,0.25)]
            border
            border-[#e4e0d8]
            backdrop-blur-md
            transition-all
            hover:scale-105
            active:scale-95
            group
          "
          type="button"
          title="Customize Background Gradient Wave Motion"
        >

          {/* Status dot */}

          <span
            className="
              relative
              flex
              h-2
              w-2
            "
          >

            {isMotionActive && (

              <span
                className="
                  animate-ping
                  absolute
                  inline-flex
                  h-full
                  w-full
                  rounded-full
                  opacity-75
                "
                style={{
                  backgroundColor:
                    preset.waveColor,
                }}
              />

            )}


            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isMotionActive
                  ? ''
                  : 'bg-[#74796e]'
              }`}
              style={{
                backgroundColor:
                  isMotionActive
                    ? preset.waveColor
                    : undefined,
              }}
            />

          </span>


          {/* Wave icon */}

          <span
            className="
              material-symbols-outlined
              text-[16px]
              group-hover:rotate-12
              transition-transform
            "
            style={{
              color: preset.waveColor,
            }}
          >
            waves
          </span>


          {/* Label */}

          <span
            className="
              font-semibold
              text-xs
              text-[#2e3230]
            "
          >
            Background Waves
          </span>


          {/* Flow status */}

          <span
            className="
              text-[10px]
              text-[#2225b7]
              font-bold
              bg-[#eef1ff]
              px-1.5
              py-0.5
              rounded-full
              border
              border-[#2225b7]/20
            "
          >
            {isMotionActive
              ? `${speedMultiplier}x Flow`
              : 'Paused'}
          </span>

        </button>

      </div>
    </>
  );
};

export default AnimatedBackground;