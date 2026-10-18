import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

interface AppOpenedBannerProps {
  isOpenAlert: boolean;
  onDismiss: () => void;
}

export const AppOpenedBanner: React.FC<AppOpenedBannerProps> = ({ isOpenAlert, onDismiss }) => {
  if (!isOpenAlert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 text-center shadow-2xl shadow-emerald-950/50 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
          <Sparkles className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Welcome Back</span>
          </div>

          <h3 className="text-xl font-black text-white">
            The app is finally open, you can discover the mods now
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            All services and downloads have been restored. Jump in to discover the latest Bedrock addons, texture packs, and worlds!
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onDismiss}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
          >
            <span>Start Exploring Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
