import React, { useState, useEffect } from 'react';
import { Wifi, Key, Battery, Signal } from 'lucide-react';
import { VpnStatus } from '../types/vpn';

interface AndroidStatusBarProps {
  vpnStatus: VpnStatus;
  theme?: 'dark' | 'light';
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ vpnStatus, theme = 'dark' }) => {
  const [time, setTime] = useState<string>('12:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = vpnStatus === 'connected';

  return (
    <div
      className={`h-7 px-5 flex items-center justify-between text-[11px] font-medium tracking-tight select-none z-30 transition-colors ${
        theme === 'dark' ? 'text-slate-200 bg-slate-950/80 backdrop-blur-xs' : 'text-slate-800 bg-white/80 backdrop-blur-xs'
      }`}
    >
      {/* Left: Time and VPN Key badge */}
      <div className="flex items-center gap-2">
        <span className="font-semibold font-mono tabular-nums">{time}</span>
        {isConnected && (
          <span
            className="flex items-center gap-0.5 px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-mono animate-pulse"
            title="VPN Tunnel Active (Android VPN Service)"
          >
            <Key className="w-2.5 h-2.5" />
            <span>VPN</span>
          </span>
        )}
      </div>

      {/* Center Camera Punch hole Notch */}
      <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-slate-700/60" />
      </div>

      {/* Right: Network, Wi-Fi, Battery */}
      <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums">
        <span className="text-[9px] text-slate-400 font-bold">5G</span>
        <Signal className="w-3 h-3 text-slate-300" />
        <Wifi className="w-3 h-3 text-slate-300" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">98%</span>
          <Battery className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>
    </div>
  );
};
