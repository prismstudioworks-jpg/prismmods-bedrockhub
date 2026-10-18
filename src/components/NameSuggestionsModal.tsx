import React from 'react';
import { SUGGESTED_PRISM_NAMES } from '../types/addon';
import { Sparkles, Check, X, Shield, ArrowRight } from 'lucide-react';

interface NameSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onSelectTitle: (newTitle: string) => void;
  isOwner: boolean;
}

export const NameSuggestionsModal: React.FC<NameSuggestionsModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  onSelectTitle,
  isOwner,
}) => {
  const [customInput, setCustomInput] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">PrismMods Name Suggestions</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Curated name options featuring <span className="text-cyan-400 font-semibold">PrismMods</span> tailored for Minecraft Bedrock creators.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Title */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Currently Active Name</span>
            <div className="text-base font-bold text-cyan-300">{currentTitle}</div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Active
          </span>
        </div>

        {/* Suggested List */}
        <div className="mt-4 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Best Brand Combinations
          </div>

          {SUGGESTED_PRISM_NAMES.map((item) => {
            const isSelected = currentTitle.toLowerCase() === item.name.toLowerCase();
            return (
              <div
                key={item.name}
                onClick={() => {
                  onSelectTitle(item.name);
                }}
                className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-800/40 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition">
                      {item.name}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs text-cyan-400 font-medium">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-400">{item.subtitle}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>

                <button
                  type="button"
                  className={`shrink-0 ml-4 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-700/60 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300'
                  }`}
                >
                  {isSelected ? 'Applied' : 'Use Name'}
                  {!isSelected && <ArrowRight className="w-3 h-3" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Custom Name Input */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Or Type Your Custom PrismMods Variant
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. PrismMods Bedrock Edition"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => {
                if (customInput.trim()) {
                  onSelectTitle(customInput.trim());
                  setCustomInput('');
                }
              }}
              disabled={!customInput.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition"
            >
              Apply
            </button>
          </div>
        </div>


        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Cancel / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
