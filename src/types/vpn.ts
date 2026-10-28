export type VpnStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export type ConnectingPhase =
  | 'dns_resolve'
  | 'ike_phase1'
  | 'ike_phase2'
  | 'l2tp_tunnel'
  | 'ppp_auth'
  | 'ipcp_config'
  | 'ready';

export interface ServerProfile {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  serverAddress: string;
  ipsecPsk: string;
  username: string;
  password?: string;
  authMethod: 'mschapv2' | 'pap' | 'chap';
  mppe: boolean;
  dns: string;
  mtu: number;
  ping: number;
  load: number;
  isCustom: boolean;
  isBDIX?: boolean;
}

export interface VpnTraffic {
  downloadSpeed: number; // in KB/s
  uploadSpeed: number; // in KB/s
  totalDownload: number; // in bytes
  totalUpload: number; // in bytes
  durationSeconds: number;
  virtualIp: string;
  clientIp: string;
  history: { time: string; down: number; up: number }[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'debug' | 'error';
  message: string;
}

export interface VpnSettings {
  killSwitch: boolean;
  autoReconnect: boolean;
  dnsLeakProtection: boolean;
  splitTunneling: boolean;
  bypassedApps: string[];
  customMtu: number;
  natTraversal: boolean;
  keepAliveSeconds: number;
  protocol: 'l2tp_ipsec_psk' | 'l2tp_ipsec_cert' | 'l2tp_plain';
}
