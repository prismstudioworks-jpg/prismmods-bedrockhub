import React from 'react';
import { BedrockAddon } from '../types/addon';
import { CategoryBadge } from './CategoryBadge';
import { hasContent, hasArrayContent, getValidLinks } from '../utils/storage';
import { 
  Heart, Download, ExternalLink, Sparkles, 
  Edit3, Trash2, HardDrive, ArrowRight, Layers 
} from 'lucide-react';

interface AddonCardProps {
  addon: BedrockAddon;
  isOwner: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onClick: (addon: BedrockAddon) => void;
  onEdit?: (addon: BedrockAddon) => void;
  onDelete?: (addon: BedrockAddon) => void;
}

export const AddonCard: React.FC<AddonCardProps> = ({
  addon,
  isOwner,
  isBookmarked,
  onToggleBookmark,
  onClick,
  onEdit,
  onDelete,
}) => {
  const validLinks = getValidLinks(addon.links);
  const primaryLink = validLinks.find((l) => l.isPrimary) || validLinks[0];

  return (
    <div
      onClick={() => onClick(addon)}
      className="group relative bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col cursor-pointer"
    >
      {/* Top Graphic / Banner */}
      <div className={`relative ${hasContent(addon.coverImage) ? 'bg-slate-950 flex items-center justify-center p-2' : 'h-40'} bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 overflow-hidden shrink-0 border-b border-slate-800/80`}>
        {/* Minecraft block texture grid pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00f5d4_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Custom cover image if owner set one - follows natural size/aspect ratio */}
        {hasContent(addon.coverImage) ? (
          <img
            src={addon.coverImage}
            alt={addon.title}
            className="w-full h-auto max-h-56 object-contain group-hover:scale-102 transition-transform duration-500 relative z-10 rounded-lg"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="text-center space-y-2 opacity-80 group-hover:opacity-100 transition">
              <div className="inline-flex p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-cyan-400 shadow-inner">
                <CategoryBadge category={addon.category} size="lg" />
              </div>
            </div>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <CategoryBadge category={addon.category} size="sm" />

          {addon.featured && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold backdrop-blur-md">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>

        {/* Bookmark & Owner Action buttons */}
        <div 
          className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onToggleBookmark(addon.id)}
            className={`p-1.5 rounded-lg backdrop-blur-md border transition ${
              isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
          >
            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-400' : ''}`} />
          </button>

          {isOwner && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(addon)}
                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                  title="Edit Addon"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(addon)}
                  className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition"
                  title="Delete Addon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Version pills overlay - ONLY IF PROVIDED */}
        {(hasContent(addon.version) || hasContent(addon.bedrockVersion)) && (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] z-10">
            {hasContent(addon.version) ? (
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800 font-mono">
                {addon.version}
              </span>
            ) : <span />}

            {hasContent(addon.bedrockVersion) && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 font-medium">
                MC {addon.bedrockVersion}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition line-clamp-1">
            {addon.title}
          </h3>

          {/* Tagline - ONLY IF PROVIDED */}
          {hasContent(addon.tagline) && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {addon.tagline}
            </p>
          )}
        </div>

        {/* Unique Category Specific Chip - ONLY IF PROVIDED */}
        {addon.category === 'map' && addon.mapDetails?.gameMode && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="font-semibold">{addon.mapDetails.gameMode}</span>
            {addon.mapDetails.playerCount && (
              <span className="text-slate-400">• {addon.mapDetails.playerCount}</span>
            )}
          </div>
        )}

        {addon.category === 'resource_pack' && addon.textureDetails?.resolution && (
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-semibold">{addon.textureDetails.resolution} Resolution</span>
            {addon.textureDetails.style && (
              <span className="text-slate-400">• {addon.textureDetails.style}</span>
            )}
          </div>
        )}

        {addon.category === 'shader' && addon.shaderDetails?.renderEngine && (
          <div className="flex items-center gap-1.5 text-[11px] text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="font-semibold">{addon.shaderDetails.renderEngine}</span>
            {addon.shaderDetails.performanceLevel && (
              <span className="text-slate-400">• {addon.shaderDetails.performanceLevel}</span>
            )}
          </div>
        )}

        {addon.category === 'skin_pack' && addon.skinPackDetails?.skinCount && (
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="font-semibold">{addon.skinPackDetails.skinCount}</span>
            {addon.skinPackDetails.modelType && (
              <span className="text-slate-400">• {addon.skinPackDetails.modelType}</span>
            )}
          </div>
        )}

        {(addon.category === 'addon' || addon.category === 'behavior_pack') && addon.addonDetails?.entityCount && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold">{addon.addonDetails.entityCount}</span>
          </div>
        )}

        {/* Tags - ONLY IF PROVIDED */}
        {hasArrayContent(addon.tags) && (
          <div className="flex flex-wrap gap-1">
            {addon.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-750"
              >
                #{tag}
              </span>
            ))}
            {(addon.tags?.length || 0) > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{(addon.tags?.length || 0) - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer info: author, file size, links count */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {/* Author only if provided */}
            {hasContent(addon.author) ? (
              <span className="text-[11px] font-medium text-slate-300 truncate max-w-[110px]">
                by {addon.author}
              </span>
            ) : hasContent(addon.fileSize) ? (
              <span className="text-[11px] flex items-center gap-1 text-slate-400">
                <HardDrive className="w-3 h-3" /> {addon.fileSize}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Bedrock Pack</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {addon.downloadCount !== undefined && addon.downloadCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1 hover:animate-pulse transition-all cursor-pointer" title="Total Downloads">
                <Download className="w-3 h-3" />
                <span>{addon.downloadCount}</span>
              </span>
            )}

            {validLinks.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold hover:animate-pulse transition-all">
                {validLinks.length} {validLinks.length === 1 ? 'Link' : 'Links'}
              </span>
            )}

            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
