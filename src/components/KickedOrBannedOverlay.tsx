import React, { useState, useEffect } from 'react';
import { KickRecord } from '../types/addon';
import { ShieldAlert, UserX, Clock, Mail, AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';

interface KickedOrBannedOverlayProps {
  isBanned: boolean;
  kickRecord: KickRecord | null;
  onClearKicked: () => void;
}

export const KickedOrBannedOverlay: React.FC<KickedOrBannedOverlayProps> = ({
  isBanned,
  kickRecord,
  onClearKicked,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Live countdown timer for kick timeout duration
  useEffect(() => {
    if (!kickRecord) {
      setSecondsRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.ceil((kickRecord.expiresAt - now) / 1000));
      setSecondsRemaining(diffSec);
      if (diffSec <= 0) {
        onClearKicked();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [kickRecord, onClearKicked]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('prismstudioworks@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}m ${s < 10 ? '0' : ''}${s}s`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. BAN SCREEN - EXACT BAN MESSAGE REQUIRED:
  // "You have been banned, please contact the owner at prismstudioworks@gmail.com"
  if (isBanned) {
    return (
      <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-7 sm:p-8 text-center space-y-5 shadow-2xl shadow-rose-950/60">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-rose-400">
              Access Suspended
            </h2>
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm font-semibold leading-relaxed">
              You have been banned, please contact the owner at prismstudioworks@gmail.com
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-center">
            <a
              href="mailto:prismstudioworks@gmail.com?subject=PrismMods%20Unban%20Appeal"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Owner via Email</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied Email' : 'Copy Email'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. KICK WITH TIMEOUT DURATION & CUSTOM WARNING MESSAGE
  if (kickRecord) {
    const isExpired = secondsRemaining <= 0;

    return (
      <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 text-center space-y-4 shadow-2xl shadow-amber-950/50">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md">
            <UserX className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-amber-300">
              Session Timed Out
            </h3>
            <p className="text-xs text-slate-400">
              You were kicked and placed on temporary timeout by the developer.
            </p>
          </div>

          {/* Developer Custom Warning Message */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Developer Warning:</span>
            </div>
            <p className="text-xs text-amber-100 font-medium leading-relaxed">
              "{kickRecord.customMessage}"
            </p>
          </div>

          {/* Timeout Countdown Timer */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timeout Duration Remaining:</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-400 tracking-wider">
              {isExpired ? '0:00 (Timeout Ended)' : formatTime(secondsRemaining)}
            </div>
          </div>

          <button
            onClick={onClearKicked}
            disabled={!isExpired}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              isExpired
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isExpired ? 'Reconnect to App Now' : 'Please wait for timeout to expire'}</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
