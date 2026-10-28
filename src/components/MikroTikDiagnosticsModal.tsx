import React, { useState } from 'react';
import {
  X,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Terminal,
  HelpCircle,
  Globe,
  Radio,
  Lock,
} from 'lucide-react';
import { ServerProfile } from '../types/vpn';
import { Language } from '../i18n/vpnTranslations';

interface MikroTikDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ServerProfile;
  language: Language;
}

export const MikroTikDiagnosticsModal: React.FC<MikroTikDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  language,
}) => {
  const [loading, setLoading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const runProbe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mikrotik/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverAddress: activeProfile.serverAddress,
          username: activeProfile.username,
          password: activeProfile.password || '',
          ipsecPsk: activeProfile.ipsecPsk || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to check MikroTik');
      }
      setProbeResult(data);
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyCommands = (cmds: string) => {
    navigator.clipboard.writeText(cmds);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isBn ? 'MikroTik কানেকশন ও অ্যাক্টিভ প্রবলেম চেকার' : 'MikroTik L2TP Active Connection Checker'}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded">
                  ROUTEROS
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
                {activeProfile.name} · {activeProfile.serverAddress}
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

        {/* Content Body */}
        <div className="overflow-y-auto py-3 space-y-3.5 pr-1 flex-1 text-xs text-slate-300">
          {/* Key Explanation Banner: Why /ppp active doesn't trigger from web app */}
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {isBn
                  ? 'MikroTik-এ কেন Active Connection আসছে না? (প্রধান কারণ)'
                  : 'Why is MikroTik not showing an Active Connection?'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/90 font-sans">
              {isBn ? (
                <>
                  ১. <strong>ওয়েব ব্রাউজার নিরাপত্তা সীমাবদ্ধতা:</strong> যেকোনো ব্রাউজারের (Chrome/Safari) ওয়েব অ্যাপ কম্পিউটার বা মোবাইলের আসল অপারেটিং সিস্টেমের নেটওয়ার্ক কার্ডে <code>ppp0</code> বা <code>tun0</code> সরাসরি চালু করতে পারে না। ব্রাউজার শুধু সিমুলেটেড UI দেখায়।
                  <br />
                  ২. <strong>MikroTik /ppp active-এ কানেকশন আসতে হলে:</strong> আপনার আসল <strong>Android ফোনের Settings &gt; VPN</strong> অথবা <strong>Play Store Native L2TP Client</strong> দিয়ে MikroTik-এ কানেক্ট করতে হবে।
                  <br />
                  ৩. <strong>MikroTik কনফিগারেশন:</strong> নিচে আমাদের রিয়েল সার্ভার চেকার দিয়ে চেক করুন আপনার MikroTik-এ L2TP পোর্ট (UDP 1701) এবং IPsec পোর্ট (500, 4500) খোলা আছে কি না!
                </>
              ) : (
                <>
                  1. <strong>Web Browser Sandbox:</strong> In-browser apps cannot open OS-level raw UDP/IPsec sockets (UDP 1701/500/4500).
                  <br />
                  2. <strong>To trigger /ppp active on MikroTik:</strong> You must configure these credentials in Android Settings &gt; VPN or a native Play Store client on your actual phone.
                  <br />
                  3. <strong>Server Reachability:</strong> Run our probe below to verify if your MikroTik ports are open and not blocked by ISP CGNAT!
                </>
              )}
            </p>
          </div>

          {/* Current Profile Specs Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 font-mono space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Server Specs</span>
              </span>
              <span>L2TP/IPsec</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">HOST / IP:</span>
                <span className="text-white font-bold">{activeProfile.serverAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">USERNAME:</span>
                <span className="text-white">{activeProfile.username || '(not set)'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">IPSEC PSK:</span>
                <span className="text-white truncate block">
                  {activeProfile.ipsecPsk ? '••••••••' : '(no PSK)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">AUTH PROTOCOL:</span>
                <span className="text-emerald-400">{activeProfile.authMethod.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Action: Run Live Server Probe */}
          <div className="space-y-2">
            <button
              onClick={runProbe}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-cyan-950/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'MikroTik আইপি ও পোর্ট পরীক্ষা করা হচ্ছে...' : 'Probing MikroTik Ports...'}</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>{isBn ? '⚡ রিয়েল MikroTik পোর্ট ও রিচেবিলিটি টেস্ট চালান' : '⚡ Run Real MikroTik Probe'}</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-2.5 bg-rose-950/30 border border-rose-800 rounded-xl text-rose-300 text-[11px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Probe Results */}
          {probeResult && (
            <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-3.5 space-y-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-xs font-bold text-white pb-1.5 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Probe Diagnostic Report</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Resolved: {probeResult.resolvedIp}
                </span>
              </div>

              {/* IP Type & CGNAT Warning */}
              <div
                className={`p-2.5 rounded-xl border ${
                  probeResult.ipType.isPrivate
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  {probeResult.ipType.isPrivate ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span>IP Type: {probeResult.ipType.isPrivate ? 'Private / CGNAT' : 'Public IP'}</span>
                </div>
                <p className="text-[10px] mt-1 leading-normal opacity-90 font-sans">
                  {probeResult.ipType.reason}
                </p>
              </div>

              {/* Ports Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>UDP 1701 (L2TP)</span>
                  <span className="text-emerald-400 font-bold">Packet Sent</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>UDP 500 (IKE)</span>
                  <span className="text-emerald-400 font-bold">Packet Sent</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>UDP 4500 (NAT-T)</span>
                  <span className="text-emerald-400 font-bold">Packet Sent</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>TCP 8728 (API)</span>
                  <span
                    className={
                      probeResult.ports.routerOsApi8728?.open
                        ? 'text-emerald-400 font-bold'
                        : 'text-slate-500'
                    }
                  >
                    {probeResult.ports.routerOsApi8728?.open ? 'OPEN' : 'Closed / Filtered'}
                  </span>
                </div>
              </div>

              {/* Solution: RouterOS Terminal Setup Script */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>MikroTik RouterOS Terminal Commands</span>
                  </span>
                  <button
                    onClick={() => copyCommands(probeResult.diagnostics.mikrotikCommands)}
                    className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg"
                  >
                    {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                  {probeResult.diagnostics.mikrotikCommands}
                </pre>
                <p className="text-[10px] text-slate-400 font-sans">
                  {isBn
                    ? 'এই কমান্ডগুলো কপি করে আপনার WinBox Terminal-এ পেস্ট করলে MikroTik L2TP সার্ভার সক্রিয় হবে এবং ফায়ারওয়াল পোর্ট খুলে যাবে।'
                    : 'Paste these commands in WinBox Terminal to enable L2TP server and allow firewall ports.'}
                </p>
              </div>
            </div>
          )}

          {/* Android Mobile Phone Settings Step-by-Step */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>
                {isBn
                  ? 'আপনার Android ফোন থেকে আসল কানেকশন দেওয়ার নিয়ম:'
                  : 'How to connect your Android phone to this MikroTik:'}
              </span>
            </div>
            <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal pl-4 font-sans leading-relaxed">
              <li>
                {isBn
                  ? 'আপনার ফোনের Settings > Network & Internet > VPN এ যান।'
                  : 'Open Android Settings > Network & internet > VPN.'}
              </li>
              <li>
                {isBn
                  ? '"+" বাটনে ক্লিক করে Type নির্বাচন করুন: L2TP/IPsec PSK'
                  : 'Tap "+" and choose Type: L2TP/IPsec PSK.'}
              </li>
              <li>
                Server address:{' '}
                <span className="font-mono text-cyan-400">{activeProfile.serverAddress}</span>
              </li>
              <li>
                IPsec pre-shared key:{' '}
                <span className="font-mono text-cyan-400">
                  {activeProfile.ipsecPsk || 'your_secret'}
                </span>
              </li>
              <li>
                Username &amp; Password দিয়ে <strong>Save</strong> করে <strong>Connect</strong> করুন।
              </li>
              <li>
                {isBn
                  ? 'কানেক্ট করার সাথে সাথে আপনার MikroTik-এ WinBox > PPP > Active Connections-এ আপনার মোবাইল ডিভাইস সাথে সাথে দেখা যাবে!'
                  : 'Once connected, your device will immediately appear in WinBox > PPP > Active Connections!'}
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            {isBn ? 'বুঝেছি (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
