export type AddonCategory = 
  | 'addon'
  | 'resource_pack'
  | 'behavior_pack'
  | 'map'
  | 'shader'
  | 'skin_pack';

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  type?: 'mcaddon' | 'mcpack' | 'mcworld' | 'mediafire' | 'curseforge' | 'youtube' | 'discord' | 'github' | 'website' | 'other';
  note?: string;
  isPrimary?: boolean;
}

// Comments on addons
export interface AddonComment {
  id: string;
  addonId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  createdAt: number;
}

export type UserRole = 'owner' | 'admin' | 'visitor';

export interface OwnerLiveConfig {
  tagText: string;
  tagColor: string; // default emerald green
  customLogoUrl?: string; // 1x1 image or custom logo
}

// User Profile for members
export interface MemberUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  password?: string;
  pinCode?: string; // 6-digit pin code
  isSaferPin?: boolean; // Tagged as 'safer'
  avatar: string;
  joinedAt: number;
  isBanned?: boolean;
  role?: UserRole;
  tagColor?: string;
}

// Live visitor tracking
export interface VisitorPresence {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: number;
  isBanned: boolean;
  device: string;
  joinedAt: number;
  role: UserRole;
  tagText: string;
  tagColor: string;
  customLogoUrl?: string;
  isSignedIn?: boolean;
}

// App Status & Developer Controls
export interface AppStatusConfig {
  isClosed: boolean;
  closedMessage: string;
  lastOpenedAt: number;
  hasNotifiedOpen: boolean;
  appIconType: 'prism' | 'emerald' | 'netherite' | 'ender' | 'command' | 'apple' | 'custom';
  customIconUrl?: string;
  loadingScreenImageUrl?: string; // Custom photo for loading screen (affects all visitors)
  loadingScreenTitle?: string;
  loadingScreenSubtitle?: string;
  loadingScreenDuration?: number; // Duration in seconds
  downloadDelay?: number; // Delay in seconds for download buttons
}

// Kick with timeout duration & custom warning message
export interface KickRecord {
  visitorId: string;
  username: string;
  kickedAt: number;
  durationSeconds: number; // Duration of timeout
  expiresAt: number;
  customMessage: string; // Warning message from developer
}

// Inappropriate reports sent to developer
export interface InappropriateReport {
  id: string;
  targetType: 'comment' | 'addon' | 'visitor';
  targetId: string;
  targetTitleOrSnippet: string;
  reportedUserId: string;
  reportedUsername: string;
  reporterId: string;
  reporterUsername?: string;
  reason: string;
  createdAt: number;
  resolved?: boolean;
}

// Custom rules created by developer
export interface CommunityRule {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

// User Download History
export interface DownloadHistoryItem {
  id: string;
  addonId: string;
  title: string;
  category: AddonCategory;
  fileFormat?: string;
  version?: string;
  linkUrl?: string;
  downloadedAt: number;
}

export type ThemeMode = 'dark' | 'light';
export type TextFontPreference = 'basic' | 'minecraft';

// Unique details for World / Adventure Map
export interface MapDetails {
  gameMode?: string;
  spawnCoordinates?: string;
  playerCount?: string;
  difficulty?: string;
}

// Unique details for Texture / Resource Pack
export interface TextureDetails {
  resolution?: string;
  style?: string;
  subpackInfo?: string;
}

// Unique details for Shader / Visual Pack
export interface ShaderDetails {
  renderEngine?: string;
  performanceLevel?: string;
  supportedDevices?: string;
  visualHighlights?: string;
}

// Unique details for Skin Pack
export interface SkinPackDetails {
  skinCount?: string;
  modelType?: string;
  theme?: string;
}

// Unique details for Add-on / Behavior Pack
export interface AddonSpecificDetails {
  entityCount?: string;
  customCommands?: string;
}

export interface BedrockAddon {
  id: string;
  title: string;
  category: AddonCategory;
  tagline?: string;
  description?: string;
  version?: string;
  bedrockVersion?: string;
  fileSize?: string;
  coverImage?: string;
  gallery?: string[];
  author?: string;
  authorRole?: string;
  links: ExternalLink[];
  tags?: string[];
  installationGuide?: string;
  requiredExperiments?: string[];
  changelog?: string;
  featured?: boolean;
  downloadCount?: number; // Total downloads tracking
  createdAt: number;
  updatedAt: number;

  // File Download attachment & type
  downloadFileType?: string; // e.g. '.mcaddon', '.mcpack', '.mcworld', '.zip'
  attachedFileName?: string;
  attachedFileData?: string;
  attachedFileSize?: string;

  // Category-specific details
  mapDetails?: MapDetails;
  textureDetails?: TextureDetails;
  shaderDetails?: ShaderDetails;
  skinPackDetails?: SkinPackDetails;
  addonDetails?: AddonSpecificDetails;
}

export const CATEGORY_LABELS: Record<AddonCategory, { label: string; icon: string; shortTag: string; description: string; fileFormat: string; color: string }> = {
  addon: {
    label: 'Add-on (Combined)',
    icon: 'Package',
    shortTag: 'Add-on',
    description: 'Custom entities, items, mobs, and mechanics combined (.mcaddon)',
    fileFormat: '.mcaddon',
    color: 'emerald',
  },
  behavior_pack: {
    label: 'Behavior Pack',
    icon: 'Cpu',
    shortTag: 'Behavior',
    description: 'Custom game logic, entity components, scripting, and loot tables (.mcpack)',
    fileFormat: '.mcpack',
    color: 'amber',
  },
  map: {
    label: 'World & Adventure Map',
    icon: 'Map',
    shortTag: 'World Map',
    description: 'Survival spawns, parkour, adventure campaigns, and minigames (.mcworld)',
    fileFormat: '.mcworld',
    color: 'rose',
  },
  resource_pack: {
    label: 'Texture & Resource Pack',
    icon: 'Palette',
    shortTag: 'Texture Pack',
    description: 'Resolution textures (16x/64x/128x), dark UI redesigns, and sound packs (.mcpack)',
    fileFormat: '.mcpack',
    color: 'cyan',
  },
  shader: {
    label: 'Shader & Render Pack',
    icon: 'Sparkles',
    shortTag: 'Shader',
    description: 'Render Dragon lighting, deferred shading, vibrant skies, and water caustics',
    fileFormat: '.mcpack',
    color: 'purple',
  },
  skin_pack: {
    label: 'Skin Pack',
    icon: 'User',
    shortTag: 'Skin Pack',
    description: 'Curated HD character skin collections with Classic or Slim Alex models (.mcpack)',
    fileFormat: '.mcpack',
    color: 'indigo',
  },
};

export const COMMON_EXPERIMENTS = [
  'Holiday Creator Features',
  'Custom Biomes',
  'Upcoming Creator Features',
  'Beta APIs',
  'Molang Features',
  'Villager Trade Rebalance',
  'Vanilla Experiments',
];

export const SUGGESTED_PRISM_NAMES = [
  { name: 'PrismMods Bedrock', subtitle: 'The Premier Minecraft Bedrock Addon Hub', desc: 'Clean, definitive title focused specifically on Bedrock Edition.' },
  { name: 'PrismMods Studio', subtitle: 'Official Creator & Mod Workshop', desc: 'Highlights your personal creation studio and curated works.' },
  { name: 'PrismMods MCPE', subtitle: 'Mobile & Bedrock Showcase Hub', desc: 'Recognized classic naming for Pocket Edition & Bedrock players.' },
  { name: 'PrismMods Vault', subtitle: 'Curated Bedrock Addons & Resource Packs', desc: 'Evokes an exclusive, safe vault of handcrafted modifications.' },
  { name: 'PrismMods Craft', subtitle: 'Bedrock Add-ons, Maps & Shaders', desc: 'Craft-centric branding that fits the Minecraft universe seamlessly.' },
  { name: 'PrismMods Nexus', subtitle: 'The Central Bridge for Bedrock Players', desc: 'Futuristic, connected feel for all download mirrors and updates.' },
];
