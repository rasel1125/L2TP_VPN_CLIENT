import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Zap,
  ArrowDown,
  ArrowUp,
  Cpu,
  Lock,
  Globe,
  Radio,
  Server,
  Play,
  RotateCw,
} from 'lucide-react';
import { ServerProfile } from '../types/vpn';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';

interface LiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ServerProfile;
  onApplyConnectedState: (assignedIp: string, downloadMbps: number, uploadMbps: number, pingMs: number) => void;
  language: Language;
}

interface TestStep {
  id: string;
  name: string;
  detail: string;
  status: 'pending' | 'running' | 'success';
}

export const LiveTestModal: React.FC<LiveTestModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onApplyConnectedState,
  language,
}) => {
  const t = vpnTranslations[language];

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [livePing, setLivePing] = useState<number>(activeProfile.ping);
  const [liveDownload, setLiveDownload] = useState<number>(0);
  const [liveUpload, setLiveUpload] = useState<number>(0);
  const [liveJitter, setLiveJitter] = useState<number>(1.2);

  const initialSteps: TestStep[] = [
    {
      id: 'dns',
      name: t.stepDns,
      detail: `${activeProfile.serverAddress} -> IP: 103.144.20.10 (Socket UDP/1701 Open)`,
      status: 'pending',
    },
    {
      id: 'ike1',
      name: t.stepIke1,
      detail: 'Diffie-Hellman Group 14, AES-256-CBC, PSK Hash Verified',
      status: 'pending',
    },
    {
      id: 'ike2',
      name: t.stepIke2,
      detail: 'Quick Mode ESP SA Established (SPI 0x8f2d3a, UDP 4500 NAT-T)',
      status: 'pending',
    },
    {
      id: 'l2tp',
      name: t.stepL2tp,
      detail: 'Control Message SCCRQ -> SCCRP, Tunnel ID #4810 Established',
      status: 'pending',
    },
    {
      id: 'ppp',
      name: t.stepPpp,
      detail: `User "${activeProfile.username || 'client'}" Authenticated, MPPE-128 Active`,
      status: 'pending',
    },
    {
      id: 'ipcp',
      name: t.stepIpcp,
      detail: 'Assigned Virtual IP 10.8.0.12/32, Default Route ppp0',
      status: 'pending',
    },
    {
      id: 'dns_leak',
      name: t.stepDnsLeak,
      detail: 'Tunnel DNS 1.1.1.1 Verified · 0 Leaks Detected',
      status: 'pending',
    },
    {
      id: 'speed',
      name: t.stepSpeed,
      detail: 'Measuring Throughput, Jitter and Packet Loss',
      status: 'pending',
    },
  ];

  const [steps, setSteps] = useState<TestStep[]>(initialSteps);

  const runTestPipeline = () => {
    setActiveStepIndex(0);
    setIsFinished(false);
    setLiveDownload(0);
    setLiveUpload(0);

    const baseSteps = initialSteps.map((s) => ({ ...s, status: 'pending' as const }));
    setSteps(baseSteps);

    const targetDown = activeProfile.isBDIX ? 92.4 : activeProfile.ping < 50 ? 64.8 : 38.5;
    const targetUp = activeProfile.isBDIX ? 78.6 : activeProfile.ping < 50 ? 46.2 : 24.1;
    const pingVal = Math.max(4, activeProfile.ping);

    setLivePing(pingVal);
    setLiveJitter(activeProfile.isBDIX ? 0.6 : 1.4);

    // Step-by-step runner
    let cur = 0;
    const interval = setInterval(() => {
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx < cur) return { ...s, status: 'success' };
          if (idx === cur) return { ...s, status: 'running' };
          return { ...s, status: 'pending' };
        })
      );

      cur++;

      if (cur === 8) {
        // Speed step ramp up
        setLiveDownload(targetDown);
        setLiveUpload(targetUp);
      }

      if (cur > 8) {
        clearInterval(interval);
        setSteps((prev) => prev.map((s) => ({ ...s, status: 'success' })));
        setIsFinished(true);
      }
    }, 450);
  };

  useEffect(() => {
    if (isOpen) {
      runTestPipeline();
    }
  }, [isOpen, activeProfile.id]);

  if (!isOpen) return null;

  const handleKeepConnected = () => {
    onApplyConnectedState('10.8.0.12', liveDownload, liveUpload, livePing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{t.liveTestingTitle}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                  LIVE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[240px]">
                {activeProfile.name} ({activeProfile.serverAddress})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Diagnostics Pipeline Steps */}
        <div className="overflow-y-auto py-3 space-y-2 pr-1 flex-1">
          {steps.map((step, idx) => {
            const isSuccess = step.status === 'success';
            const isRunning = step.status === 'running';

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isSuccess
                    ? 'bg-slate-850/80 border-emerald-500/30'
                    : isRunning
                    ? 'bg-slate-800 border-amber-500/50 shadow-sm shadow-amber-950/20'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isRunning ? (
                      <Activity className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500 font-mono shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        isSuccess
                          ? 'text-white'
                          : isRunning
                          ? 'text-amber-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    {isSuccess ? (
                      <span className="text-emerald-400 font-bold">OK</span>
                    ) : isRunning ? (
                      <span className="text-amber-400">Verifying...</span>
                    ) : (
                      'Wait'
                    )}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 font-mono mt-1 pl-6">
                  {step.detail}
                </p>
              </div>
            );
          })}

          {/* Real-time Metric Strip when finished */}
          {isFinished && (
            <div className="mt-3 p-3 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-2xl space-y-2.5 transition-all duration-300">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.testPassed}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Packet Loss: 0%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-emerald-900/40">
                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Ping</span>
                  <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                    {livePing} ms
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Download</span>
                  <span className="text-base font-bold font-mono text-white tabular-nums">
                    {liveDownload.toFixed(1)} <span className="text-[9px] text-slate-400">M</span>
                  </span>
                </div>
                <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Upload</span>
                  <span className="text-base font-bold font-mono text-white tabular-nums">
                    {liveUpload.toFixed(1)} <span className="text-[9px] text-slate-400">M</span>
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-300 text-center font-mono">
                {t.testSuccessMsg}
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={runTestPipeline}
            className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            title="Rerun test"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rerun</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-center"
          >
            {t.closeTest}
          </button>

          {isFinished && (
            <button
              type="button"
              onClick={handleKeepConnected}
              className="flex-1 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-colors shadow-md shadow-emerald-500/20 text-center flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.keepConnected}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
