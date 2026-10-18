import React, { useState } from 'react';
import { MemberUser, DownloadHistoryItem, ThemeMode, UserRole, TextFontPreference } from '../types/addon';
import { 
  X, Moon, Sun, Globe, Download, User, LogOut, 
  Lock, Search, Check, Clock, ExternalLink, Trash2, 
  Sparkles, Smartphone, Shield, Calendar, ArrowRight, Type 
} from 'lucide-react';
import { WORLD_LANGUAGES, getTranslation } from '../utils/i18n';
import { UserRoleBadge } from './UserRoleBadge';

interface VisitorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: MemberUser | null;
  downloadHistory: DownloadHistoryItem[];
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
  onSignOut: () => void;
  onClearDownloadHistory: () => void;
  onOpenSignIn: () => void;
  role: UserRole;
  isAdmin: boolean;
  isOwner: boolean;
  ownerTagText?: string;
  ownerTagColor?: string;
  adminTagColor?: string;
  fontPreference: TextFontPreference;
  onToggleFont: (font: TextFontPreference) => void;
}

export const VisitorSettingsModal: React.FC<VisitorSettingsModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  downloadHistory,
  themeMode,
  onToggleTheme,
  currentLanguage,
  onSelectLanguage,
  onSignOut,
  onClearDownloadHistory,
  onOpenSignIn,
  role,
  isAdmin,
  isOwner,
  ownerTagText,
  ownerTagColor,
  adminTagColor,
  fontPreference,
  onToggleFont,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'theme' | 'font' | 'languages' | 'downloads'>('account');
  const [langSearch, setLangSearch] = useState('');

  if (!isOpen) return null;
  const filteredLanguages = WORLD_LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.region.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">
              {getTranslation('settings', currentLanguage)}
            </h2>
            <p className="text-xs text-slate-400">
              Personal device preferences & account details
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-800 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'account'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{getTranslation('accountDetails', currentLanguage)}</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'theme'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {themeMode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{getTranslation('themeMode', currentLanguage)}</span>
          </button>

          <button
            onClick={() => setActiveTab('font')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'font'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text Font</span>
          </button>

          <button
            onClick={() => setActiveTab('languages')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'languages'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{getTranslation('languageSelect', currentLanguage)}</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'downloads'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{getTranslation('downloadHistory', currentLanguage)}</span>
            {downloadHistory.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-purple-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {downloadHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* TAB 1: ACCOUNT DETAILS (SHOWN ONLY & UNCLICKABLE) */}
          {activeTab === 'account' && (
            <div className="space-y-4 select-none">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-slate-300">
                    {getTranslation('readOnlyAccount', currentLanguage)}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Non-editable
                </span>
              </div>

              {currentMember ? (
                /* Unclickable Account Card */
                <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 shadow-inner space-y-4 pointer-events-none cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl p-1 bg-slate-800 border-2 border-cyan-500/40 shrink-0">
                      <img
                        src={currentMember.avatar}
                        alt="Profile 1x1 Avatar"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-white">
                          {currentMember.displayName || currentMember.username}
                        </span>
                        <UserRoleBadge
                          role={isOwner ? 'owner' : isAdmin ? 'admin' : 'visitor'}
                          tagText={isOwner ? ownerTagText : isAdmin ? 'Admin' : 'Visitor'}
                          tagColor={isOwner ? ownerTagColor : isAdmin ? adminTagColor : undefined}
                          size="md"
                        />
                      </div>
                      <div className="text-xs font-mono text-cyan-400">
                        @{currentMember.username}
                      </div>
                      {currentMember.email && (
                        <div className="text-[11px] text-slate-400">
                          Email: <span className="text-slate-300">{currentMember.email}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400">
                        Account ID: <span className="font-mono text-slate-300">{currentMember.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Read-Only Grid Attributes - NO DEVICE FINGERPRINT */}
                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Account Role
                      </div>
                      <div className="font-semibold text-cyan-400 mt-0.5 truncate text-[11px]">
                        {isOwner ? 'Platform Owner' : isAdmin ? 'Hub Admin' : 'Community Member'}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Account Status
                      </div>
                      <div className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Active Member</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Member Since
                      </div>
                      <div className="text-slate-300 font-medium mt-0.5 flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(currentMember.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Platform
                      </div>
                      <div className="text-slate-300 font-medium mt-0.5 flex items-center gap-1.5 text-[11px]">
                        <Smartphone className="w-3 h-3 text-cyan-400" />
                        <span>{navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Desktop / Browser'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-sm">You are currently browsing as a Guest</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Sign in or create an account to leave reviews, earn custom badges, and customize your profile.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSignIn();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition inline-flex items-center gap-2"
                  >
                    <span>{getTranslation('signIn', currentLanguage)} / {getTranslation('logIn', currentLanguage)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Sign Out Action Button */}
              {currentMember && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{getTranslation('signOut', currentLanguage)}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WHITE OR DARK MODE TOGGLE (ONLY ON THEIR PHONE) */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                <span className="font-bold">Device Exclusive:</span> This theme setting applies only to your phone or browser, and does not affect any other visitor's display.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dark Mode Card */}
                <div
                  onClick={() => onToggleTheme('dark')}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${
                    themeMode === 'dark'
                      ? 'bg-slate-950 border-cyan-400 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    {themeMode === 'dark' && (
                      <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {getTranslation('darkMode', currentLanguage)}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Minecraft bedrock midnight aesthetic with neon cyber accents.
                    </p>
                  </div>
                </div>

                {/* Light / White Mode Card */}
                <div
                  onClick={() => onToggleTheme('light')}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${
                    themeMode === 'light'
                      ? 'bg-slate-100 text-slate-900 border-amber-500 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-600">
                      <Sun className="w-5 h-5" />
                    </div>
                    {themeMode === 'light' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${themeMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {getTranslation('lightMode', currentLanguage)}
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      Bright, clean white mode optimized for daytime readability on mobile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TEXT FONT (THE BASIC STYLE OR THE MINECRAFT STYLE FONT) */}
          {activeTab === 'font' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed">
                <span className="font-bold">Text Font Selection:</span> Visitors, admins, and owners can customize text font style across the app. Choose between the basic style or the authentic Minecraft style font.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Basic Style Font */}
                <div
                  onClick={() => onToggleFont('basic')}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${
                    fontPreference === 'basic'
                      ? 'bg-slate-950 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-cyan-400">
                      <Type className="w-5 h-5" />
                    </div>
                    {fontPreference === 'basic' && (
                      <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm font-basic">
                      The basic style
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-basic leading-relaxed">
                      Clean modern sans-serif typography with high legibility across mobile and desktop.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-200 font-basic">
                    Preview: "Aetheria: Elemental Magic & Relics v2.1"
                  </div>
                </div>

                {/* 2. Minecraft Style Font */}
                <div
                  onClick={() => onToggleFont('minecraft')}
                  className={`p-4 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${
                    fontPreference === 'minecraft'
                      ? 'bg-slate-950 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    {fontPreference === 'minecraft' && (
                      <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm font-minecraft">
                      The Minecraft style font
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-minecraft leading-relaxed">
                      Retro 8-bit blocky gaming font capturing the iconic Minecraft Bedrock look.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 font-minecraft">
                    Preview: "Aetheria: Elemental Magic & Relics v2.1"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LANGUAGES OF THE WORLD WITH INSTANT SWITCH */}
          {activeTab === 'languages' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder={getTranslation('searchLanguages', currentLanguage)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                Available Languages ({filteredLanguages.length}) • Click any language to switch instantly:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {filteredLanguages.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => onSelectLanguage(lang.code)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold shadow-md shadow-emerald-950/30'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{lang.flag}</span>
                        <div>
                          <div className="font-bold text-xs text-white">
                            {lang.nativeName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {lang.name} • {lang.region}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DOWNLOAD HISTORY */}
          {activeTab === 'downloads' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Addons you downloaded on this device ({downloadHistory.length})
                </span>
                {downloadHistory.length > 0 && (
                  <button
                    onClick={onClearDownloadHistory}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {downloadHistory.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
                  <Download className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs text-slate-400">
                    {getTranslation('noDownloadsYet', currentLanguage)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {downloadHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 uppercase font-bold">
                            {item.category}
                          </span>
                          {item.version && <span>{item.version}</span>}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.downloadedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {item.linkUrl && (
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                        >
                          <span>Re-download</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 shrink-0 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition shadow-md flex items-center gap-2"
          >
            <span>Cancel / Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
