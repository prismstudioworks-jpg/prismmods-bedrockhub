import React from 'react';
import { CommunityRule } from '../types/addon';
import { Scroll, Shield, CheckCircle2, X } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: CommunityRule[];
  currentLang?: string;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  currentLang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[90vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {getTranslation('communityRulesTitle', currentLang)}
              </h2>
              <p className="text-xs text-slate-400">
                Official guidelines set by the owner & developer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="py-4 space-y-3 overflow-y-auto pr-1 flex-1">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Please follow these rules to ensure a safe, fun Minecraft Bedrock community for all players.
            </span>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No rules posted yet.
            </div>
          ) : (
            rules.map((rule, index) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-sm text-slate-100">
                    {rule.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enforced by PrismMods moderation</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            Cancel / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
