import React, { useState } from 'react';
import { 
  Sparkles, Plus, Settings, Bookmark, Wrench, 
  LogIn, LogOut, User, Eye, EyeOff, Radio, 
  Crown, Scroll, Moon, Sun, Lock 
} from 'lucide-react';
import { MemberUser, AppStatusConfig, OwnerLiveConfig, ThemeMode } from '../types/addon';
import { AppLogo } from './AppLogo';
import { UserRoleBadge } from './UserRoleBadge';
import { PWAInstallButton } from './PWAInstallButton';
import { getDeviceId, getAdminTagColor } from '../utils/storage';
import { getTranslation } from '../utils/i18n';

interface HeaderProps {
  brandTitle: string;
  onOpenNameSuggestions: () => void;
  isDeveloper: boolean;
  isVisitorPreviewMode: boolean;
  onToggleVisitorPreview: () => void;
  onToggleDeveloperSecret: () => void;
  onOpenNewAddonModal: () => void;
  onOpenDeveloperTools: () => void;
  bookmarkedCount: number;
  showOnlyBookmarks: boolean;
  onToggleBookmarksFilter: () => void;
  currentMember: MemberUser | null;
  onOpenSignIn: () => void;
  onSignOut: () => void;
  appStatus: AppStatusConfig;
  isAdmin: boolean;
  onOpenLiveStatus: () => void;
  onlineVisitorsCount: number;
  ownerConfig: OwnerLiveConfig;
  onOpenRules: () => void;
  onOpenVisitorSettings: () => void;
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  currentLanguage: string;
}

export const Header: React.FC<HeaderProps> = ({
  brandTitle,
  onOpenNameSuggestions,
  isDeveloper,
  isVisitorPreviewMode,
  onToggleVisitorPreview,
  onToggleDeveloperSecret,
  onOpenNewAddonModal,
  onOpenDeveloperTools,
  bookmarkedCount,
  showOnlyBookmarks,
  onToggleBookmarksFilter,
  currentMember,
  onOpenSignIn,
  onSignOut,
  appStatus,
  isAdmin,
  onOpenLiveStatus,
  onlineVisitorsCount,
  ownerConfig,
  onOpenRules,
  onOpenVisitorSettings,
  themeMode,
  onToggleTheme,
  currentLanguage,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  const handleLogoSecretClick = () => {
    const next = clickCount + 1;
    if (next >= 5) {
      setClickCount(0);
      onToggleDeveloperSecret();
    } else {
      setClickCount(next);
      setTimeout(() => setClickCount(0), 2000);
    }
  };

  const myId = getDeviceId();
  const adminTagColor = getAdminTagColor(myId);

  // Can add add-on if owner (and not previewing visitor view) OR if promoted to Admin
  const canAddAddons = (!isVisitorPreviewMode && isDeveloper) || (!isVisitorPreviewMode && isAdmin);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      {/* 👁️ VISITOR PREVIEW DOCK (ONLY Developer sees this to toggle back!) */}
      {isVisitorPreviewMode && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/60 px-4 py-1.5 text-xs flex items-center justify-between text-amber-200 shadow-md">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold">Visitor Preview Active:</span>
            <span className="hidden sm:inline text-slate-300">
              You are seeing the app exactly as visitors see it (developer options hidden).
            </span>
          </div>

          <button
            onClick={onToggleVisitorPreview}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow shadow-amber-500/20"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Exit Preview & Return to Developer Mode</span>
          </button>
        </div>
      )}

      {/* Discrete Developer Ribbon (Visible only in developer mode when NOT in visitor preview) */}
      {isDeveloper && !isVisitorPreviewMode && (
        <div className="bg-slate-900 border-b border-cyan-500/30 px-4 py-1 text-xs flex items-center justify-between text-cyan-300">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Developer Workshop</span>
            <span className="hidden sm:inline text-slate-400">
              • App is {appStatus.isClosed ? '🔴 CLOSED' : '🟢 OPEN'}
            </span>
            <UserRoleBadge
              role="owner"
              tagText={ownerConfig.tagText}
              tagColor={ownerConfig.tagColor}
              customLogoUrl={ownerConfig.customLogoUrl}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Visitor Preview Button */}
            <button
              onClick={onToggleVisitorPreview}
              className="px-2.5 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-medium transition flex items-center gap-1.5 shadow-sm"
              title="Preview what visitors see"
            >
              <Eye className="w-3 h-3" />
              <span>Visitor Preview</span>
            </button>

            <button
              onClick={onOpenDeveloperTools}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-medium transition flex items-center gap-1"
            >
              <Wrench className="w-3 h-3" />
              <span>Developer Options</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div 
            className="relative group cursor-pointer select-none" 
            onClick={handleLogoSecretClick}
            title={isDeveloper ? 'Developer Mode Active' : undefined}
          >
            <AppLogo config={appStatus} size="md" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                {brandTitle}
              </span>
              <button
                type="button"
                onClick={onOpenNameSuggestions}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition flex items-center gap-1"
                title="View best name suggestions with PrismMods"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Names</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {getTranslation('subtitle', currentLanguage)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
          {/* 📡 Live Status Button for visitors and everyone */}
          <button
            onClick={onOpenLiveStatus}
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
            title="View live community status and online members"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">{getTranslation('status', currentLanguage)}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {onlineVisitorsCount}
            </span>
          </button>

          {/* 📜 Rules Button on top (Only add the community rules with like this 📜 on the top, no other community rules button except '📜') */}
          <button
            onClick={onOpenRules}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-base leading-none transition shadow-sm hover:scale-105 active:scale-95"
            title="Community Rules"
            aria-label="Community Rules"
          >
            <span>📜</span>
          </button>

          {/* ⚙️ Visitor & Member Settings Modal Button */}
          <PWAInstallButton />
          
          <button
            onClick={onOpenVisitorSettings}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
            title="Open Settings (Accounts, Languages, Downloads, Theme)"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{getTranslation('settings', currentLanguage)}</span>
          </button>

          {/* 🌓 Quick Dark/Light Mode Phone Toggle */}
          <button
            onClick={() => onToggleTheme(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition"
            title={`Switch to ${themeMode === 'dark' ? 'White / Light' : 'Dark'} mode (Only on your device)`}
          >
            {themeMode === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Bookmarks Toggle */}
          <button
            onClick={onToggleBookmarksFilter}
            className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              showOnlyBookmarks
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Filter saved favorite addons"
          >
            <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-rose-400' : ''}`} />
            <span className="hidden sm:inline">{getTranslation('saved', currentLanguage)}</span>
            {bookmarkedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                {bookmarkedCount}
              </span>
            )}
          </button>

          {/* Member Authentication Status */}
          {currentMember ? (
            <div className="relative">
              <button
                onClick={() => setShowMemberMenu(!showMemberMenu)}
                className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 flex items-center gap-2 transition"
              >
                <img
                  src={currentMember.avatar}
                  alt={currentMember.username}
                  className="w-6 h-6 rounded-lg object-cover bg-slate-800"
                />
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                  {currentMember.username}
                </span>
                {/* Admin tag if user was promoted to admin */}
                {isAdmin && !isDeveloper && (
                  <UserRoleBadge
                    role="admin"
                    tagText="Admin"
                    tagColor={adminTagColor}
                    size="sm"
                  />
                )}
              </button>

              {showMemberMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fade-in text-slate-200"
                  onClick={() => setShowMemberMenu(false)}
                >
                  <div className="p-2 border-b border-slate-800 space-y-1">
                    <div className="font-bold text-white truncate">{currentMember.displayName || currentMember.username}</div>
                    <div className="text-[11px] text-cyan-400 font-mono">@{currentMember.username}</div>
                    {isDeveloper ? (
                      <UserRoleBadge
                        role="owner"
                        tagText={ownerConfig.tagText}
                        tagColor={ownerConfig.tagColor}
                        customLogoUrl={ownerConfig.customLogoUrl}
                        size="sm"
                      />
                    ) : isAdmin ? (
                      <UserRoleBadge
                        role="admin"
                        tagText="Admin"
                        tagColor={adminTagColor}
                        size="sm"
                      />
                    ) : (
                      <UserRoleBadge role="visitor" tagText="Visitor" size="sm" />
                    )}
                  </div>

                  <button
                    onClick={onOpenVisitorSettings}
                    className="w-full mt-1 p-2 rounded-xl text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{getTranslation('settings', currentLanguage)} & {getTranslation('accountDetails', currentLanguage)}</span>
                  </button>

                  <button
                    onClick={onSignOut}
                    className="w-full mt-1 p-2 rounded-xl text-left text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{getTranslation('signOut', currentLanguage)}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-cyan-500/30 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>{getTranslation('signIn', currentLanguage)}</span>
            </button>
          )}

          {/* Add Add-on button (Developer OR Admin can add add-ons) */}
          {canAddAddons && (
            <button
              onClick={onOpenNewAddonModal}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">{getTranslation('addAddon', currentLanguage)}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
