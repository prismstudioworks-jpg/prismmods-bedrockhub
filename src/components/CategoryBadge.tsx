import React from 'react';
import { AddonCategory, CATEGORY_LABELS } from '../types/addon';
import { Package, Cpu, Palette, Map as MapIcon, Sparkles, User } from 'lucide-react';

interface CategoryBadgeProps {
  category: AddonCategory;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showDescription = false,
}) => {
  const cat = CATEGORY_LABELS[category] || CATEGORY_LABELS.addon;

  const getIcon = () => {
    switch (category) {
      case 'addon':
        return <Package className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'behavior_pack':
        return <Cpu className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'resource_pack':
        return <Palette className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'map':
        return <MapIcon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'shader':
        return <Sparkles className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      case 'skin_pack':
        return <User className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getColorClasses = () => {
    switch (category) {
      case 'addon':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'behavior_pack':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'resource_pack':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'map':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'shader':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'skin_pack':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center rounded-md border backdrop-blur-sm ${getColorClasses()} ${sizeClasses}`}
      >
        {getIcon()}
        <span>{cat.label}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-400 mt-1">{cat.description}</span>
      )}
    </div>
  );
};
