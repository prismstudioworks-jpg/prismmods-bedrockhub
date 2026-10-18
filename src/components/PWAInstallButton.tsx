import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm hover:bg-cyan-500 transition"
      >
        <Download className="w-4 h-4" />
        Install App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
        >
          <Download className="w-4 h-4" />
          Install App
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowIOSGuide(false)}>
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white">Install on iPhone / iPad</h3>
              <p className="mt-2 text-sm text-slate-300">
                1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-800 py-2 text-sm font-bold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
