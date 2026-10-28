import { ServerProfile, VpnSettings, LogEntry } from '../types/vpn';

export const DEFAULT_PROFILES: ServerProfile[] = [
  {
    id: 'server-bdix',
    name: '🇧🇩 Dhaka BDIX Ultra-Fast (MikroTik)',
    country: 'Bangladesh',
    city: 'Dhaka',
    flag: '🇧🇩',
    serverAddress: 'bdix-gw01.dhakafiber.net',
    ipsecPsk: 'bdix_secure_l2tp@2026',
    username: 'rasal_bdix',
    authMethod: 'mschapv2',
    mppe: true,
    dns: '1.1.1.1, 8.8.8.8',
    mtu: 1450,
    ping: 8,
    load: 28,
    isCustom: false,
    isBDIX: true,
  },
  {
    id: 'server-sg',
    name: '🇸🇬 Singapore Low-Latency Gaming',
    country: 'Singapore',
    city: 'Singapore',
    flag: '🇸🇬',
    serverAddress: 'sg-node04.l2tp-express.net',
    ipsecPsk: 'sg_ipsec_fast_tunnel',
    username: 'rasal_user',
    authMethod: 'mschapv2',
    mppe: true,
    dns: '1.1.1.1, 1.0.0.1',
    mtu: 1400,
    ping: 36,
    load: 42,
    isCustom: false,
  },
  {
    id: 'server-de',
    name: '🇩🇪 Frankfurt Privacy Core (No-Logs)',
    country: 'Germany',
    city: 'Frankfurt',
    flag: '🇩🇪',
    serverAddress: 'fra-core.secure-ipsec.de',
    ipsecPsk: 'fra_strong_tunnel_key',
    username: 'vpn_client_99',
    authMethod: 'mschapv2',
    mppe: true,
    dns: '9.9.9.9, 149.112.112.112',
    mtu: 1420,
    ping: 118,
    load: 54,
    isCustom: false,
  },
  {
    id: 'server-jp',
    name: '🇯🇵 Tokyo Anime & Streaming Node',
    country: 'Japan',
    city: 'Tokyo',
    flag: '🇯🇵',
    serverAddress: 'tyo-edge02.tokyo-vpn.jp',
    ipsecPsk: 'tokyo_ipsec_psk_key',
    username: 'japan_stream',
    authMethod: 'mschapv2',
    mppe: true,
    dns: '1.1.1.1, 8.8.4.4',
    mtu: 1400,
    ping: 78,
    load: 35,
    isCustom: false,
  },
  {
    id: 'server-us',
    name: '🇺🇸 US East (New York Enterprise)',
    country: 'United States',
    city: 'New York',
    flag: '🇺🇸',
    serverAddress: 'nyc-gw.us-east.tunnel.org',
    ipsecPsk: 'us_east_enterprise_psk',
    username: 'us_vpn_client',
    authMethod: 'mschapv2',
    mppe: true,
    dns: '8.8.8.8, 8.8.4.4',
    mtu: 1450,
    ping: 165,
    load: 62,
    isCustom: false,
  },
  {
    id: 'server-custom-mikrotik',
    name: '🏢 Home/Office MikroTik Router',
    country: 'Local Network',
    city: 'Private Intranet',
    flag: '🏢',
    serverAddress: '192.168.88.1',
    ipsecPsk: 'mikrotik_ipsec_secret_123',
    username: 'admin_vpn',
    authMethod: 'mschapv2',
    mppe: true,
    dns: '192.168.88.1',
    mtu: 1450,
    ping: 2,
    load: 12,
    isCustom: true,
  },
];

export const DEFAULT_SETTINGS: VpnSettings = {
  killSwitch: false,
  autoReconnect: true,
  dnsLeakProtection: true,
  splitTunneling: false,
  bypassedApps: ['WhatsApp', 'bKash', 'Google Maps'],
  customMtu: 1450,
  natTraversal: true,
  keepAliveSeconds: 30,
  protocol: 'l2tp_ipsec_psk',
};

const PROFILES_STORAGE_KEY = 'l2tp_vpn_profiles_v1';
const SETTINGS_STORAGE_KEY = 'l2tp_vpn_settings_v1';
const ACTIVE_PROFILE_KEY = 'l2tp_vpn_active_profile_v1';

export function loadProfiles(): ServerProfile[] {
  try {
    const saved = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_PROFILES;
}

export function saveProfiles(profiles: ServerProfile[]): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles to localStorage', e);
  }
}

export function loadSettings(): VpnSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: VpnSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadActiveProfileId(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (saved) return saved;
  } catch {
    // fallback
  }
  return DEFAULT_PROFILES[0].id;
}

export function saveActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    // fallback
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
