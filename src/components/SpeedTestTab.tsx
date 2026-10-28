import React, { useState, useEffect } from 'react';
import { Gauge, ArrowDown, ArrowUp, Activity, Play, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ServerProfile, VpnStatus } from '../types/vpn';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';

interface SpeedTestTabProps {
  vpnStatus: VpnStatus;
  activeProfile: ServerProfile;
  language: Language;
}

export const SpeedTestTab: React.FC<SpeedTestTabProps> = ({
  vpnStatus,
  activeProfile,
  language,
}) => {
  const t = vpnTranslations[language];

  const [testing, setTesting] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  const [ping, setPing] = useState<number>(activeProfile.ping);
  const [jitter, setJitter] = useState<number>(2);
  const [downloadMbps, setDownloadMbps] = useState<number>(0);
  const [uploadMbps, setUploadMbps] = useState<number>(0);
  const [currentSpeedGauge, setCurrentSpeedGauge] = useState<number>(0);

  const isConnected = vpnStatus === 'connected';

  const startTest = () => {
    if (testing) return;
    setTesting(true);
    setPhase('ping');
    setCurrentSpeedGauge(0);
    setDownloadMbps(0);
    setUploadMbps(0);

    // Target max speeds based on BDIX vs International
    const targetDown = activeProfile.isBDIX ? 88.4 : activeProfile.ping < 50 ? 58.2 : 34.6;
    const targetUp = activeProfile.isBDIX ? 76.2 : activeProfile.ping < 50 ? 42.1 : 22.8;

    // Step 1: Ping & Jitter
    setTimeout(() => {
      const livePing = Math.max(2, activeProfile.ping + Math.floor(Math.random() * 4) - 2);
      setPing(livePing);
      setJitter(Math.floor(Math.random() * 3) + 1);
      setPhase('download');

      // Step 2: Download Ramp-up
      let step = 0;
      const downInterval = setInterval(() => {
        step++;
        const curr = Math.min(targetDown, (targetDown * (step / 15)) + (Math.random() * 5 - 2.5));
        setDownloadMbps(parseFloat(curr.toFixed(1)));
        setCurrentSpeedGauge(curr);

        if (step >= 15) {
          clearInterval(downInterval);
          setDownloadMbps(parseFloat(targetDown.toFixed(1)));
          setPhase('upload');

          // Step 3: Upload Ramp-up
          let upStep = 0;
          const upInterval = setInterval(() => {
            upStep++;
            const currUp = Math.min(targetUp, (targetUp * (upStep / 12)) + (Math.random() * 4 - 2));
            setUploadMbps(parseFloat(currUp.toFixed(1)));
            setCurrentSpeedGauge(currUp);

            if (upStep >= 12) {
              clearInterval(upInterval);
              setUploadMbps(parseFloat(targetUp.toFixed(1)));
              setPhase('complete');
              setTesting(false);
            }
          }, 150);
        }
      }, 150);
    }, 1200);
  };

  // Rotation angle for speedometer needle: 0 Mbps = -120 deg, 100 Mbps = 120 deg
  const needleAngle = Math.min(120, Math.max(-120, -120 + (currentSpeedGauge / 100) * 240));

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>{t.speedTestTitle}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono truncate">
            {activeProfile.name} ({activeProfile.serverAddress})
          </p>
        </div>

        {isConnected ? (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>VPN Tunnel</span>
          </span>
        ) : (
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Direct LAN</span>
          </span>
        )}
      </div>

      {/* Speedometer Dial Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
        {/* Glow */}
        <div className="absolute w-44 h-44 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

        {/* Gauge SVG */}
        <div className="relative w-56 h-36 flex items-end justify-center">
          <svg className="w-56 h-40 overflow-visible" viewBox="0 0 200 120">
            {/* Background Track Arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Active Gauge Arc */}
            <path
              d="M 20 110 A 80 80 0 0 1 180 110"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (Math.min(100, currentSpeedGauge) / 100) * 251.2}
              className="transition-all duration-150"
            />
            {/* Needle Pivot */}
            <circle cx="100" cy="110" r="8" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
            {/* Needle Indicator */}
            <line
              x1="100"
              y1="110"
              x2="100"
              y2="42"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                transformOrigin: '100px 110px',
                transform: `rotate(${needleAngle}deg)`,
                transition: 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </svg>

          {/* Centered Digital Readout */}
          <div className="absolute bottom-0 text-center">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight">
              {currentSpeedGauge > 0 ? currentSpeedGauge.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-400 font-mono block">Mbps</span>
          </div>
        </div>

        {/* Phase Pill */}
        <div className="mt-4">
          <span className="text-xs font-mono text-slate-400 capitalize">
            {phase === 'idle'
              ? 'Ready for speed test'
              : phase === 'ping'
              ? 'Measuring Ping & Jitter...'
              : phase === 'download'
              ? 'Testing Download Throughput...'
              : phase === 'upload'
              ? 'Testing Upload Throughput...'
              : 'Speed Test Complete'}
          </span>
        </div>

        {/* Start / Rerun Test Button */}
        <button
          onClick={startTest}
          disabled={testing}
          className={`mt-4 px-6 py-2.5 rounded-2xl text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-md ${
            testing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 active:scale-95'
          }`}
        >
          {testing ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              <span>{t.testingSpeed}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{t.runSpeedTest}</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Download Speed Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowDown className="w-4 h-4 text-emerald-400" />
            <span>{t.downloadSpeedLabel}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {downloadMbps > 0 ? downloadMbps.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-500 font-mono">Mbps</span>
          </div>
        </div>

        {/* Upload Speed Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUp className="w-4 h-4 text-blue-400" />
            <span>{t.uploadSpeedLabel}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {uploadMbps > 0 ? uploadMbps.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-500 font-mono">Mbps</span>
          </div>
        </div>

        {/* Ping Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>{t.pingLabel}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {ping > 0 ? ping : '--'}
            </span>
            <span className="text-xs text-slate-500 font-mono">ms</span>
          </div>
        </div>

        {/* Jitter Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span>{t.jitterLabel}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {jitter > 0 ? jitter : '--'}
            </span>
            <span className="text-xs text-slate-500 font-mono">ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
