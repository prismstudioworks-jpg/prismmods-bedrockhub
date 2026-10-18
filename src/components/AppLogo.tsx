import React from 'react';
import { AppStatusConfig } from '../types/addon';

interface AppLogoProps {
  config: AppStatusConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AppLogo: React.FC<AppLogoProps> = ({ config, className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  const iconType = config.appIconType || 'prism';

  if (iconType === 'custom' && config.customIconUrl) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-lg border border-cyan-500/30 ${sizeMap} ${className}`}>
        <img
          src={config.customIconUrl}
          alt="App Icon"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Pre-designed Bedrock themed icons
  switch (iconType) {
    case 'emerald':
      return (
        <div className={`relative rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 ${sizeMap} ${className}`}>
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-tr from-emerald-400 to-green-300 rotate-45 rounded-sm shadow-inner" />
          </div>
        </div>
      );
    case 'netherite':
      return (
        <div className={`relative rounded-xl bg-gradient-to-br from-slate-400 via-zinc-600 to-slate-900 p-0.5 shadow-lg shadow-purple-950/40 ${sizeMap} ${className}`}>
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-tr from-purple-400 via-slate-300 to-zinc-500 rotate-45 rounded-sm shadow-inner" />
          </div>
        </div>
      );
    case 'ender':
      return (
        <div className={`relative rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-600 to-indigo-700 p-0.5 shadow-lg shadow-purple-500/20 ${sizeMap} ${className}`}>
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-400 to-emerald-300 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-3 bg-slate-950 rounded-full" />
            </div>
          </div>
        </div>
      );
    case 'command':
      return (
        <div className={`relative rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 ${sizeMap} ${className}`}>
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <div className="w-4 h-4 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        </div>
      );
    case 'apple':
      return (
        <div className={`relative rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-yellow-500/20 ${sizeMap} ${className}`}>
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-200 animate-pulse" />
          </div>
        </div>
      );
    case 'prism':
    default:
      return (
        <div className={`relative rounded-xl bg-gradient-to-br from-cyan-500 via-teal-600 to-emerald-600 p-0.5 shadow-lg shadow-cyan-500/20 ${sizeMap} ${className}`}>
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <div className="w-5 h-5 bg-gradient-to-tr from-cyan-400 via-teal-300 to-emerald-400 rotate-45 rounded-sm shadow-inner" />
          </div>
        </div>
      );
  }
};
