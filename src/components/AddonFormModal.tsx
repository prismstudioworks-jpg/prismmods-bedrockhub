import React, { useState, useRef, useEffect } from 'react';
import { 
  BedrockAddon, AddonCategory, ExternalLink, COMMON_EXPERIMENTS, 
  CATEGORY_LABELS, MapDetails, TextureDetails, ShaderDetails, SkinPackDetails, AddonSpecificDetails 
} from '../types/addon';
import { 
  X, Plus, Trash2, Link as LinkIcon, 
  Sparkles, Save, Eye, Layers, FileText, Check, AlertCircle, Info, ExternalLink as ExtIcon,
  Image as ImageIcon, Upload, Camera, HardDrive, RefreshCw, ChevronDown, Map as MapIcon, 
  Palette, User, Cpu, Package, Compass, Gauge, Monitor, Shield
} from 'lucide-react';
import { processImageFile } from '../utils/imageHelper';
import { CategoryPickerModal } from './CategoryPickerModal';
import { hasContent } from '../utils/storage';

interface AddonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addon: BedrockAddon) => void;
  onDelete?: (addon: BedrockAddon) => void;
  initialAddon?: BedrockAddon | null;
  defaultCategory?: AddonCategory;
}

export const AddonFormModal: React.FC<AddonFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialAddon,
  defaultCategory = 'addon',
}) => {
  const isEditing = Boolean(initialAddon);

  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'links' | 'advanced' | 'preview'>('details');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState(initialAddon?.title || '');
  const [category, setCategory] = useState<AddonCategory>(initialAddon?.category || defaultCategory);
  const [tagline, setTagline] = useState(initialAddon?.tagline || '');
  const [description, setDescription] = useState(initialAddon?.description || '');
  const [version, setVersion] = useState(initialAddon?.version || '');
  const [bedrockVersion, setBedrockVersion] = useState(initialAddon?.bedrockVersion || '');
  const [fileSize, setFileSize] = useState(initialAddon?.fileSize || '');
  
  // Unique Map Details
  const [mapGameMode, setMapGameMode] = useState(initialAddon?.mapDetails?.gameMode || 'Survival');
  const [mapCoordinates, setMapCoordinates] = useState(initialAddon?.mapDetails?.spawnCoordinates || '');
  const [mapPlayerCount, setMapPlayerCount] = useState(initialAddon?.mapDetails?.playerCount || '');
  const [mapDifficulty, setMapDifficulty] = useState(initialAddon?.mapDetails?.difficulty || 'Normal');

  // Unique Texture Details
  const [textureResolution, setTextureResolution] = useState(initialAddon?.textureDetails?.resolution || '64x');
  const [textureStyle, setTextureStyle] = useState(initialAddon?.textureDetails?.style || '');
  const [textureSubpackInfo, setTextureSubpackInfo] = useState(initialAddon?.textureDetails?.subpackInfo || '');

  // Unique Shader Details
  const [shaderRenderEngine, setShaderRenderEngine] = useState(initialAddon?.shaderDetails?.renderEngine || 'Render Dragon Deferred');
  const [shaderPerformance, setShaderPerformance] = useState(initialAddon?.shaderDetails?.performanceLevel || 'Balanced');
  const [shaderDevices, setShaderDevices] = useState(initialAddon?.shaderDetails?.supportedDevices || '');
  const [shaderHighlights, setShaderHighlights] = useState(initialAddon?.shaderDetails?.visualHighlights || '');

  // Unique Skin Pack Details
  const [skinCount, setSkinCount] = useState(initialAddon?.skinPackDetails?.skinCount || '');
  const [skinModelType, setSkinModelType] = useState(initialAddon?.skinPackDetails?.modelType || 'Classic (4px)');
  const [skinTheme, setSkinTheme] = useState(initialAddon?.skinPackDetails?.theme || '');

  // Unique Addon Details
  const [entityCount, setEntityCount] = useState(initialAddon?.addonDetails?.entityCount || '');
  const [customCommands, setCustomCommands] = useState(initialAddon?.addonDetails?.customCommands || '');

  // Cover Image
  const [coverImage, setCoverImage] = useState(initialAddon?.coverImage || '');
  const [isProcessingCover, setIsProcessingCover] = useState(false);

  // Screenshots
  const [screenshots, setScreenshots] = useState<string[]>(initialAddon?.gallery || []);
  const [screenshotUrlInput, setScreenshotUrlInput] = useState('');
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);

  const [author, setAuthor] = useState(initialAddon?.author || '');
  const [authorRole, setAuthorRole] = useState(initialAddon?.authorRole || '');
  const [tagsInput, setTagsInput] = useState(initialAddon?.tags?.join(', ') || '');
  const [installationGuide, setInstallationGuide] = useState(initialAddon?.installationGuide || '');
  const [changelog, setChangelog] = useState(initialAddon?.changelog || '');
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>(
    initialAddon?.requiredExperiments || []
  );
  const [customExperiment, setCustomExperiment] = useState('');
  const [featured, setFeatured] = useState(initialAddon?.featured || false);

  // Links state
  const [links, setLinks] = useState<ExternalLink[]>(
    initialAddon?.links && initialAddon.links.length > 0
      ? initialAddon.links
      : [
          {
            id: 'link-' + Date.now(),
            title: `Download ${CATEGORY_LABELS[initialAddon?.category || defaultCategory].fileFormat}`,
            url: '',
            type: initialAddon?.category === 'map' ? 'mcworld' : initialAddon?.category === 'resource_pack' ? 'mcpack' : 'mcaddon',
            note: 'Primary release',
            isPrimary: true,
          },
        ]
  );

  // File Download Attachment & Type state
  const [downloadFileType, setDownloadFileType] = useState(
    initialAddon?.downloadFileType || CATEGORY_LABELS[initialAddon?.category || defaultCategory].fileFormat || '.mcaddon'
  );
  const [attachedFileName, setAttachedFileName] = useState(initialAddon?.attachedFileName || '');
  const [attachedFileData, setAttachedFileData] = useState(initialAddon?.attachedFileData || '');
  const [attachedFileSize, setAttachedFileSize] = useState(initialAddon?.attachedFileSize || '');
  const addonFileInputRef = useRef<HTMLInputElement>(null);

  const [validationError, setValidationError] = useState('');
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const screenshotFileInputRef = useRef<HTMLInputElement>(null);

  // Addon file upload handler (.mcaddon, .mcpack, .mcworld, .zip)
  const handleAddonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const detectedExt = file.name.includes('.') ? '.' + file.name.split('.').pop() : downloadFileType;
    setDownloadFileType(detectedExt);
    setAttachedFileName(file.name);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${Math.ceil(file.size / 1024)} KB`;
    setAttachedFileSize(sizeStr);
    if (!fileSize) {
      setFileSize(sizeStr);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAttachedFileData(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sync category changes from external defaultCategory if not editing
  useEffect(() => {
    if (!initialAddon && defaultCategory) {
      setCategory(defaultCategory);
      setDownloadFileType(CATEGORY_LABELS[defaultCategory].fileFormat);
    }
  }, [defaultCategory, initialAddon]);

  if (!isOpen) return null;

  // Cover image upload handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingCover(true);
      const dataUrl = await processImageFile(file, 1400, 788, 0.85);
      setCoverImage(dataUrl);
    } catch (err) {
      alert('Failed to process image file. Please try another image.');
    } finally {
      setIsProcessingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Screenshots upload handler
  const handleScreenshotFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsProcessingScreenshot(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await processImageFile(file, 1280, 720, 0.8);
          newUrls.push(dataUrl);
        }
      }
      setScreenshots((prev) => [...prev, ...newUrls]);
    } catch (err) {
      alert('Error processing one or more screenshot files.');
    } finally {
      setIsProcessingScreenshot(false);
      if (screenshotFileInputRef.current) screenshotFileInputRef.current.value = '';
    }
  };

  const handleAddScreenshotUrl = () => {
    if (screenshotUrlInput.trim()) {
      setScreenshots((prev) => [...prev, screenshotUrlInput.trim()]);
      setScreenshotUrlInput('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLink = (template?: { title: string; type: ExternalLink['type']; note?: string }) => {
    const newLink: ExternalLink = {
      id: 'link-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: template?.title || 'Download / Resource Link',
      url: '',
      type: template?.type || 'other',
      note: template?.note || '',
      isPrimary: links.length === 0,
    };
    setLinks([...links, newLink]);
  };

  const handleUpdateLink = (id: string, updates: Partial<ExternalLink>) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, ...updates } : link)));
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleToggleExperiment = (exp: string) => {
    if (selectedExperiments.includes(exp)) {
      setSelectedExperiments(selectedExperiments.filter((e) => e !== exp));
    } else {
      setSelectedExperiments([...selectedExperiments, exp]);
    }
  };

  const handleAddCustomExperiment = () => {
    if (customExperiment.trim() && !selectedExperiments.includes(customExperiment.trim())) {
      setSelectedExperiments([...selectedExperiments, customExperiment.trim()]);
      setCustomExperiment('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please provide a title for this Bedrock item.');
      setActiveTab('details');
      return;
    }

    const validLinks: ExternalLink[] = links
      .filter((l) => l.url.trim().length > 0 || l.title.trim().length > 0)
      .map((l) => ({
        ...l,
        title: l.title.trim() || 'Download Link',
        url: l.url.trim(),
        note: l.note?.trim() || undefined,
      }));

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const validScreenshots = screenshots.filter((s) => s.trim().length > 0);

    // Build unique category objects only if fields are populated
    let mapDetailsObj: MapDetails | undefined = undefined;
    if (category === 'map') {
      const hasAny = hasContent(mapGameMode) || hasContent(mapCoordinates) || hasContent(mapPlayerCount) || hasContent(mapDifficulty);
      if (hasAny) {
        mapDetailsObj = {
          gameMode: hasContent(mapGameMode) ? mapGameMode.trim() : undefined,
          spawnCoordinates: hasContent(mapCoordinates) ? mapCoordinates.trim() : undefined,
          playerCount: hasContent(mapPlayerCount) ? mapPlayerCount.trim() : undefined,
          difficulty: hasContent(mapDifficulty) ? mapDifficulty.trim() : undefined,
        };
      }
    }

    let textureDetailsObj: TextureDetails | undefined = undefined;
    if (category === 'resource_pack') {
      const hasAny = hasContent(textureResolution) || hasContent(textureStyle) || hasContent(textureSubpackInfo);
      if (hasAny) {
        textureDetailsObj = {
          resolution: hasContent(textureResolution) ? textureResolution.trim() : undefined,
          style: hasContent(textureStyle) ? textureStyle.trim() : undefined,
          subpackInfo: hasContent(textureSubpackInfo) ? textureSubpackInfo.trim() : undefined,
        };
      }
    }

    let shaderDetailsObj: ShaderDetails | undefined = undefined;
    if (category === 'shader') {
      const hasAny = hasContent(shaderRenderEngine) || hasContent(shaderPerformance) || hasContent(shaderDevices) || hasContent(shaderHighlights);
      if (hasAny) {
        shaderDetailsObj = {
          renderEngine: hasContent(shaderRenderEngine) ? shaderRenderEngine.trim() : undefined,
          performanceLevel: hasContent(shaderPerformance) ? shaderPerformance.trim() : undefined,
          supportedDevices: hasContent(shaderDevices) ? shaderDevices.trim() : undefined,
          visualHighlights: hasContent(shaderHighlights) ? shaderHighlights.trim() : undefined,
        };
      }
    }

    let skinPackDetailsObj: SkinPackDetails | undefined = undefined;
    if (category === 'skin_pack') {
      const hasAny = hasContent(skinCount) || hasContent(skinModelType) || hasContent(skinTheme);
      if (hasAny) {
        skinPackDetailsObj = {
          skinCount: hasContent(skinCount) ? skinCount.trim() : undefined,
          modelType: hasContent(skinModelType) ? skinModelType.trim() : undefined,
          theme: hasContent(skinTheme) ? skinTheme.trim() : undefined,
        };
      }
    }

    let addonDetailsObj: AddonSpecificDetails | undefined = undefined;
    if (category === 'addon' || category === 'behavior_pack') {
      const hasAny = hasContent(entityCount) || hasContent(customCommands);
      if (hasAny) {
        addonDetailsObj = {
          entityCount: hasContent(entityCount) ? entityCount.trim() : undefined,
          customCommands: hasContent(customCommands) ? customCommands.trim() : undefined,
        };
      }
    }

    const newAddon: BedrockAddon = {
      id: initialAddon?.id || 'addon-' + Date.now(),
      title: title.trim(),
      category,
      tagline: tagline.trim() || undefined,
      description: description.trim() || undefined,
      version: version.trim() || undefined,
      bedrockVersion: bedrockVersion.trim() || undefined,
      fileSize: fileSize.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      gallery: validScreenshots.length > 0 ? validScreenshots : undefined,
      author: author.trim() || undefined,
      authorRole: authorRole.trim() || undefined,
      links: validLinks,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      installationGuide: installationGuide.trim() || undefined,
      requiredExperiments: selectedExperiments.length > 0 ? selectedExperiments : undefined,
      changelog: changelog.trim() || undefined,
      featured,
      createdAt: initialAddon?.createdAt || Date.now(),
      updatedAt: Date.now(),

      // File download attachment & type
      downloadFileType: downloadFileType || CATEGORY_LABELS[category].fileFormat,
      attachedFileName: attachedFileName.trim() || undefined,
      attachedFileData: attachedFileData || undefined,
      attachedFileSize: attachedFileSize || undefined,

      // Unique details
      mapDetails: mapDetailsObj,
      textureDetails: textureDetailsObj,
      shaderDetails: shaderDetailsObj,
      skinPackDetails: skinPackDetailsObj,
      addonDetails: addonDetailsObj,
    };

    onSave(newAddon);
    onClose();
  };

  const currentCategoryMeta = CATEGORY_LABELS[category] || CATEGORY_LABELS.addon;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
        <div 
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/40 flex flex-col max-h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-slate-100">
                  {isEditing ? `Edit ${currentCategoryMeta.shortTag}` : `Publish ${currentCategoryMeta.shortTag}`}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Format: <span className="font-mono text-cyan-400">{currentCategoryMeta.fileFormat}</span> • Any field left empty will automatically be hidden
              </p>
            </div>

            {/* Pop-up Option Trigger to switch between Add-on, World, Shader, Texture, Skin Pack */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                title="Change Creation Type"
              >
                <span>Type: {currentCategoryMeta.shortTag}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 md:px-6 shrink-0 gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Core & {currentCategoryMeta.shortTag} Specs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'media'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Cover & Screenshots {screenshots.length > 0 ? `(${screenshots.length})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'links'
                  ? 'border-teal-400 text-teal-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Download Links ({links.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'advanced'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Guides & Changelog</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Member View</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* TAB 1: CORE DETAILS & UNIQUE SPECS */}
            {activeTab === 'details' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`e.g. My Custom ${currentCategoryMeta.shortTag}`}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryPickerOpen(true)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none hover:border-cyan-400 flex items-center justify-between text-left"
                    >
                      <span className="font-semibold text-cyan-300">{currentCategoryMeta.label}</span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* 🌟 UNIQUE CATEGORY-SPECIFIC SECTION 🌟 */}
                {category === 'map' && (
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapIcon className="w-5 h-5 text-rose-400" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider">
                          World & Map Specific Details (.mcworld)
                        </h4>
                        <p className="text-[11px] text-slate-400">Leave any field blank if you do not want it shown</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Game Mode</label>
                        <select
                          value={mapGameMode}
                          onChange={(e) => setMapGameMode(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
                        >
                          <option value="Survival">Survival</option>
                          <option value="Adventure">Adventure</option>
                          <option value="Creative">Creative</option>
                          <option value="Parkour">Parkour</option>
                          <option value="Minigame">Minigame</option>
                          <option value="Horror">Horror / Puzzle</option>
                          <option value="PvP / PvE">PvP / PvE</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Spawn Coordinates</label>
                        <input
                          type="text"
                          placeholder="e.g. 0, 64, 0"
                          value={mapCoordinates}
                          onChange={(e) => setMapCoordinates(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Players Supported</label>
                        <input
                          type="text"
                          placeholder="e.g. 1-4 Players or Singleplayer"
                          value={mapPlayerCount}
                          onChange={(e) => setMapPlayerCount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Difficulty</label>
                        <select
                          value={mapDifficulty}
                          onChange={(e) => setMapDifficulty(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
                        >
                          <option value="Peaceful">Peaceful</option>
                          <option value="Easy">Easy</option>
                          <option value="Normal">Normal</option>
                          <option value="Hard">Hard</option>
                          <option value="Hardcore">Hardcore</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {category === 'resource_pack' && (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-cyan-400" />
                      <div>
                        <h4 className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                          Texture & Resource Pack Specific Details (.mcpack)
                        </h4>
                        <p className="text-[11px] text-slate-400">Leave any field blank if not applicable</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Resolution</label>
                        <select
                          value={textureResolution}
                          onChange={(e) => setTextureResolution(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="16x">16x16 (Vanilla Standard)</option>
                          <option value="32x">32x32 (Faithful Crisp)</option>
                          <option value="64x">64x64 (HD Detailed)</option>
                          <option value="128x">128x128 (Ultra HD)</option>
                          <option value="256x">256x256 (Extreme HD)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Artistic Style</label>
                        <input
                          type="text"
                          placeholder="e.g. Faithful Vanilla, Clean PvP, Dark UI"
                          value={textureStyle}
                          onChange={(e) => setTextureStyle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Subpacks / Config Sliders</label>
                        <input
                          type="text"
                          placeholder="e.g. Connected glass, Low shield toggle"
                          value={textureSubpackInfo}
                          onChange={(e) => setTextureSubpackInfo(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === 'shader' && (
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                          Shader & Lighting Engine Details
                        </h4>
                        <p className="text-[11px] text-slate-400">Specify rendering engine and performance expectations</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Rendering Engine</label>
                        <input
                          type="text"
                          placeholder="e.g. Render Dragon Deferred"
                          value={shaderRenderEngine}
                          onChange={(e) => setShaderRenderEngine(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Performance Tier</label>
                        <select
                          value={shaderPerformance}
                          onChange={(e) => setShaderPerformance(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                        >
                          <option value="Low-end Friendly">Low-end Friendly (Mobile OK)</option>
                          <option value="Balanced">Balanced (Standard GPU)</option>
                          <option value="High Performance / RTX">High Performance (Dedicated GPU / RTX)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Tested Devices / OS</label>
                        <input
                          type="text"
                          placeholder="e.g. Windows 10/11, Android"
                          value={shaderDevices}
                          onChange={(e) => setShaderDevices(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Key Visuals</label>
                        <input
                          type="text"
                          placeholder="e.g. Volumetric fog, Bloom, Sunrays"
                          value={shaderHighlights}
                          onChange={(e) => setShaderHighlights(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === 'skin_pack' && (
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                          Skin Pack Details (.mcpack)
                        </h4>
                        <p className="text-[11px] text-slate-400">Configure character count, arm thickness, and themes</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Total Skins Included</label>
                        <input
                          type="text"
                          placeholder="e.g. 15 HD Skins"
                          value={skinCount}
                          onChange={(e) => setSkinCount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Model Arms</label>
                        <select
                          value={skinModelType}
                          onChange={(e) => setSkinModelType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                        >
                          <option value="Classic (4px)">Classic 4px (Steve)</option>
                          <option value="Slim (3px)">Slim 3px (Alex)</option>
                          <option value="Mixed (Both Classic & Slim)">Mixed (Both Classic & Slim)</option>
                          <option value="128x HD">128x Ultra HD</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Theme / Style</label>
                        <input
                          type="text"
                          placeholder="e.g. Cyberpunk, Anime, Medieval"
                          value={skinTheme}
                          onChange={(e) => setSkinTheme(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(category === 'addon' || category === 'behavior_pack') && (
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                          Add-on & Entity Mechanics (.mcaddon / .mcpack)
                        </h4>
                        <p className="text-[11px] text-slate-400">Custom entity counts and command triggers</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Custom Entities / Items Count</label>
                        <input
                          type="text"
                          placeholder="e.g. 14 New Mobs, 8 Runic Weapons"
                          value={entityCount}
                          onChange={(e) => setEntityCount(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Function / Command Triggers</label>
                        <input
                          type="text"
                          placeholder="e.g. /function setup or /give @p item"
                          value={customCommands}
                          onChange={(e) => setCustomCommands(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Core fields */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Tagline / Short Summary
                    </label>
                    <span className="text-[11px] text-slate-500">Optional (hidden if empty)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Brief description that captures players' interest immediately."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Full Description
                    </label>
                    <span className="text-[11px] text-slate-500">Optional (hidden if empty)</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Detailed breakdown of features, recipes, lore, mob mechanics, or commands..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">
                      Version (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. v1.2.0"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">
                      Bedrock Compatibility (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1.21.30+ / All"
                      value={bedrockVersion}
                      onChange={(e) => setBedrockVersion(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">
                      File Size (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12.8 MB"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">
                      Creator Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Creator Name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-400">
                      Creator Role / Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Developer"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Tags (Comma separated)
                    </label>
                    <span className="text-[11px] text-slate-500">Optional (hidden if empty)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Survival, Magic, Bosses, Weapons, 64x, RPG"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Highlight as Featured Item</div>
                    <div className="text-[11px] text-slate-400">Pins to top carousel and adds a glowing badge</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: MEDIA & SCREENSHOTS */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                {/* SECTION A: COVER BANNER IMAGE */}
                <div className="p-4 md:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">Cover Banner Image</h3>
                        <p className="text-[11px] text-slate-400">Displayed at the top of the card and detail modal</p>
                      </div>
                    </div>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Cover</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <label className="flex-1 py-3 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      <Upload className="w-4 h-4" />
                      <span>{isProcessingCover ? 'Processing Image...' : 'Upload Image File (Device)'}</span>
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        disabled={isProcessingCover}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={coverImage.startsWith('data:') ? '' : coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {coverImage ? (
                    <div className="relative p-3 rounded-xl border border-slate-700 bg-slate-950 flex flex-col items-center justify-center group">
                      <img src={coverImage} alt="Cover preview" className="w-auto max-w-full h-auto max-h-64 object-contain rounded-lg shadow-md" />
                      <div className="mt-2 flex items-center justify-between w-full">
                        <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-emerald-500/30">
                          <Check className="w-3 h-3 text-emerald-400" /> Cover Attached & Active (Natural Size)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                      <span>No cover image selected (will use stylish Bedrock theme)</span>
                    </div>
                  )}
                </div>

                {/* SECTION B: SCREENSHOTS GALLERY */}
                <div className="p-4 md:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-cyan-400" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">
                          In-Game Screenshots ({screenshots.length})
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Show gameplay, models, crafting recipes, or UI in-game
                        </p>
                      </div>
                    </div>

                    {screenshots.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setScreenshots([])}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All Screenshots</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <label className="flex-1 py-3 px-4 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{isProcessingScreenshot ? 'Processing...' : 'Upload Screenshots (Select Multiple)'}</span>
                      <input
                        ref={screenshotFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotFileUpload}
                        disabled={isProcessingScreenshot}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste screenshot URL..."
                        value={screenshotUrlInput}
                        onChange={(e) => setScreenshotUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddScreenshotUrl();
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddScreenshotUrl}
                        disabled={!screenshotUrlInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {screenshots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {screenshots.map((shot, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md"
                        >
                          <img
                            src={shot}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.opacity = '0.3';
                            }}
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-slate-700">
                            #{idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Remove Screenshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-500 text-xs">
                      No screenshots added yet. Click "Upload Screenshots" to select images from your device or paste an image URL.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DOWNLOAD & EXTERNAL LINKS */}
            {activeTab === 'links' && (
              <div className="space-y-4">
                {/* File Attachment & Type Configuration (Developer Mode) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Download File Type & File Attachment (Developer Mode)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Configure file extension (.mcaddon, .mcpack, .mcworld) and attach real files for visitors to download
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* File Type Selection */}
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-300 font-semibold">
                        Download File Type / Extension
                      </label>
                      <select
                        value={downloadFileType}
                        onChange={(e) => setDownloadFileType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value=".mcaddon">.mcaddon (Combined Add-on Pack)</option>
                        <option value=".mcpack">.mcpack (Resource / Behavior / Shader Pack)</option>
                        <option value=".mcworld">.mcworld (Bedrock Adventure World Map)</option>
                        <option value=".zip">.zip (Standard Compressed Archive)</option>
                      </select>
                    </div>

                    {/* Attach Real File */}
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-300 font-semibold">
                        Attach Real File from Device
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={addonFileInputRef}
                          type="file"
                          accept=".mcaddon,.mcpack,.mcworld,.zip,*"
                          onChange={handleAddonFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => addonFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{attachedFileName ? 'Change File' : 'Upload File'}</span>
                        </button>
                        <div className="flex-1 text-[11px] text-slate-400 truncate bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2">
                          {attachedFileName ? (
                            <span className="text-emerald-300 font-mono font-bold">
                              📎 {attachedFileName} ({attachedFileSize})
                            </span>
                          ) : (
                            <span className="italic">Auto-packages valid manifest when downloaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
                  <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-cyan-300">Unlimited External & Download Links</p>
                    <p className="text-slate-400">
                      Add MediaFire, CurseForge, Direct {downloadFileType || currentCategoryMeta.fileFormat}, YouTube trailers, Discord servers, GitHub repositories, or official documentation.
                    </p>
                  </div>
                </div>

                {/* Quick Template Buttons */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Quick Add:</span>
                  <button
                    type="button"
                    onClick={() => handleAddLink({ title: `Direct ${currentCategoryMeta.fileFormat} Download`, type: category === 'map' ? 'mcworld' : category === 'resource_pack' ? 'mcpack' : 'mcaddon', note: 'Primary download' })}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20 font-medium transition"
                  >
                    + Direct {currentCategoryMeta.fileFormat}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLink({ title: 'MediaFire Mirror', type: 'mediafire' })}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs border border-blue-500/20 font-medium transition"
                  >
                    + MediaFire Mirror
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLink({ title: 'CurseForge Page', type: 'curseforge' })}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs border border-orange-500/20 font-medium transition"
                  >
                    + CurseForge
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLink({ title: 'YouTube Showcase Video', type: 'youtube' })}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs border border-rose-500/20 font-medium transition"
                  >
                    + YouTube Video
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLink({ title: 'Discord Community Server', type: 'discord' })}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs border border-indigo-500/20 font-medium transition"
                  >
                    + Discord
                  </button>
                </div>

                {/* Link items list */}
                <div className="space-y-3">
                  {links.map((link, idx) => (
                    <div
                      key={link.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {link.title || 'Untitled Link'}
                          </span>
                          {link.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateLink(link.id, { isPrimary: !link.isPrimary })}
                            className={`text-xs px-2 py-0.5 rounded transition ${
                              link.isPrimary
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {link.isPrimary ? 'Primary Download' : 'Make Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                            title="Delete Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Button Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Download File"
                            value={link.title}
                            onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Destination URL</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                            <select
                              value={link.type || 'other'}
                              onChange={(e) => handleUpdateLink(link.id, { type: e.target.value as ExternalLink['type'] })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                            >
                              <option value="mcaddon">.mcaddon</option>
                              <option value="mcpack">.mcpack</option>
                              <option value="mcworld">.mcworld</option>
                              <option value="mediafire">MediaFire</option>
                              <option value="curseforge">CurseForge</option>
                              <option value="youtube">YouTube</option>
                              <option value="discord">Discord</option>
                              <option value="github">GitHub</option>
                              <option value="website">Website</option>
                              <option value="other">Other Link</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Note (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Recommended"
                              value={link.note || ''}
                              onChange={(e) => handleUpdateLink(link.id, { note: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {links.length === 0 && (
                    <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-400">
                      No links added yet. Click "+ Add Custom Link" or use quick templates above.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddLink()}
                  className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Custom Link</span>
                </button>
              </div>
            )}

            {/* TAB 4: ADVANCED (GUIDES & EXPERIMENTS) */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                {(category === 'addon' || category === 'behavior_pack') && (
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Required Experimental Gameplay Toggles</div>
                        <div className="text-[11px] text-slate-400">
                          Check which Bedrock experimental flags players must turn on in world settings.
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500">Optional (hidden if empty)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {COMMON_EXPERIMENTS.map((exp) => {
                        const isChecked = selectedExperiments.includes(exp);
                        return (
                          <label
                            key={exp}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-purple-950/40 border-purple-400/50 text-purple-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleExperiment(exp)}
                              className="rounded text-purple-500 focus:ring-purple-400 bg-slate-950 border-slate-700"
                            />
                            <span>{exp}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add custom experimental toggle..."
                        value={customExperiment}
                        onChange={(e) => setCustomExperiment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomExperiment();
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomExperiment}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Step-by-Step Installation Guide
                    </label>
                    <span className="text-[11px] text-slate-500">Optional (hidden if empty)</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder={`1. Download the ${currentCategoryMeta.fileFormat} file.\n2. Tap/click to import automatically into Minecraft Bedrock.\n3. Activate in Settings or World options.`}
                    value={installationGuide}
                    onChange={(e) => setInstallationGuide(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-400 resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Changelog / Release Notes
                    </label>
                    <span className="text-[11px] text-slate-500">Optional (hidden if empty)</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={`• Initial public Bedrock release\n• Optimized for smooth mobile performance`}
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-400 resize-y"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: LIVE MEMBER PREVIEW */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>
                    Member View Preview: Any field or unique detail you left blank is strictly hidden!
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  {coverImage && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center p-2">
                      <img src={coverImage} alt="Cover preview" className="w-auto max-w-full h-auto max-h-72 object-contain rounded-lg" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-slate-100">{title || '(Untitled)'}</div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {currentCategoryMeta.label}
                    </span>
                  </div>

                  {tagline.trim() && (
                    <div className="text-sm text-cyan-300">{tagline}</div>
                  )}

                  {/* Unique category preview badges */}
                  {category === 'map' && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {hasContent(mapGameMode) && <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">Mode: {mapGameMode}</span>}
                      {hasContent(mapCoordinates) && <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Spawn: {mapCoordinates}</span>}
                      {hasContent(mapPlayerCount) && <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{mapPlayerCount}</span>}
                      {hasContent(mapDifficulty) && <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{mapDifficulty}</span>}
                    </div>
                  )}

                  {category === 'resource_pack' && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {hasContent(textureResolution) && <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">{textureResolution}</span>}
                      {hasContent(textureStyle) && <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Style: {textureStyle}</span>}
                    </div>
                  )}

                  {category === 'shader' && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {hasContent(shaderRenderEngine) && <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">{shaderRenderEngine}</span>}
                      {hasContent(shaderPerformance) && <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{shaderPerformance}</span>}
                    </div>
                  )}

                  {category === 'skin_pack' && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {hasContent(skinCount) && <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">{skinCount}</span>}
                      {hasContent(skinModelType) && <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{skinModelType}</span>}
                    </div>
                  )}

                  {(category === 'addon' || category === 'behavior_pack') && hasContent(entityCount) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">{entityCount}</span>
                    </div>
                  )}

                  {/* Core badges */}
                  {(version.trim() || bedrockVersion.trim() || fileSize.trim()) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {version.trim() && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {version}
                        </span>
                      )}
                      {bedrockVersion.trim() && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                          MC Bedrock {bedrockVersion}
                        </span>
                      )}
                      {fileSize.trim() && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {fileSize}
                        </span>
                      )}
                    </div>
                  )}

                  {description.trim() && (
                    <div className="text-xs text-slate-300 whitespace-pre-line p-3 rounded-lg bg-slate-900 border border-slate-800">
                      {description}
                    </div>
                  )}

                  {screenshots.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-semibold text-slate-400">Screenshots ({screenshots.length}):</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {screenshots.map((shot, idx) => (
                          <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-slate-800">
                            <img src={shot} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="p-4 md:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 hidden sm:block">
              {isEditing ? 'Changes will be saved immediately' : 'Will be visible to all members upon publish'}
            </div>

            {isEditing && onDelete && initialAddon && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialAddon);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 mr-auto"
                title="Delete this addon permanently"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Add-on</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel / Go Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : `Publish ${currentCategoryMeta.shortTag}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Category Picker Modal */}
      <CategoryPickerModal
        isOpen={isCategoryPickerOpen}
        onClose={() => setIsCategoryPickerOpen(false)}
        currentCategory={category}
        onSelectCategory={(newCat) => {
          setCategory(newCat);
        }}
      />
    </>
  );
};
