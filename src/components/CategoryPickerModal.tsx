import React from 'react';
import { AddonCategory, CATEGORY_LABELS } from '../types/addon';
import { 
  Package, Map as MapIcon, Palette, 
  Sparkles, User, Cpu, X, ArrowRight, Check 
} from 'lucide-react';

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: AddonCategory) => void;
  currentCategory?: AddonCategory;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  currentCategory,
}) => {
  if (!isOpen) return null;

  const categoriesList: {
    category: AddonCategory;
    title: string;
    badge: string;
    fileExt: string;
    description: string;
    features: string[];
    gradient: string;
    borderColor: string;
    textColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      category: 'addon',
      title: 'Minecraft Add-on',
      badge: 'Full Pack',
      fileExt: '.mcaddon',
      description: 'Complete Bedrock overhaul with custom entities, mobs, magic spells, weapons, and blocks.',
      features: ['Behavior + Resource packs', 'Custom entities & loot', 'Experimental toggles support'],
      gradient: 'from-emerald-950/50 via-slate-900 to-slate-900',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      textColor: 'text-emerald-400',
      icon: <Package className="w-6 h-6 text-emerald-400" />,
    },
    {
      category: 'map',
      title: 'World & Adventure Map',
      badge: 'World',
      fileExt: '.mcworld',
      description: 'Custom adventure maps, parkour runs, minigames, horror campaigns, and survival spawns.',
      features: ['Spawn coordinates & difficulty', 'Game modes (Survival/Adventure)', 'Multiplayer player limits'],
      gradient: 'from-rose-950/50 via-slate-900 to-slate-900',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      textColor: 'text-rose-400',
      icon: <MapIcon className="w-6 h-6 text-rose-400" />,
    },
    {
      category: 'resource_pack',
      title: 'Texture & Resource Pack',
      badge: 'Textures',
      fileExt: '.mcpack',
      description: 'HD resolution block textures, clean PvP sword models, dark mode UI, and custom sound design.',
      features: ['Resolution (16x, 64x, 128x)', 'Dark UI & connected glass', 'Subpack setting sliders'],
      gradient: 'from-cyan-950/50 via-slate-900 to-slate-900',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      textColor: 'text-cyan-400',
      icon: <Palette className="w-6 h-6 text-cyan-400" />,
    },
    {
      category: 'shader',
      title: 'Shader & Render Pack',
      badge: 'Visuals',
      fileExt: '.mcpack',
      description: 'Render Dragon lighting, deferred graphics, realistic sun caustics, and cinematic skies.',
      features: ['Render Dragon deferred support', 'Performance tiers (Low / RTX)', 'Platform compatibility tags'],
      gradient: 'from-purple-950/50 via-slate-900 to-slate-900',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      textColor: 'text-purple-400',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
    },
    {
      category: 'skin_pack',
      title: 'HD Skin Pack',
      badge: 'Skins',
      fileExt: '.mcpack',
      description: 'Custom character skin collections formatted for Bedrock player wardrobes.',
      features: ['Classic (4px) & Slim (3px) models', 'Skin count badge', 'Themed character sets'],
      gradient: 'from-indigo-950/50 via-slate-900 to-slate-900',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
      textColor: 'text-indigo-400',
      icon: <User className="w-6 h-6 text-indigo-400" />,
    },
    {
      category: 'behavior_pack',
      title: 'Behavior Pack Only',
      badge: 'Logic',
      fileExt: '.mcpack',
      description: 'Game logic modifications, entity AI behaviors, custom commands, and loot drop alterations.',
      features: ['Entity mechanics', 'Custom recipes', 'Pure .mcpack logic'],
      gradient: 'from-amber-950/50 via-slate-900 to-slate-900',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      textColor: 'text-amber-400',
      icon: <Cpu className="w-6 h-6 text-amber-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/40 p-5 sm:p-7 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Choose Bedrock Creation Type</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select what type of Bedrock item you want to publish. Each type includes its own unique details and fields.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {categoriesList.map((item) => {
            const isSelected = currentCategory === item.category;
            return (
              <div
                key={item.category}
                onClick={() => {
                  onSelectCategory(item.category);
                  onClose();
                }}
                className={`group p-4 rounded-xl border bg-gradient-to-br ${item.gradient} ${item.borderColor} transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.01] hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-cyan-400/60 shadow-cyan-950/40' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-white flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {item.fileExt}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border bg-slate-900/60 ${item.textColor} border-slate-800`}>
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1.5 border-t border-slate-800/60 space-y-1">
                    {item.features.map((feat, i) => (
                      <div key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs font-semibold">
                  <span className={`${item.textColor} group-hover:translate-x-1 transition-transform inline-flex items-center gap-1`}>
                    Create with this format
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Cancel / Go Back */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Cancel / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
