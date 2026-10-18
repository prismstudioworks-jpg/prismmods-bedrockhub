import React, { useState, useEffect, useRef } from 'react';
import { VisitorPresence, OwnerLiveConfig, MemberUser } from '../types/addon';
import { 
  X, Radio, Crown, Wrench, User, Sparkles, 
  Check, Palette, Upload, Image as ImageIcon, Shield, Smartphone, Monitor 
} from 'lucide-react';
import { 
  getVisitorsList, getOwnerLiveConfig, setOwnerLiveConfig, 
  getDeviceId, isVisitorAdmin, getAdminTagColor, setAdminTagColor,
  setVisitorAdminRole 
} from '../utils/storage';
import { UserRoleBadge } from './UserRoleBadge';
import { processImageFile } from '../utils/imageHelper';

interface LiveStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  currentMember: MemberUser | null;
}

const PRESET_COLORS = [
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Cyan Neon', hex: '#06b6d4' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Purple Amethyst', hex: '#a855f7' },
  { name: 'Rose Red', hex: '#f43f5e' },
  { name: 'Gold / Amber', hex: '#f59e0b' },
  { name: 'Lime Green', hex: '#84cc16' },
  { name: 'Silver / Slate', hex: '#94a3b8' },
];

export const LiveStatusModal: React.FC<LiveStatusModalProps> = ({
  isOpen,
  onClose,
  isOwner,
  currentMember,
}) => {
  const [visitors, setVisitors] = useState<VisitorPresence[]>([]);
  const [ownerConfig, setOwnerConfigState] = useState<OwnerLiveConfig>(getOwnerLiveConfig());
  const [tagTextInput, setTagTextInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [customLogoInput, setCustomLogoInput] = useState('');
  const [adminCustomColor, setAdminCustomColorState] = useState('#38bdf8');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const myId = getDeviceId();
  const isAdmin = isVisitorAdmin(myId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const currentList = getVisitorsList();
      setVisitors(currentList);

      const cfg = getOwnerLiveConfig();
      setOwnerConfigState(cfg);
      setTagTextInput(cfg.tagText || 'Owner');
      setSelectedColor(cfg.tagColor || '#10b981');
      setCustomLogoInput(cfg.customLogoUrl || '');

      setAdminCustomColorState(getAdminTagColor(myId));

      const interval = setInterval(() => {
        setVisitors(getVisitorsList());
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, myId]);

  if (!isOpen) return null;

  const filteredVisitors = visitors.filter((v) => {
    if (isOwner) return true;
    if (currentMember) {
      return v.isSignedIn || v.id === myId;
    } else {
      return !v.isSignedIn || v.id === myId;
    }
  });

  const onlineCount = filteredVisitors.filter((v) => v.isOnline).length;

  const handleSaveOwnerSettings = () => {
    const updated = setOwnerLiveConfig({
      tagText: tagTextInput.trim() || 'Owner',
      tagColor: selectedColor,
      customLogoUrl: customLogoInput.trim(),
    });
    setOwnerConfigState(updated);
    setVisitors(getVisitorsList());
    setSaveNotice('Owner tag & logo updated successfully!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handle1x1LogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // 1x1 square thumbnail image
      const dataUrl = await processImageFile(file, 64, 64, 0.9);
      setCustomLogoInput(dataUrl);
      const updated = setOwnerLiveConfig({ customLogoUrl: dataUrl });
      setOwnerConfigState(updated);
      setVisitors(getVisitorsList());
      setSaveNotice('1x1 Custom Logo uploaded and applied!');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch {
      alert('Failed to process image file');
    }
  };

  const handleSaveAdminColor = (color: string) => {
    setAdminCustomColorState(color);
    setAdminTagColor(myId, color);
    setVisitors(getVisitorsList());
    setSaveNotice('Your admin tag color has been updated!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/40 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Live Community Status</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{onlineCount} Online</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live view of all users in PrismMods with their tags and roles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {saveNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{saveNotice}</span>
            </div>
          )}

          {/* 👑 OWNER ONLY CUSTOMIZER (At live status ONLY) */}
          {isOwner && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-950/80 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Owner Tag & Logo Customizer (Live Status Only)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Live Preview:</span>
                  <UserRoleBadge
                    role="owner"
                    tagText={tagTextInput}
                    tagColor={selectedColor}
                    customLogoUrl={customLogoInput}
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tag Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase">
                    Owner Tag Text
                  </label>
                  <input
                    type="text"
                    value={tagTextInput}
                    onChange={(e) => setTagTextInput(e.target.value)}
                    placeholder="e.g. Owner, Founder, Creator"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* 1x1 Custom Logo Image */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase flex items-center justify-between">
                    <span>Custom 1x1 Logo Image</span>
                    {customLogoInput && (
                      <button
                        type="button"
                        onClick={() => setCustomLogoInput('')}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Reset to Crown
                      </button>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handle1x1LogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload 1x1</span>
                    </button>
                    <input
                      type="url"
                      placeholder="Or paste 1x1 image URL..."
                      value={customLogoInput.startsWith('data:') ? '' : customLogoInput}
                      onChange={(e) => setCustomLogoInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Tag Color Palette */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase">
                  Choose Owner Tag Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setSelectedColor(col.hex)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                        selectedColor === col.hex ? 'ring-2 ring-white border-white scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: `${col.hex}25`, color: col.hex }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    title="Custom Hex Picker"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveOwnerSettings}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <SaveIcon className="w-3.5 h-3.5" />
                  <span>Save Owner Customization</span>
                </button>
              </div>
            </div>
          )}

          {/* 🔧 ADMIN ONLY COLOR CUSTOMIZER (Admins can ONLY customize their tag color) */}
          {isAdmin && !isOwner && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Admin Tag Color Customizer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Preview:</span>
                  <UserRoleBadge
                    role="admin"
                    tagText="Admin"
                    tagColor={adminCustomColor}
                    size="sm"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                As an Admin, you can add add-ons and personalize your Admin tag color below:
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => handleSaveAdminColor(col.hex)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                      adminCustomColor === col.hex ? 'ring-2 ring-white border-white scale-105' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: `${col.hex}25`, color: col.hex }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Presence & Tags List (Viewable by EVERYONE) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">All Live Members & Visitors</span>
              <span>Tags & Live Online Indicators</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredVisitors.map((v) => {
                const isCurrentUser = v.id === myId;
                return (
                  <div
                    key={v.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                      isCurrentUser
                        ? 'bg-slate-950/90 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={v.avatar}
                          alt={v.username}
                          className="w-9 h-9 rounded-full object-cover bg-slate-900 border border-slate-700"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                            v.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                          title={v.isOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {v.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                              You
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              v.isOnline
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {v.isOnline ? '🟢 Online' : '⚪ Offline'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{v.device}</span>
                          <span>•</span>
                          <span>Joined {new Date(v.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tag Badge & Developer-Only Become Admin Control */}
                    <div className="flex items-center gap-2">
                      <UserRoleBadge
                        role={v.role}
                        tagText={v.tagText}
                        tagColor={v.tagColor}
                        customLogoUrl={v.customLogoUrl}
                        size="md"
                      />

                      {/* Developer Only: Become Admin button near any visitor status */}
                      {isOwner && v.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => {
                            const newAdmin = v.role !== 'admin';
                            setVisitorAdminRole(v.id, newAdmin);
                            setVisitors(getVisitorsList());
                            setSaveNotice(
                              newAdmin 
                                ? `Promoted ${v.username} to Admin! They can now add add-ons.` 
                                : `Removed Admin role from ${v.username}.`
                            );
                            setTimeout(() => setSaveNotice(null), 3000);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1 ${
                            v.role === 'admin'
                              ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                              : 'bg-slate-800 hover:bg-cyan-950/50 text-slate-300 hover:text-cyan-300 border-slate-700'
                          }`}
                          title={v.role === 'admin' ? 'Remove Admin role' : 'Make this visitor an Admin (can add add-ons)'}
                        >
                          <Wrench className="w-3 h-3" />
                          <span>{v.role === 'admin' ? 'Admin 🔧' : 'Become Admin'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {visitors.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                  No active users recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 md:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Owner</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin (Add Mods)</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Visitor</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cancel / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      {...props}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
