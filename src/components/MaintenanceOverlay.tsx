import React from 'react';
import { AlertTriangle, Wrench, RefreshCw, EyeOff } from 'lucide-react';

interface MaintenanceOverlayProps {
  isClosed: boolean;
  closedMessage: string;
  isDeveloper: boolean;
  onReopenApp?: () => void;
  isVisitorPreviewMode?: boolean;
  onExitPreview?: () => void;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
  isClosed,
  closedMessage,
  isDeveloper,
  onReopenApp,
  isVisitorPreviewMode = false,
  onExitPreview,
}) => {
  // If app is not closed, don't show
  if (!isClosed) return null;

  // If developer is viewing, show a non-blocking top warning banner so developer can continue testing/working
  if (isDeveloper) {
    return (
      <div className="sticky top-0 z-50 bg-rose-950/90 border-b border-rose-500/50 px-4 py-2 text-xs flex items-center justify-between text-rose-200 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
          <span className="font-bold">App is CLOSED for visitors:</span>
          <span>"{closedMessage}"</span>
        </div>

        {onReopenApp && (
          <button
            onClick={onReopenApp}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reopen App Now</span>
          </button>
        )}
      </div>
    );
  }

  // For visitors: full-screen block with the exact requested message!
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      {isVisitorPreviewMode && onExitPreview && (
        <div className="absolute top-4 inset-x-0 flex justify-center z-50 px-4">
          <button
            onClick={onExitPreview}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-2xl shadow-amber-500/40"
          >
            <EyeOff className="w-4 h-4" />
            <span>Exit Visitor Preview & Return to Developer Mode</span>
          </button>
        </div>
      )}

      <div className="relative max-w-lg w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl shadow-rose-950/50 space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Temporary Maintenance</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {closedMessage || "Sorry, because our app is having problems and it is closing"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Our developers are currently resolving technical issues. Please check back shortly to explore the mods once we re-open.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition inline-flex items-center gap-2 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status & Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
