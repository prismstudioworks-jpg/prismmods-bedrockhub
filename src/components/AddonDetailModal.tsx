import React, { useState } from 'react';
import { BedrockAddon, ExternalLink, AddonComment, MemberUser } from '../types/addon';
import { CategoryBadge } from './CategoryBadge';
import { CommentsSection } from './CommentsSection';
import { 
  hasContent, hasArrayContent, getValidLinks, 
  addDownloadHistory, submitInappropriateReport,
  triggerAddonFileDownload 
} from '../utils/storage';
import { 
  X, Download, ExternalLink as ExtIcon, Heart, Share2, 
  Check, Copy, Shield, Sparkles, Terminal, FileCheck, Layers, 
  AlertTriangle, Edit3, Trash2, Calendar, User, HardDrive, Info,
  Map as MapIcon, Palette, Cpu, Flag
} from 'lucide-react';

interface AddonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  addon: BedrockAddon | null;
  isOwner: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onEdit?: (addon: BedrockAddon) => void;
  onDelete?: (addon: BedrockAddon) => void;
  currentMember: MemberUser | null;
  comments: AddonComment[];
  onAddComment: (content: string, rating: number) => void;
  onDeleteComment: (commentId: string) => void;
  onOpenSignIn: () => void;
  onDownloadClick?: (addonId: string) => void;
  downloadDelay?: number;
}

export const AddonDetailModal: React.FC<AddonDetailModalProps> = ({
  isOpen,
  onClose,
  addon,
  isOwner,
  isBookmarked,
  onToggleBookmark,
  onEdit,
  onDelete,
  currentMember,
  comments,
  onAddComment,
  onDeleteComment,
  onOpenSignIn,
  onDownloadClick,
  downloadDelay = 0,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [reportedAddonSuccess, setReportedAddonSuccess] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  if (!isOpen || !addon) return null;

  const validLinks = getValidLinks(addon.links);
  const primaryLink = validLinks.find((l) => l.isPrimary) || validLinks[0];

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleTriggerDownload = (targetLink?: ExternalLink) => {
    // Actually download the file and open website URL after optional delay
    const delayMs = (downloadDelay || 0) * 1000;
    const linkToOpen = targetLink || primaryLink;
    
    setTimeout(() => {
        triggerAddonFileDownload(addon, targetLink);
        if (linkToOpen?.url && linkToOpen.url.trim()) {
          window.open(linkToOpen.url.trim(), '_blank');
        }
    }, delayMs);

    if (onDownloadClick) {
      onDownloadClick(addon.id);
    }

    setDownloadSuccessNotice(delayMs > 0 ? `Download & opening website in ${downloadDelay}s...` : 'Downloading file & opening website...');
    setTimeout(() => setDownloadSuccessNotice(null), 4500);
  };

  const getDownloadLabel = (link?: ExternalLink) => {
    if (addon.downloadFileType) {
      const ext = addon.downloadFileType.startsWith('.') ? addon.downloadFileType : '.' + addon.downloadFileType;
      return `Download ${ext}`;
    }
    if (link?.type && ['.mcaddon', '.mcpack', '.mcworld', '.zip'].includes('.' + link.type)) {
      return `Download .${link.type}`;
    }
    if (addon.category === 'map') return 'Download .mcworld';
    if (addon.category === 'resource_pack' || addon.category === 'shader') return 'Download .mcpack';
    return 'Download .mcaddon';
  };

  const handleReportAddon = () => {
    submitInappropriateReport({
      targetType: 'addon',
      targetId: addon.id,
      targetTitleOrSnippet: addon.title + (addon.tagline ? ' - ' + addon.tagline : ''),
      reportedUserId: addon.author || 'author',
      reportedUsername: addon.author || 'Unknown Creator',
      reason: 'Inappropriate or broken mod reported by visitor',
    });
    setReportedAddonSuccess(true);
    setTimeout(() => setReportedAddonSuccess(false), 3000);
  };

  const getLinkIcon = (type?: ExternalLink['type']) => {
    switch (type) {
      case 'mcaddon':
      case 'mcpack':
      case 'mcworld':
        return <Download className="w-4 h-4" />;
      default:
        return <ExtIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/40 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Controls */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(addon.id)}
            className={`p-2 rounded-xl backdrop-blur-md border transition ${
              isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-950/70 text-slate-300 border-slate-750 hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
          >
            <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-rose-400' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-950/70 backdrop-blur-md text-slate-300 border border-slate-750 hover:bg-slate-800 transition"
            title="Share Addon"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Report Inappropriate Mod Button */}
          <button
            type="button"
            onClick={handleReportAddon}
            className={`p-2 rounded-xl backdrop-blur-md border transition flex items-center gap-1 ${
              reportedAddonSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950/70 text-slate-400 border-slate-750 hover:text-rose-400 hover:bg-slate-800'
            }`}
            title="Report this mod as inappropriate to owner"
          >
            {reportedAddonSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Flag className="w-4 h-4" />
            )}
          </button>

          {isOwner && onEdit && (
            <button
              onClick={() => onEdit(addon)}
              className="p-2 rounded-xl bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition"
              title="Edit Add-on"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(addon)}
              className="p-2 rounded-xl bg-rose-500/20 backdrop-blur-md text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition"
              title="Delete Add-on"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md text-slate-300 border border-slate-750 hover:bg-slate-800 transition flex items-center gap-1.5 font-bold text-xs"
            title="Cancel / Go Back"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel / Go Back</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Header Banner / Graphic */}
          <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border-b border-slate-800 overflow-hidden flex flex-col items-center justify-center p-5 md:p-8">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00f5d4_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Custom Cover image if provided - follows natural size/aspect ratio */}
            {hasContent(addon.coverImage) && (
              <div className="relative z-10 w-full max-h-96 flex items-center justify-center my-2">
                <img
                  src={addon.coverImage}
                  alt={addon.title}
                  className="w-auto max-w-full h-auto max-h-80 object-contain rounded-xl shadow-xl border border-slate-700/80"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Success Download Banner */}
            {downloadSuccessNotice && (
              <div className="absolute top-4 left-4 right-28 z-30 p-3.5 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xl animate-fade-in backdrop-blur-md">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                  ✓
                </span>
                <span>{downloadSuccessNotice}</span>
              </div>
            )}

            <div className="relative z-10 w-full pr-28">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <CategoryBadge category={addon.category} size="md" />

                {addon.featured && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                    <Sparkles className="w-3 h-3" /> Featured Addon
                  </span>
                )}

                {/* Total Downloads badge */}
                {addon.downloadCount !== undefined && addon.downloadCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <Download className="w-3 h-3" /> {addon.downloadCount} Downloads
                  </span>
                )}

                {hasContent(addon.version) && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                    {addon.version}
                  </span>
                )}

                {hasContent(addon.bedrockVersion) && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium">
                    Bedrock {addon.bedrockVersion}
                  </span>
                )}

                {hasContent(addon.fileSize) && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> {addon.fileSize}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {addon.title}
              </h1>

              {hasContent(addon.tagline) && (
                <p className="text-sm md:text-base text-cyan-200/90 mt-1.5 font-medium max-w-2xl">
                  {addon.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Core Body Container */}
          <div className="p-5 md:p-8 space-y-6">
            {/* Author Attribution */}
            {hasContent(addon.author) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{addon.author}</span>
                    {hasContent(addon.authorRole) && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-cyan-400 border border-slate-700">
                        {addon.authorRole}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {new Date(addon.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Unique Specs (Map, Texture, Shader, Skin, Addon) */}
            {addon.mapDetails && (hasContent(addon.mapDetails.gameMode) || hasContent(addon.mapDetails.spawnCoordinates) || hasContent(addon.mapDetails.playerCount) || hasContent(addon.mapDetails.difficulty)) && (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapIcon className="w-4 h-4 text-rose-400" />
                  <span>World & Map Specifications</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {hasContent(addon.mapDetails.gameMode) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Game Mode</div>
                      <div className="font-bold text-rose-300 mt-0.5">{addon.mapDetails.gameMode}</div>
                    </div>
                  )}
                  {hasContent(addon.mapDetails.spawnCoordinates) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Spawn Coordinates</div>
                      <div className="font-bold text-slate-200 mt-0.5 font-mono">{addon.mapDetails.spawnCoordinates}</div>
                    </div>
                  )}
                  {hasContent(addon.mapDetails.playerCount) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Players</div>
                      <div className="font-bold text-slate-200 mt-0.5">{addon.mapDetails.playerCount}</div>
                    </div>
                  )}
                  {hasContent(addon.mapDetails.difficulty) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Difficulty</div>
                      <div className="font-bold text-rose-300 mt-0.5">{addon.mapDetails.difficulty}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {addon.textureDetails && (hasContent(addon.textureDetails.resolution) || hasContent(addon.textureDetails.style) || hasContent(addon.textureDetails.subpackInfo)) && (
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Texture Pack Details</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {hasContent(addon.textureDetails.resolution) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Resolution</div>
                      <div className="font-bold text-cyan-300 mt-0.5">{addon.textureDetails.resolution}</div>
                    </div>
                  )}
                  {hasContent(addon.textureDetails.style) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Style / Theme</div>
                      <div className="font-bold text-slate-200 mt-0.5">{addon.textureDetails.style}</div>
                    </div>
                  )}
                  {hasContent(addon.textureDetails.subpackInfo) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 sm:col-span-1 col-span-2">
                      <div className="text-[10px] text-slate-400 uppercase">Subpack Options</div>
                      <div className="font-bold text-slate-200 mt-0.5">{addon.textureDetails.subpackInfo}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {addon.shaderDetails && (hasContent(addon.shaderDetails.renderEngine) || hasContent(addon.shaderDetails.performanceLevel) || hasContent(addon.shaderDetails.supportedDevices) || hasContent(addon.shaderDetails.visualHighlights)) && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2.5">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Shader Engine & Performance Profile</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {hasContent(addon.shaderDetails.renderEngine) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Graphics Engine</div>
                      <div className="font-bold text-purple-300 mt-0.5">{addon.shaderDetails.renderEngine}</div>
                    </div>
                  )}
                  {hasContent(addon.shaderDetails.performanceLevel) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Performance Tier</div>
                      <div className="font-bold text-slate-200 mt-0.5">{addon.shaderDetails.performanceLevel}</div>
                    </div>
                  )}
                  {hasContent(addon.shaderDetails.supportedDevices) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Devices Supported</div>
                      <div className="font-bold text-slate-200 mt-0.5">{addon.shaderDetails.supportedDevices}</div>
                    </div>
                  )}
                  {hasContent(addon.shaderDetails.visualHighlights) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Key Visuals</div>
                      <div className="font-bold text-purple-300 mt-0.5">{addon.shaderDetails.visualHighlights}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {addon.skinPackDetails && (hasContent(addon.skinPackDetails.skinCount) || hasContent(addon.skinPackDetails.modelType) || hasContent(addon.skinPackDetails.theme)) && (
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Skin Pack Details</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {hasContent(addon.skinPackDetails.skinCount) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Skins Included</div>
                      <div className="font-bold text-indigo-300 mt-0.5">{addon.skinPackDetails.skinCount}</div>
                    </div>
                  )}
                  {hasContent(addon.skinPackDetails.modelType) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Arm Model</div>
                      <div className="font-bold text-slate-200 mt-0.5">{addon.skinPackDetails.modelType}</div>
                    </div>
                  )}
                  {hasContent(addon.skinPackDetails.theme) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Theme</div>
                      <div className="font-bold text-slate-200 mt-0.5">{addon.skinPackDetails.theme}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {addon.addonDetails && (hasContent(addon.addonDetails.entityCount) || hasContent(addon.addonDetails.customCommands)) && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Add-on Entities & Function Commands</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {hasContent(addon.addonDetails.entityCount) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Entities / Items</div>
                      <div className="font-bold text-emerald-300 mt-0.5">{addon.addonDetails.entityCount}</div>
                    </div>
                  )}
                  {hasContent(addon.addonDetails.customCommands) && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Trigger Command</div>
                      <div className="font-bold text-slate-200 mt-0.5 font-mono">{addon.addonDetails.customCommands}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DOWNLOAD & LINKS SECTION */}
            {validLinks.length > 0 && (
              <div className="space-y-3 p-4 md:p-5 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-slate-950/80 border border-cyan-500/30 shadow-lg shadow-cyan-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      Download & External Resources ({validLinks.length})
                    </h2>
                  </div>
                  {addon.downloadCount !== undefined && (
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {addon.downloadCount} Total Downloads
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {validLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        link.isPrimary
                          ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/60'
                          : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1.5 rounded-lg ${
                                link.isPrimary
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-cyan-500/20 text-cyan-400'
                              }`}
                            >
                              {getLinkIcon(link.type)}
                            </span>
                            <span className="font-bold text-sm text-slate-100">{link.title}</span>
                          </div>
                          {link.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase tracking-wider shrink-0">
                              Primary
                            </span>
                          )}
                        </div>

                        {hasContent(link.note) && (
                          <p className="text-xs text-slate-400 mt-1.5 pl-8">{link.note}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleTriggerDownload(link)}
                          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 hover:animate-pulse ${
                            link.isPrimary
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{getDownloadLabel(link)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(link.url, link.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Copy Link URL"
                        >
                          {copiedLink === link.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {hasContent(addon.description) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <span>About This Bedrock Mod</span>
                </h3>
                <div className="p-4 md:p-5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {addon.description}
                </div>
              </div>
            )}

            {/* Experiments */}
            {hasArrayContent(addon.requiredExperiments) && (
              <div className="p-4 md:p-5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-bold text-purple-200">
                      Required Bedrock Experimental Features
                    </h3>
                    <p className="text-xs text-purple-300/80">
                      Turn on these toggles in your Bedrock World Settings:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {addon.requiredExperiments?.map((exp) => (
                    <div
                      key={exp}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/20 text-xs text-slate-200"
                    >
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-medium">{exp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Installation Guide */}
            {hasContent(addon.installationGuide) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Installation Guide</span>
                </h3>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs leading-relaxed whitespace-pre-line font-mono">
                  {addon.installationGuide}
                </div>
              </div>
            )}

            {/* Changelog */}
            {hasContent(addon.changelog) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Update Notes / Changelog</span>
                </h3>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                  {addon.changelog}
                </div>
              </div>
            )}

            {/* Screenshots Gallery */}
            {hasArrayContent(addon.gallery) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>In-Game Screenshots ({addon.gallery?.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Click to expand</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {addon.gallery?.map((imgUrl, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedScreenshot(imgUrl)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer hover:border-cyan-400 transition shadow-md"
                    >
                      <img
                        src={imgUrl}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-[11px] text-white font-semibold bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-700">
                          View #{i + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {hasArrayContent(addon.tags) && (
              <div className="pt-2 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold mr-1">Tags:</span>
                  {addon.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 💬 MEMBER REVIEWS & COMMENTS SECTION 💬 */}
            <CommentsSection
              addonId={addon.id}
              comments={comments}
              currentMember={currentMember}
              isDeveloper={isOwner}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onOpenSignIn={onOpenSignIn}
            />
          </div>
        </div>

        {/* Screenshot preview popover */}
        {selectedScreenshot && (
          <div
            className="fixed inset-0 z-60 bg-black/95 p-4 flex flex-col items-center justify-center animate-fade-in"
            onClick={() => setSelectedScreenshot(null)}
          >
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition"
              title="Close image view"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative max-w-5xl max-h-[85vh] p-2 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedScreenshot}
                alt="Expanded screenshot"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-800"
              />
            </div>
            <div className="text-xs text-slate-400 mt-2">Click outside or press X to close</div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 md:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Minecraft Bedrock Edition Compatible</span>
          </div>

          <div className="flex items-center gap-2">
            {primaryLink && (
              <button
                type="button"
                onClick={() => handleTriggerDownload(primaryLink)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:animate-pulse"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{getDownloadLabel(primaryLink)}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              Cancel / Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
