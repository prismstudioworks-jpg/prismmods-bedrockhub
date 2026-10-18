export const OFFLINE_MODE = true; // Cuts off external server usage

import { 
  BedrockAddon, ExternalLink, AddonComment, 
  MemberUser, VisitorPresence, AppStatusConfig, 
  OwnerLiveConfig, UserRole, KickRecord,
  InappropriateReport, CommunityRule, DownloadHistoryItem,
  ThemeMode, AddonCategory, TextFontPreference
} from '../types/addon';
import { getMinecraftCharacterAvatar } from './minecraftAvatars';

const STORAGE_KEY_ADDONS = 'prismmods_addons_v4';
const STORAGE_KEY_TITLE = 'prismmods_active_title';
const STORAGE_KEY_BOOKMARKS = 'prismmods_bookmarks';
const STORAGE_KEY_DEV_SESSION = 'prismmods_dev_session';
const STORAGE_KEY_COMMENTS = 'prismmods_comments_v1';
const STORAGE_KEY_CURRENT_MEMBER = 'prismmods_active_member';
const STORAGE_KEY_MEMBERS = 'prismmods_all_members';
const STORAGE_KEY_VISITORS = 'prismmods_live_visitors_v2';
const STORAGE_KEY_BANNED_IDS = 'prismmods_banned_visitors';
const STORAGE_KEY_APP_STATUS = 'prismmods_app_status_v1';
const STORAGE_KEY_KICKED_TOKEN = 'prismmods_kicked_token';
const STORAGE_KEY_ADMIN_IDS = 'prismmods_admin_visitor_ids';
const STORAGE_KEY_OWNER_CONFIG = 'prismmods_owner_live_config';
const STORAGE_KEY_ADMIN_COLORS = 'prismmods_admin_custom_colors';
const STORAGE_KEY_THEME_MODE = 'prismmods_theme_mode';
const STORAGE_KEY_FONT_PREFERENCE = 'prismmods_font_preference';
const STORAGE_KEY_KICK_RECORDS = 'prismmods_kick_records_v2';
const STORAGE_KEY_REPORTS = 'prismmods_inappropriate_reports';
const STORAGE_KEY_RULES = 'prismmods_community_rules';
const STORAGE_KEY_DOWNLOAD_HISTORY = 'prismmods_download_history';
const STORAGE_KEY_SAVED_ACCOUNTS = 'prismmods_saved_accounts_v1';

// Broadcast channel for multi-tab live sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('prismmods_live_channel');
  }
} catch {}

export function broadcastAppEvent(type: string, payload?: any): void {
  try {
    broadcastChannel?.postMessage({ type, payload, timestamp: Date.now() });
  } catch {}
}

export function subscribeToLiveEvents(handler: (event: { type: string; payload: any }) => void): () => void {
  if (!broadcastChannel) return () => {};
  const listener = (msg: MessageEvent) => {
    if (msg.data) handler(msg.data);
  };
  broadcastChannel.addEventListener('message', listener);
  return () => {
    broadcastChannel?.removeEventListener('message', listener);
  };
}

export function isDeveloperEnvironment(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    const isDevHost = host.includes('ais-dev') || host === 'localhost' || host === '127.0.0.1';
    const params = new URLSearchParams(window.location.search);
    const hasDevQuery = params.has('dev') || params.has('creator') || params.has('manage') || params.has('admin');

    let isOwnerEmail = false;
    try {
      const rawMem = localStorage.getItem(STORAGE_KEY_CURRENT_MEMBER);
      if (rawMem) {
        const mem = JSON.parse(rawMem);
        if (mem?.email === 'altaxx39@gmail.com') {
          isOwnerEmail = true;
        }
      }
    } catch {}

    if (isDevHost || hasDevQuery || isOwnerEmail) {
      localStorage.setItem(STORAGE_KEY_DEV_SESSION, 'true');
      return true;
    }

    return localStorage.getItem(STORAGE_KEY_DEV_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setDeveloperSession(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEV_SESSION, enabled ? 'true' : 'false');
    broadcastAppEvent('DEV_SESSION_CHANGE', enabled);
  } catch {}
}

export function getStoredAddons(): BedrockAddon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADDONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ADDONS, JSON.stringify(SAMPLE_STARTER_ADDONS));
      return SAMPLE_STARTER_ADDONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_STARTER_ADDONS;
  } catch (err) {
    console.error('Failed to parse addons from storage', err);
    return SAMPLE_STARTER_ADDONS;
  }
}

export function saveStoredAddons(addons: BedrockAddon[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADDONS, JSON.stringify(addons));
    broadcastAppEvent('ADDONS_UPDATED', addons);
  } catch (err) {
    console.error('Failed to save addons to storage', err);
  }
}

// Download count increments
export function incrementAddonDownloads(addonId: string): number {
  try {
    const addons = getStoredAddons();
    let newCount = 1;
    const updated = addons.map((addon) => {
      if (addon.id === addonId) {
        newCount = (addon.downloadCount || 0) + 1;
        return { ...addon, downloadCount: newCount };
      }
      return addon;
    });
    saveStoredAddons(updated);
    broadcastAppEvent('DOWNLOAD_INCREMENTED', { addonId, newCount });
    return newCount;
  } catch {
    return 1;
  }
}

// App Status (Open / Close maintenance & App Icon)
export const DEFAULT_APP_STATUS: AppStatusConfig = {
  isClosed: false,
  closedMessage: 'Sorry, because our app is having problems and it is closing',
  lastOpenedAt: Date.now(),
  hasNotifiedOpen: true,
  appIconType: 'prism',
  loadingScreenImageUrl: '',
  loadingScreenTitle: 'PrismMods Bedrock Hub',
  loadingScreenSubtitle: 'Loading resources, behavior packs & terrain...',
  loadingScreenDuration: 5,
  downloadDelay: 0,
};

export function getAppStatus(): AppStatusConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APP_STATUS);
    if (!raw) return DEFAULT_APP_STATUS;
    return { ...DEFAULT_APP_STATUS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_APP_STATUS;
  }
}

export function setAppStatus(updates: Partial<AppStatusConfig>): AppStatusConfig {
  try {
    const current = getAppStatus();
    const updated: AppStatusConfig = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_APP_STATUS, JSON.stringify(updated));
    broadcastAppEvent('APP_STATUS_CHANGED', updated);
    return updated;
  } catch {
    return DEFAULT_APP_STATUS;
  }
}

// Comments Management
export function getStoredComments(addonId?: string): AddonComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMENTS);
    if (!raw) return [];
    const all: AddonComment[] = JSON.parse(raw);
    if (!Array.isArray(all)) return [];
    return addonId ? all.filter((c) => c.addonId === addonId) : all;
  } catch {
    return [];
  }
}

export function addStoredComment(comment: Omit<AddonComment, 'id' | 'createdAt'>): AddonComment {
  const newComment: AddonComment = {
    ...comment,
    id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    createdAt: Date.now(),
  };
  try {
    const all = getStoredComments();
    const updated = [newComment, ...all];
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(updated));
    broadcastAppEvent('COMMENT_ADDED', newComment);
  } catch {}
  return newComment;
}

export function deleteStoredComment(commentId: string): void {
  try {
    const all = getStoredComments();
    const updated = all.filter((c) => c.id !== commentId);
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(updated));
    broadcastAppEvent('COMMENT_DELETED', commentId);
  } catch {}
}

// Member Authentication
export function getCurrentMember(): MemberUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_MEMBER);
    if (!raw) return null;
    const member: MemberUser = JSON.parse(raw);
    if (member && member.avatar && (member.avatar.includes('bottts') || member.avatar.includes('dicebear'))) {
      member.avatar = getMinecraftCharacterAvatar(member.username || member.email);
      localStorage.setItem(STORAGE_KEY_CURRENT_MEMBER, JSON.stringify(member));
    }
    return member;
  } catch {
    return null;
  }
}

export function setCurrentMember(member: MemberUser | null): void {
  try {
    if (member) {
      localStorage.setItem(STORAGE_KEY_CURRENT_MEMBER, JSON.stringify(member));
      // Also register in all members list
      const allMembers = getStoredMembers();
      if (!allMembers.some((m) => m.id === member.id)) {
        localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify([member, ...allMembers]));
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_MEMBER);
    }
    broadcastAppEvent('MEMBER_AUTH_CHANGE', member);
  } catch {}
}

export function getStoredMembers(): MemberUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Owner Live Status Configuration
export const DEFAULT_OWNER_CONFIG: OwnerLiveConfig = {
  tagText: 'Owner',
  tagColor: '#10b981', // green
  customLogoUrl: '', // 1x1 image
};

export function getOwnerLiveConfig(): OwnerLiveConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OWNER_CONFIG);
    return raw ? { ...DEFAULT_OWNER_CONFIG, ...JSON.parse(raw) } : DEFAULT_OWNER_CONFIG;
  } catch {
    return DEFAULT_OWNER_CONFIG;
  }
}

export function setOwnerLiveConfig(updates: Partial<OwnerLiveConfig>): OwnerLiveConfig {
  try {
    const current = getOwnerLiveConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_OWNER_CONFIG, JSON.stringify(updated));
    broadcastAppEvent('OWNER_CONFIG_CHANGED', updated);
    return updated;
  } catch {
    return DEFAULT_OWNER_CONFIG;
  }
}

// Admin Visitor IDs (Developer can promote visitors to Admin)
export function getAdminVisitorIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setVisitorAdminRole(visitorId: string, isAdmin: boolean): void {
  try {
    const current = getAdminVisitorIds();
    const updated = isAdmin
      ? Array.from(new Set([...current, visitorId]))
      : current.filter((id) => id !== visitorId);
    localStorage.setItem(STORAGE_KEY_ADMIN_IDS, JSON.stringify(updated));
    broadcastAppEvent('VISITOR_ADMIN_CHANGED', { visitorId, isAdmin });
  } catch {}
}

export function isCurrentVisitorAdmin(): boolean {
  try {
    const myId = getDeviceId();
    const admins = getAdminVisitorIds();
    return admins.includes(myId);
  } catch {
    return false;
  }
}

export function isVisitorAdmin(visitorId?: string): boolean {
  try {
    const targetId = visitorId || getDeviceId();
    const admins = getAdminVisitorIds();
    return admins.includes(targetId);
  } catch {
    return false;
  }
}

// Admin custom tag colors (Admins can customize their tag color)
export function getAdminTagColor(visitorId: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_COLORS);
    const map = raw ? JSON.parse(raw) : {};
    return map[visitorId] || '#38bdf8'; // default cyan
  } catch {
    return '#38bdf8';
  }
}

export function setAdminTagColor(visitorId: string, color: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_COLORS);
    const map = raw ? JSON.parse(raw) : {};
    map[visitorId] = color;
    localStorage.setItem(STORAGE_KEY_ADMIN_COLORS, JSON.stringify(map));
    broadcastAppEvent('ADMIN_COLOR_CHANGED', { visitorId, color });
  } catch {}
}

// Live Visitor Presence Tracking
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem('prismmods_device_id');
    if (!id) {
      id = 'vis-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('prismmods_device_id', id);
    }
    return id;
  } catch {
    return 'vis-guest';
  }
}

export function getVisitorsList(): VisitorPresence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISITORS);
    let list: VisitorPresence[] = raw ? JSON.parse(raw) : [];
    const banned = getBannedVisitorIds();
    const adminIds = getAdminVisitorIds();
    const ownerConfig = getOwnerLiveConfig();
    const now = Date.now();
    const myId = getDeviceId();
    const isDev = isDeveloperEnvironment();

    if (list.length === 0) {
      list = [
        {
          id: myId,
          username: isDev ? 'Owner' : 'Visitor_' + myId.slice(-4),
          avatar: isDev ? getMinecraftCharacterAvatar('steve') : getMinecraftCharacterAvatar(myId),
          isOnline: true,
          lastSeen: now,
          isBanned: false,
          device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop / PC',
          joinedAt: now - 1800000,
          role: isDev ? 'owner' : 'visitor',
          tagText: isDev ? ownerConfig.tagText : 'Visitor',
          tagColor: isDev ? ownerConfig.tagColor : '#64748b',
          customLogoUrl: isDev ? ownerConfig.customLogoUrl : '',
        },
      ];
      localStorage.setItem(STORAGE_KEY_VISITORS, JSON.stringify(list));
    }

    return list.map((v) => {
      const isOnline = (now - v.lastSeen) < 45000;
      const isBanned = banned.includes(v.id);
      const isOwnerUser = (v.id === myId && isDev) || v.role === 'owner';
      const isAdminUser = !isOwnerUser && adminIds.includes(v.id);

      let role: UserRole = 'visitor';
      let tagText = 'Visitor';
      let tagColor = '#64748b';
      let customLogoUrl = '';

      if (isOwnerUser) {
        role = 'owner';
        tagText = ownerConfig.tagText || 'Owner';
        tagColor = ownerConfig.tagColor || '#10b981';
        customLogoUrl = ownerConfig.customLogoUrl || '';
      } else if (isAdminUser) {
        role = 'admin';
        tagText = 'Admin';
        tagColor = getAdminTagColor(v.id) || '#38bdf8';
      }

      return {
        ...v,
        isOnline,
        isBanned,
        role,
        tagText,
        tagColor,
        customLogoUrl,
      };
    });
  } catch {
    return [];
  }
}

export function heartbeatVisitor(user?: MemberUser | null): void {
  try {
    const deviceId = getDeviceId();
    const now = Date.now();
    const currentList = getVisitorsList();
    const banned = getBannedVisitorIds();
    const adminIds = getAdminVisitorIds();
    const isDev = isDeveloperEnvironment();
    const ownerConfig = getOwnerLiveConfig();

    const isOwner = isDev;
    const isAdmin = !isOwner && adminIds.includes(deviceId);
    const role: UserRole = isOwner ? 'owner' : isAdmin ? 'admin' : 'visitor';
    const tagText = isOwner ? ownerConfig.tagText : isAdmin ? 'Admin' : 'Visitor';
    const tagColor = isOwner ? ownerConfig.tagColor : isAdmin ? getAdminTagColor(deviceId) : '#64748b';
    const customLogoUrl = isOwner ? ownerConfig.customLogoUrl : '';

    let username = user?.username;
    if (!username) {
      username = isOwner ? 'Owner' : 'Visitor_' + deviceId.slice(-4);
    }
    const avatar = user?.avatar || getMinecraftCharacterAvatar(deviceId);

    const existingIndex = currentList.findIndex((v) => v.id === deviceId);
    let updatedList: VisitorPresence[];

    const isSignedIn = !!user || isOwner;

    const updatedItem: VisitorPresence = {
      id: deviceId,
      username,
      avatar,
      isOnline: true,
      lastSeen: now,
      isBanned: banned.includes(deviceId),
      device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop / PC',
      joinedAt: existingIndex >= 0 ? currentList[existingIndex].joinedAt : now,
      role,
      tagText,
      tagColor,
      customLogoUrl,
      isSignedIn,
    };

    if (existingIndex >= 0) {
      updatedList = currentList.map((v) => (v.id === deviceId ? updatedItem : v));
    } else {
      updatedList = [updatedItem, ...currentList];
    }

    localStorage.setItem(STORAGE_KEY_VISITORS, JSON.stringify(updatedList));
  } catch {}
}

export function getBannedVisitorIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BANNED_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function banVisitor(visitorId: string, shouldBan: boolean): void {
  try {
    const current = getBannedVisitorIds();
    const updated = shouldBan
      ? Array.from(new Set([...current, visitorId]))
      : current.filter((id) => id !== visitorId);
    localStorage.setItem(STORAGE_KEY_BANNED_IDS, JSON.stringify(updated));
    broadcastAppEvent('VISITOR_BANNED', { visitorId, isBanned: shouldBan });
  } catch {}
}

// Kick with duration and custom warning message
export function kickVisitorWithTimeout(
  visitorId: string, 
  durationSeconds: number, 
  customMessage: string,
  username?: string
): KickRecord {
  const now = Date.now();
  const record: KickRecord = {
    visitorId,
    username: username || 'Visitor',
    kickedAt: now,
    durationSeconds: Math.max(10, durationSeconds),
    expiresAt: now + (Math.max(10, durationSeconds) * 1000),
    customMessage: customMessage.trim() || 'You have been kicked for violating community standards.',
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_KICK_RECORDS);
    const map: Record<string, KickRecord> = raw ? JSON.parse(raw) : {};
    map[visitorId] = record;
    localStorage.setItem(STORAGE_KEY_KICK_RECORDS, JSON.stringify(map));
    localStorage.setItem(STORAGE_KEY_KICKED_TOKEN + '_' + visitorId, JSON.stringify(record));
    broadcastAppEvent('VISITOR_KICKED', record);
  } catch {}

  return record;
}

export function kickVisitor(visitorId: string, customMessage?: string): void {
  kickVisitorWithTimeout(visitorId, 60, customMessage || 'Session disconnected by developer.');
}

export function getKickRecord(visitorId: string): KickRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KICK_RECORDS);
    const map: Record<string, KickRecord> = raw ? JSON.parse(raw) : {};
    const rec = map[visitorId];
    if (rec && Date.now() < rec.expiresAt) {
      return rec;
    }
    return null;
  } catch {
    return null;
  }
}

export function checkIsKicked(): KickRecord | null {
  try {
    const myId = getDeviceId();
    const raw = localStorage.getItem(STORAGE_KEY_KICK_RECORDS);
    const map: Record<string, KickRecord> = raw ? JSON.parse(raw) : {};
    const rec = map[myId];
    if (rec) {
      if (Date.now() < rec.expiresAt) {
        return rec;
      } else {
        // Expired! Clear kick record
        delete map[myId];
        localStorage.setItem(STORAGE_KEY_KICK_RECORDS, JSON.stringify(map));
        localStorage.removeItem(STORAGE_KEY_KICKED_TOKEN + '_' + myId);
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function clearKickRecord(visitorId?: string): void {
  try {
    const targetId = visitorId || getDeviceId();
    const raw = localStorage.getItem(STORAGE_KEY_KICK_RECORDS);
    const map: Record<string, KickRecord> = raw ? JSON.parse(raw) : {};
    delete map[targetId];
    localStorage.setItem(STORAGE_KEY_KICK_RECORDS, JSON.stringify(map));
    localStorage.removeItem(STORAGE_KEY_KICKED_TOKEN + '_' + targetId);
    broadcastAppEvent('VISITOR_KICK_CLEARED', { visitorId: targetId });
  } catch {}
}

export function isCurrentVisitorBanned(): boolean {
  try {
    const myId = getDeviceId();
    const banned = getBannedVisitorIds();
    return banned.includes(myId);
  } catch {
    return false;
  }
}

export function getBrandTitle(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_TITLE) || 'PrismMods Bedrock';
  } catch {
    return 'PrismMods Bedrock';
  }
}

export function setBrandTitle(title: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_TITLE, title);
    broadcastAppEvent('TITLE_CHANGED', title);
  } catch {}
}

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleStoredBookmark(id: string): string[] {
  try {
    const current = getStoredBookmarks();
    const updated = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function hasContent(val?: string | null): boolean {
  return typeof val === 'string' && val.trim().length > 0;
}

export function hasArrayContent<T>(arr?: T[] | null): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

export function getValidLinks(links?: ExternalLink[]): ExternalLink[] {
  if (!Array.isArray(links)) return [];
  return links.filter((l) => hasContent(l.title) && hasContent(l.url));
}

// Theme Mode (Independent per device/phone)
export function getThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME_MODE);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark'; // default dark mode for Minecraft styling
  } catch {
    return 'dark';
  }
}

export function setThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME_MODE, mode);
    if (typeof document !== 'undefined') {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
    broadcastAppEvent('THEME_CHANGED', mode);
  } catch {}
}

// Text Font Preference (Basic style vs Minecraft style font)
export function getFontPreference(): TextFontPreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FONT_PREFERENCE);
    if (saved === 'minecraft' || saved === 'basic') {
      return saved;
    }
    return 'basic';
  } catch {
    return 'basic';
  }
}

export function setFontPreference(font: TextFontPreference): void {
  try {
    localStorage.setItem(STORAGE_KEY_FONT_PREFERENCE, font);
    if (typeof document !== 'undefined') {
      if (font === 'minecraft') {
        document.body.classList.add('font-minecraft');
        document.body.classList.remove('font-basic');
      } else {
        document.body.classList.remove('font-minecraft');
        document.body.classList.add('font-basic');
      }
    }
    broadcastAppEvent('FONT_CHANGED', font);
  } catch {}
}

// Inappropriate Reports (Sent directly to developer)
export function submitInappropriateReport(report: {
  targetType: 'comment' | 'addon' | 'visitor';
  targetId: string;
  targetTitleOrSnippet: string;
  reportedUserId: string;
  reportedUsername: string;
  reason: string;
}): InappropriateReport {
  const reporterId = getDeviceId();
  const currentMember = getCurrentMember();
  const newReport: InappropriateReport = {
    id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...report,
    reporterId,
    reporterUsername: currentMember?.username || 'Visitor_' + reporterId.slice(-4),
    createdAt: Date.now(),
    resolved: false,
  };

  try {
    const reports = getInappropriateReports();
    const updated = [newReport, ...reports];
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
    broadcastAppEvent('NEW_REPORT_SUBMITTED', newReport);
  } catch {}

  return newReport;
}

export function getInappropriateReports(): InappropriateReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function resolveInappropriateReport(id: string): void {
  try {
    const reports = getInappropriateReports();
    const updated = reports.map((r) => (r.id === id ? { ...r, resolved: true } : r));
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
    broadcastAppEvent('REPORT_RESOLVED', id);
  } catch {}
}

export function deleteInappropriateReport(id: string): void {
  try {
    const reports = getInappropriateReports();
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
    broadcastAppEvent('REPORT_DELETED', id);
  } catch {}
}

// Developer Community Rules
export const DEFAULT_COMMUNITY_RULES: CommunityRule[] = [
  {
    id: 'rule-1',
    title: 'Respect All Members & Creators',
    description: 'Keep discussions polite and constructive. Harassment, hateful speech, or toxic conduct will result in an immediate kick or ban.',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'rule-2',
    title: 'No Inappropriate Content or Malicious Links',
    description: 'Any explicit comments, spam bots, phishing urls, or deceptive download links are strictly prohibited and flagged for immediate developer moderation.',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'rule-3',
    title: 'Credit Original Bedrock Creators',
    description: 'Never claim other creators work as your own. Always link the original author and provide legitimate download mirrors.',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'rule-4',
    title: 'Follow Bedrock Version Compatibility',
    description: 'Ensure add-on links and instructions match specified Minecraft Bedrock versions (1.20, 1.21+) so players do not break their game saves.',
    createdAt: Date.now() - 86400000 * 5,
  },
];

export function getCommunityRules(): CommunityRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(DEFAULT_COMMUNITY_RULES));
      return DEFAULT_COMMUNITY_RULES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COMMUNITY_RULES;
  }
}

export function saveCommunityRules(rules: CommunityRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
    broadcastAppEvent('RULES_UPDATED', rules);
  } catch {}
}

export function addCommunityRule(title: string, description: string): CommunityRule {
  const newRule: CommunityRule = {
    id: 'rule_' + Date.now(),
    title: title.trim(),
    description: description.trim(),
    createdAt: Date.now(),
  };
  const current = getCommunityRules();
  const updated = [...current, newRule];
  saveCommunityRules(updated);
  return newRule;
}

export function deleteCommunityRule(ruleId: string): void {
  const current = getCommunityRules();
  const updated = current.filter((r) => r.id !== ruleId);
  saveCommunityRules(updated);
}

// Download History Tracking
export function getDownloadHistory(): DownloadHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOWNLOAD_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDownloadHistory(item: {
  addonId: string;
  title: string;
  category: AddonCategory;
  fileFormat?: string;
  version?: string;
  linkUrl?: string;
}): void {
  try {
    const current = getDownloadHistory();
    // Filter out if downloaded the same addon recently to avoid spam duplicates, or prepend
    const newItem: DownloadHistoryItem = {
      id: 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      ...item,
      downloadedAt: Date.now(),
    };
    const updated = [newItem, ...current.slice(0, 49)]; // keep latest 50
    localStorage.setItem(STORAGE_KEY_DOWNLOAD_HISTORY, JSON.stringify(updated));
    broadcastAppEvent('DOWNLOAD_HISTORY_UPDATED', newItem);
  } catch {}
}

export function clearDownloadHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DOWNLOAD_HISTORY);
    broadcastAppEvent('DOWNLOAD_HISTORY_UPDATED', null);
  } catch {}
}

// Saved Accounts for Login vs Sign in (Create Account)
export function getSavedAccounts(): MemberUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_ACCOUNTS);
    if (!raw) return [];
    const accounts: MemberUser[] = JSON.parse(raw);
    if (!Array.isArray(accounts)) return [];
    return accounts.map((acc) => {
      if (acc.avatar && (acc.avatar.includes('bottts') || acc.avatar.includes('dicebear'))) {
        return {
          ...acc,
          avatar: getMinecraftCharacterAvatar(acc.username || acc.email),
        };
      }
      return acc;
    });
  } catch {
    return [];
  }
}

export function saveAccount(user: MemberUser): void {
  try {
    const current = getSavedAccounts();
    const existingIndex = current.findIndex((u) => u.username.toLowerCase() === user.username.toLowerCase());
    let updated: MemberUser[];
    if (existingIndex >= 0) {
      updated = current.map((u, i) => (i === existingIndex ? user : u));
    } else {
      updated = [user, ...current];
    }
    localStorage.setItem(STORAGE_KEY_SAVED_ACCOUNTS, JSON.stringify(updated));
  } catch {}
}

export function removeSavedAccount(id: string): void {
  try {
    const current = getSavedAccounts();
    const updated = current.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVED_ACCOUNTS, JSON.stringify(updated));
  } catch {}
}

export function findAccountByEmailOrUsername(query: string): MemberUser | undefined {
  const accounts = getSavedAccounts();
  const q = query.trim().toLowerCase();
  return accounts.find((a) => (a.email && a.email.toLowerCase() === q) || a.username.toLowerCase() === q);
}

export function sendPinRecoveryEmail(email: string): { success: boolean; pin: string; message: string } {
  const accounts = getSavedAccounts();
  const found = accounts.find((a) => a.email && a.email.toLowerCase() === email.trim().toLowerCase());
  if (found && found.pinCode) {
    return {
      success: true,
      pin: found.pinCode,
      message: `Your 6-digit PIN code has been sent to ${email}`,
    };
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    success: true,
    pin: code,
    message: `Your 6-digit PIN code has been sent to ${email}`,
  };
}

// Sample starter addons
export const SAMPLE_STARTER_ADDONS: BedrockAddon[] = [
  {
    id: 'prism-starter-1',
    title: 'Aetheria: Elemental Magic & Relics',
    category: 'addon',
    tagline: 'Staff casting, elemental shrines, and mythic boss battles in Bedrock Edition.',
    description: 'A complete magic overhaul crafted specifically for Minecraft Bedrock. Discover spellbound Tomes, craft runic staves, and confront elemental guardians that awaken in ancient ruins during thunderstorm events.\n\nIncludes custom particle effects, unique sound design, and balanced survival progression without replacing vanilla mechanics.',
    version: 'v2.1.0',
    bedrockVersion: '1.21.0+',
    fileSize: '14.2 MB',
    downloadCount: 124,
    addonDetails: {
      entityCount: '16 Custom Entities & 8 Runic Staves',
      customCommands: '/function aetheria_give_all',
    },
    links: [
      {
        id: 'link-1',
        title: 'Direct .mcaddon Download',
        url: 'https://example.com/downloads/aetheria-v2.1.0.mcaddon',
        type: 'mcaddon',
        note: 'Complete Pack (BP + RP)',
        isPrimary: true,
      },
      {
        id: 'link-2',
        title: 'CurseForge Mirror',
        url: 'https://curseforge.com/minecraft-bedrock/addons/aetheria',
        type: 'curseforge',
      },
      {
        id: 'link-3',
        title: 'Official Discord Community',
        url: 'https://discord.gg/minecraft',
        type: 'discord',
        note: 'Bug reports & sneak peeks',
      },
      {
        id: 'link-4',
        title: 'YouTube Showcase & Guide',
        url: 'https://youtube.com',
        type: 'youtube',
      },
    ],
    tags: ['Magic', 'Spells', 'Bosses', 'Survival', 'PVE'],
    requiredExperiments: ['Holiday Creator Features', 'Beta APIs', 'Upcoming Creator Features'],
    installationGuide: '1. Download the .mcaddon file from the link above.\n2. Tap or double-click the file to open directly in Minecraft Bedrock.\n3. Create or edit your World.\n4. Enable both the Behavior Pack and Resource Pack under Add-Ons.\n5. Enable the required Experimental Gameplay toggles listed above.',
    changelog: '• Added 4 new elemental staves (Frost, Tempest, Earth, Flare)\n• Rebalanced mana regeneration rate in survival\n• Fixed entity collision during multiplayer sessions',
    featured: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'prism-starter-2',
    title: 'PrismPure: 64x Crisp Faithful Textures',
    category: 'resource_pack',
    tagline: 'Ultra-crisp 64x vanilla-faithful textures optimized for mobile and console Bedrock.',
    description: 'Clean, pixel-artisan faithful resource pack that enhances vanilla textures to high definition without breaking the cozy Minecraft aesthetic. Includes clear glass, 3D armor details, and dark UI mode.',
    version: 'v1.5',
    bedrockVersion: '1.20 - 1.21',
    fileSize: '28.6 MB',
    downloadCount: 89,
    textureDetails: {
      resolution: '64x',
      style: 'Faithful Vanilla & Dark UI',
      subpackInfo: 'Includes connected glass and low-fire options slider',
    },
    links: [
      {
        id: 'link-tp-1',
        title: 'Download .mcpack',
        url: 'https://example.com/downloads/prismpure-64x.mcpack',
        type: 'mcpack',
        note: 'Direct 64x resolution',
        isPrimary: true,
      },
      {
        id: 'link-tp-2',
        title: 'MediaFire Fast Mirror',
        url: 'https://mediafire.com',
        type: 'mediafire',
      },
    ],
    tags: ['64x', 'Faithful', 'Clean UI', 'HD', 'Optimized'],
    installationGuide: '1. Download the .mcpack file.\n2. Import into Minecraft Bedrock.\n3. Activate under Global Resources in Settings, or add to your specific World resource packs.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'prism-starter-3',
    title: 'Skyward Ruins: Lost Citadel Adventure',
    category: 'map',
    tagline: 'Explore floating ancient islands, solve dungeon puzzles, and restore the beacon.',
    description: 'A custom handcrafted Minecraft Bedrock adventure world featuring 5 puzzle chambers, custom boss encounters, custom lore books, and parkour trials across the sky.',
    version: 'v1.1',
    bedrockVersion: '1.21+',
    fileSize: '45.1 MB',
    downloadCount: 47,
    mapDetails: {
      gameMode: 'Adventure',
      spawnCoordinates: 'X: 120, Y: 85, Z: -350',
      playerCount: '1-4 Players',
      difficulty: 'Normal',
    },
    links: [
      {
        id: 'link-map-1',
        title: 'Download .mcworld Map',
        url: 'https://example.com/downloads/skyward-ruins.mcworld',
        type: 'mcworld',
        note: 'Direct world import',
        isPrimary: true,
      },
    ],
    tags: ['Adventure', 'Puzzles', 'Floating Islands', 'Co-op', 'Dungeons'],
    installationGuide: '1. Download the .mcworld file.\n2. Tap or open to auto-import into Bedrock.\n3. The world will appear in your World selection screen ready to play.',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'prism-starter-4',
    title: 'Lumina Shaders: Deferred Bedrock Lighting',
    category: 'shader',
    tagline: 'Vibrant sun caustics, soft ambient shadows, and atmospheric night fog.',
    description: 'Compatible with Bedrock Render Dragon Deferred Technical Preview. Delivers realistic water reflections, warm torchlight, and glowing ores.',
    version: 'v2.0',
    bedrockVersion: '1.21.30+',
    fileSize: '8.4 MB',
    downloadCount: 215,
    shaderDetails: {
      renderEngine: 'Render Dragon Deferred & PBR',
      performanceLevel: 'Balanced',
      supportedDevices: 'Windows 10/11 & High-end Android',
      visualHighlights: 'Dynamic water caustics, volumetric fog, glowing emissive ores',
    },
    links: [
      {
        id: 'link-shader-1',
        title: 'Download Shader .mcpack',
        url: 'https://example.com/downloads/lumina-deferred.mcpack',
        type: 'mcpack',
        note: 'Requires Deferred Technical Preview',
        isPrimary: true,
      },
    ],
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 6,
  },
];

// Delete any type of addon completely from stored addons
export function deleteStoredAddon(addonId: string): BedrockAddon[] {
  try {
    const current = getStoredAddons();
    const updated = current.filter((a) => a.id !== addonId);
    saveStoredAddons(updated);
    broadcastAppEvent('ADDONS_UPDATED', updated);
    return updated;
  } catch {
    return [];
  }
}

// Trigger browser file download based on addon file type / attachment
export function triggerAddonFileDownload(
  addon: BedrockAddon, 
  link?: ExternalLink
): { fileName: string; fileType: string } {
  // Determine file extension
  let extension = addon.downloadFileType;
  if (!extension) {
    if (link?.type && ['.mcaddon', '.mcpack', '.mcworld'].includes('.' + link.type)) {
      extension = '.' + link.type;
    } else if (addon.category === 'map') {
      extension = '.mcworld';
    } else if (addon.category === 'resource_pack' || addon.category === 'shader') {
      extension = '.mcpack';
    } else {
      extension = '.mcaddon';
    }
  }
  if (!extension.startsWith('.')) {
    extension = '.' + extension;
  }

  const safeTitle = addon.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fileName = addon.attachedFileName || `${safeTitle}${extension}`;

  try {
    if (addon.attachedFileData) {
      // Download actual uploaded file data
      const a = document.createElement('a');
      a.href = addon.attachedFileData;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Generate authentic Minecraft Bedrock manifest file payload
      const manifest = {
        format_version: 2,
        header: {
          name: addon.title,
          description: addon.tagline || addon.description || 'Custom Minecraft Bedrock pack created via PrismMods',
          uuid: 'prism-' + addon.id,
          version: [1, 0, 0],
          min_engine_version: [1, 20, 0],
        },
        modules: [
          {
            description: addon.title,
            type: addon.category === 'resource_pack' ? 'resources' : 'data',
            uuid: 'mod-' + addon.id,
            version: [1, 0, 0],
          },
        ],
      };
      const jsonStr = JSON.stringify(manifest, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  } catch (err) {
    console.error('File download error:', err);
  }

  // Increment download count and add to history
  incrementAddonDownloads(addon.id);
  addDownloadHistory({
    addonId: addon.id,
    title: addon.title,
    category: addon.category,
    fileFormat: extension,
    version: addon.version,
    linkUrl: link?.url,
  });

  return { fileName, fileType: extension };
}

