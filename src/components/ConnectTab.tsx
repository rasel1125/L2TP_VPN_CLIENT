import React from 'react';
import {
  Power,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowDown,
  ArrowUp,
  Clock,
  Activity,
  Globe,
  ChevronRight,
  Lock,
  Cpu,
  Zap,
} from 'lucide-react';
import { VpnStatus, ConnectingPhase, ServerProfile, VpnTraffic } from '../types/vpn';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';
import { formatBytes, formatTime } from '../services/vpnStore';

interface ConnectTabProps {
  vpnStatus: VpnStatus;
  connectingPhase: ConnectingPhase;
  activeProfile: ServerProfile;
  traffic: VpnTraffic;
  onToggleConnect: () => void;
  onSelectServerClick: () => void;
  onOpenLiveTest: () => void;
  language: Language;
}

export const ConnectTab: React.FC<ConnectTabProps> = ({
  vpnStatus,
  connectingPhase,
  activeProfile,
  traffic,
  onToggleConnect,
  onSelectServerClick,
  onOpenLiveTest,
  language,
}) => {
  const t = vpnTranslations[language];

  const isConnected = vpnStatus === 'connected';
  const isConnecting = vpnStatus === 'connecting';
  const isDisconnecting = vpnStatus === 'disconnecting';

  // Connecting status description
  const getPhaseText = (): string => {
    switch (connectingPhase) {
      case 'dns_resolve':
        return t.phaseDns;
      case 'ike_phase1':
        return t.phaseIke1;
      case 'ike_phase2':
        return t.phaseIke2;
      case 'l2tp_tunnel':
        return t.phaseL2tp;
      case 'ppp_auth':
        return t.phasePpp;
      case 'ipcp_config':
        return t.phaseIpcp;
      case 'ready':
        return t.phaseReady;
      default:
        return t.connecting;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-4">
      {/* 1. Selected Server Bar */}
      <button
        onClick={onSelectServerClick}
        className="w-full bg-slate-900/80 hover:bg-slate-850 active:bg-slate-800 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-left transition-all shadow-sm"
      >
        <div className="flex items-center gap-3 truncate">
          <span className="text-2xl select-none">{activeProfile.flag}</span>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white truncate">
                {activeProfile.name}
              </span>
              {activeProfile.isBDIX && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1 rounded">
                  BDIX
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate flex items-center gap-2">
              <span>{activeProfile.serverAddress}</span>
              <span>·</span>
              <span className="text-emerald-400">{activeProfile.ping} ms</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0 pl-2">
          <span>{t.changeServer}</span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </button>

      {/* Live Test Action Banner */}
      <button
        onClick={onOpenLiveTest}
        className="w-full bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 hover:from-emerald-900/50 hover:to-slate-850 active:from-emerald-900 border border-emerald-500/40 rounded-2xl p-2.5 flex items-center justify-between text-left transition-all shadow-xs group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {t.runLiveTest}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {t.liveTestSubtitle}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">
          TEST
        </span>
      </button>

      {/* 2. Main Tactile Quick Connect Button */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        {/* Animated outer aura rings */}
        <div className="relative flex items-center justify-center">
          {isConnected && (
            <>
              <div className="absolute w-56 h-56 rounded-full bg-emerald-500/10 animate-ping opacity-60" />
              <div className="absolute w-48 h-48 rounded-full bg-emerald-500/15 animate-pulse" />
            </>
          )}

          {isConnecting && (
            <div className="absolute w-52 h-52 rounded-full border-2 border-dashed border-amber-400/50 animate-spin" />
          )}

          {/* Big Circular Connect Button */}
          <button
            onClick={onToggleConnect}
            disabled={isConnecting || isDisconnecting}
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative z-10 shadow-xl ${
              isConnected
                ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-emerald-600/30 ring-4 ring-emerald-400/20 active:scale-95'
                : isConnecting
                ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-amber-600/30 ring-4 ring-amber-400/20 cursor-wait'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 text-slate-200 border-2 border-slate-700/80 hover:border-emerald-500/50 hover:text-white shadow-black/50 active:scale-95'
            }`}
          >
            <Power
              className={`w-14 h-14 mb-1 transition-transform ${
                isConnected
                  ? 'text-white scale-110 drop-shadow-md'
                  : isConnecting
                  ? 'text-amber-200 animate-pulse'
                  : 'text-slate-400'
              }`}
            />
            <span className="text-xs font-bold tracking-wider uppercase font-mono">
              {isConnected
                ? t.tapToDisconnect
                : isConnecting
                ? t.connecting
                : t.tapToConnect}
            </span>
          </button>
        </div>

        {/* Live Status Prose */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center gap-1.5">
            {isConnected ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : isConnecting ? (
              <Activity className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-slate-500" />
            )}
            <span
              className={`text-sm font-bold tracking-tight ${
                isConnected
                  ? 'text-emerald-400'
                  : isConnecting
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {isConnected
                ? t.connected
                : isConnecting
                ? t.connecting
                : isDisconnecting
                ? t.disconnecting
                : t.disconnected}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {isConnecting
              ? getPhaseText()
              : isConnected
              ? `${t.protocol} · AES-256`
              : t.statusUnprotected}
          </p>
        </div>
      </div>

      {/* 3. Live Telemetry & Traffic Cards (Active during connection) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Download Speed */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.downloadSpeed}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {formatBytes(traffic.totalDownload)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-white">
              {isConnected ? (traffic.downloadSpeed > 1024 ? (traffic.downloadSpeed / 1024).toFixed(1) : traffic.downloadSpeed.toFixed(0)) : '0.0'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isConnected && traffic.downloadSpeed > 1024 ? 'MB/s' : 'KB/s'}
            </span>
          </div>
        </div>

        {/* Upload Speed */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.uploadSpeed}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {formatBytes(traffic.totalUpload)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-white">
              {isConnected ? (traffic.uploadSpeed > 1024 ? (traffic.uploadSpeed / 1024).toFixed(1) : traffic.uploadSpeed.toFixed(0)) : '0.0'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isConnected && traffic.uploadSpeed > 1024 ? 'MB/s' : 'KB/s'}
            </span>
          </div>
        </div>

        {/* Ping / Latency */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.pingLatency}</span>
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
              {isConnected ? `${activeProfile.ping} ` : '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
        </div>

        {/* Connected Duration */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.sessionTime}</span>
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-white">
              {isConnected ? formatTime(traffic.durationSeconds) : '00:00'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Real-time SVG Traffic Wave Graph (When connected) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-medium flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>L2TP Tunnel Stream</span>
          </span>
          <span className="font-mono text-emerald-400">
            {isConnected ? `IP: ${traffic.virtualIp}` : 'Idle'}
          </span>
        </div>

        {/* SVG Sparkline */}
        <div className="h-12 w-full flex items-end">
          <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {isConnected ? (
              <>
                <path
                  d={`M 0,40 ${traffic.history
                    .map((pt, i) => {
                      const x = (i / (traffic.history.length - 1 || 1)) * 200;
                      const y = Math.max(4, 40 - (pt.down / 800) * 36);
                      return `L ${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ')} L 200,40 Z`}
                  fill="url(#trafficGradient)"
                />
                <path
                  d={`M ${traffic.history
                    .map((pt, i) => {
                      const x = (i / (traffic.history.length - 1 || 1)) * 200;
                      const y = Math.max(4, 40 - (pt.down / 800) * 36);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' L ')}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <line x1="0" y1="38" x2="200" y2="38" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            )}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>Virtual Adapter: ppp0</span>
          <span>MTU: {activeProfile.mtu} · MSS: {activeProfile.mtu - 40}</span>
        </div>
      </div>
    </div>
  );
};
