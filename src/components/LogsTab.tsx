import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Check, Download, Info } from 'lucide-react';
import { LogEntry } from '../types/vpn';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';

interface LogsTabProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  language: Language;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs, language }) => {
  const t = vpnTranslations[language];
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const copyToClipboard = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400';
      case 'warn':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      case 'debug':
        return 'text-slate-500';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{t.serverLogsTitle}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            {logs.length} events logged · Android VpnService
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            title={t.copyLogs}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copiedNotice : t.copyLogs}</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition-colors"
            title={t.clearLogs}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        className="flex-1 bg-slate-950 border border-slate-800/90 rounded-2xl p-3 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1 select-text shadow-inner"
      >
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <Info className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>Log buffer is empty. Connect to see handshake packets.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 break-all">
              <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
              <span className={`uppercase font-bold text-[9px] px-1 py-0.2 rounded shrink-0 select-none ${
                log.level === 'success' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' :
                log.level === 'warn' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40' :
                log.level === 'error' ? 'bg-rose-950/80 text-rose-400 border border-rose-800/40' :
                'bg-slate-900 text-slate-400'
              }`}>
                {log.level}
              </span>
              <span className={`${getLogColor(log.level)}`}>{log.message}</span>
            </div>
          ))
        )}
      </div>

      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0 px-1">
        <span>Protocol: RFC 2661 / RFC 3193 IPsec-L2TP</span>
        <span>Buffer: 250 Lines</span>
      </div>
    </div>
  );
};
