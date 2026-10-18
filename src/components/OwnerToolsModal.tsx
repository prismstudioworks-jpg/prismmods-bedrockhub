import React, { useState } from 'react';
import { BedrockAddon } from '../types/addon';
import { 
  X, Download, Upload, Trash2, Check, 
  AlertTriangle, Wrench, RefreshCw, EyeOff 
} from 'lucide-react';
import { SAMPLE_STARTER_ADDONS } from '../utils/storage';

interface OwnerToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  addons: BedrockAddon[];
  onImportAddons: (imported: BedrockAddon[]) => void;
  onClearAllAddons: () => void;
  onLoadSampleData: () => void;
  onExitDeveloperMode: () => void;
}

export const OwnerToolsModal: React.FC<OwnerToolsModalProps> = ({
  isOpen,
  onClose,
  addons,
  onImportAddons,
  onClearAllAddons,
  onLoadSampleData,
  onExitDeveloperMode,
}) => {
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(addons, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `prismmods-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMsg({ text: 'Backup JSON downloaded successfully!', type: 'success' });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportAddons(parsed);
          setMsg({ text: `Successfully imported ${parsed.length} addons!`, type: 'success' });
        } else {
          setMsg({ text: 'Invalid JSON format: expected an array of addons.', type: 'error' });
        }
      } catch (err) {
        setMsg({ text: 'Error parsing JSON file. Please check syntax.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/40 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Wrench className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Developer Options</h2>
              <p className="text-xs text-slate-400">Private mod management & backup controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}
          >
            {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Status stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total Add-ons</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{addons.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Creator Mode</div>
            <div className="text-xs font-semibold text-cyan-400 mt-1">Private to you</div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Data Backup & Restore
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleExportJSON}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-2.5"
            >
              <Download className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-left">
                <div>Export Backup JSON</div>
                <div className="text-[10px] text-slate-400 font-normal">Save all addons to file</div>
              </div>
            </button>

            <label className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <div>Import from JSON</div>
                <div className="text-[10px] text-slate-400 font-normal">Restore backup file</div>
              </div>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Addon Database Quick Controls */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Addon Management
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Load Starter Samples</div>
                <div className="text-[11px] text-slate-400">Populate sample Bedrock packs for testing</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLoadSampleData();
                  setMsg({ text: 'Loaded sample Bedrock pack successfully!', type: 'success' });
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
              >
                Load Samples
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-300">Clear All Addons</div>
                <div className="text-[11px] text-slate-400">Reset to completely clean empty list (0 addons)</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all addons? You can export a backup first.')) {
                    onClearAllAddons();
                    setMsg({ text: 'All addons cleared. Collection is now empty.', type: 'success' });
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Preview as Normal Member */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-200">Preview as Member</div>
            <div className="text-[11px] text-slate-400">Temporarily hide developer options to view what members see</div>
          </div>
          <button
            type="button"
            onClick={() => {
              onExitDeveloperMode();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Switch to Member View</span>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            Cancel / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
