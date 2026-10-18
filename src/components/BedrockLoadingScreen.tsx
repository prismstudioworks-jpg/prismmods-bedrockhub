import React, { useState, useEffect } from 'react';
import { AppStatusConfig } from '../types/addon';
import { AppLogo } from './AppLogo';
import { Sparkles, Shield, X } from 'lucide-react';

interface BedrockLoadingScreenProps {
  config: AppStatusConfig;
  isLoading: boolean;
  onFinishLoading: () => void;
  isPreview?: boolean;
  onClosePreview?: () => void;
}

const BEDROCK_TIPS = [
  'Building terrain...',
  'Loading Bedrock resource packs...',
  'Compiling custom behavior packs...',
  'Connecting to PrismMods Hub...',
  'Tip: Never dig straight down!',
  'Tip: Creepers are afraid of ocelots and cats.',
  'Tip: Netherite gear does not burn in lava.',
  'Tip: Use a smithing table to upgrade diamond gear.',
  'Tip: Sneak to safely traverse over magma blocks.',
  'Tip: Sleeping in the Nether or the End will cause an explosion!',
];

export const BedrockLoadingScreen: React.FC<BedrockLoadingScreenProps> = ({
  config,
  isLoading,
  onFinishLoading,
  isPreview = false,
  onClosePreview,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !isPreview) return;

    setProgress(0);
    setIsFadingOut(false);

    // Increment progress bar to simulate authentic Bedrock world loading
    const durationMs = (config.loadingScreenDuration || 5) * 1000;
    const stepSize = 100 / (durationMs / 180);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onFinishLoading) onFinishLoading();
            }, 500);
          }, 300);
          return 100;
        }
        return Math.min(100, prev + stepSize);
      });
    }, 180);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % BEDROCK_TIPS.length);
    }, 1200);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [isLoading, isPreview, onFinishLoading]);

  if (!isLoading && !isPreview) return null;

  const customPhoto = config.loadingScreenImageUrl;
  const title = config.loadingScreenTitle || 'PrismMods Bedrock Hub';
  const subtitle = config.loadingScreenSubtitle || 'Loading resources, behavior packs & terrain...';

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-between p-6 sm:p-10 select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#090d16' }}
    >
      {/* BACKGROUND IMAGE / PHOTO (CONFIGURED BY DEVELOPER - VISIBLE TO ALL VISITORS) */}
      {customPhoto ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={customPhoto}
            alt="Loading Screen Background"
            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.05]"
          />
          {/* Subtle gradient vignette to keep UI text & progress bar 100% crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>
      ) : (
        /* Default authentic Minecraft Bedrock dirt/stone mosaic background */
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Developer Preview Badge & Close Button */}
      {isPreview && (
        <div className="relative z-20 w-full flex items-center justify-between">
          <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Developer Mode: Loading Screen Preview</span>
          </div>

          {onClosePreview && (
            <button
              type="button"
              onClick={onClosePreview}
              className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition backdrop-blur-md flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Cancel / Go Back</span>
            </button>
          )}
        </div>
      )}

      {/* Top spacer if not preview */}
      {!isPreview && <div className="h-6" />}

      {/* Center Branding Area */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-xl mx-auto my-auto animate-fade-in">
        <div className="p-3 rounded-3xl bg-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-md">
          <AppLogo config={config} size="lg" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] font-minecraft">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/90 font-medium drop-shadow-md">
            {subtitle}
          </p>
        </div>

        {customPhoto && (
          <div className="px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/70 text-[10px] text-slate-300 backdrop-blur-md">
            Custom Developer Background Active
          </div>
        )}
      </div>

      {/* Bottom Area: Bedrock Progress Bar & Rotating Tips */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-3 pb-4">
        {/* Loading Tip */}
        <div className="text-center min-h-[20px]">
          <p className="text-xs text-slate-300 font-medium drop-shadow-sm font-basic transition-all duration-300">
            {BEDROCK_TIPS[currentTipIndex]}
          </p>
        </div>

        {/* Authentic Minecraft Bedrock Green Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-slate-950/90 rounded-md border-2 border-slate-700 overflow-hidden p-0.5 shadow-inner backdrop-blur-md">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-500 rounded-sm transition-all duration-200 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{progress === 100 ? 'Complete' : 'Loading...'}</span>
            <span className="font-bold text-emerald-400">{progress}%</span>
          </div>
        </div>

        {/* Skip Button for quick entry */}
        {!isPreview && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsFadingOut(true);
                setTimeout(onFinishLoading, 300);
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 text-[11px] font-semibold transition backdrop-blur-sm"
            >
              Skip Loading →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
