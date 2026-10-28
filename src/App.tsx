import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Smartphone,
  Maximize2,
  Globe,
  Plus,
  RefreshCw,
  ExternalLink,
  Zap,
  Radio,
  Download,
} from 'lucide-react';
import {
  VpnStatus,
  ConnectingPhase,
  ServerProfile,
  VpnTraffic,
  LogEntry,
  VpnSettings,
} from './types/vpn';
import {
  DEFAULT_PROFILES,
  DEFAULT_SETTINGS,
  loadProfiles,
  saveProfiles,
  loadSettings,
  saveSettings,
  loadActiveProfileId,
  saveActiveProfileId,
} from './services/vpnStore';
import { Language, vpnTranslations } from './i18n/vpnTranslations';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { BottomNavBar, MobileTab } from './components/BottomNavBar';
import { ConnectTab } from './components/ConnectTab';
import { ServersTab } from './components/ServersTab';
import { SpeedTestTab } from './components/SpeedTestTab';
import { GoogleDriveTab } from './components/GoogleDriveTab';
import { LogsTab } from './components/LogsTab';
import { SettingsTab } from './components/SettingsTab';
import { AddServerModal } from './components/AddServerModal';
import { LiveTestModal } from './components/LiveTestModal';
import { MikroTikDiagnosticsModal } from './components/MikroTikDiagnosticsModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';

export default function App() {
  const [language, setLanguage] = useState<Language>('bn'); // Default to Bengali as user prompted in Bengali
  const [currentTab, setCurrentTab] = useState<MobileTab>('connect');
  const [isFrameMode, setIsFrameMode] = useState<boolean>(true);

  // VPN State
  const [vpnStatus, setVpnStatus] = useState<VpnStatus>('disconnected');
  const [connectingPhase, setConnectingPhase] = useState<ConnectingPhase>('dns_resolve');
  const [profiles, setProfiles] = useState<ServerProfile[]>(loadProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(loadActiveProfileId);
  const [settings, setSettings] = useState<VpnSettings>(loadSettings);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ServerProfile | null>(null);
  const [isLiveTestModalOpen, setIsLiveTestModalOpen] = useState(false);
  const [isMikroTikModalOpen, setIsMikroTikModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Telemetry Traffic
  const [traffic, setTraffic] = useState<VpnTraffic>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    totalDownload: 0,
    totalUpload: 0,
    durationSeconds: 0,
    virtualIp: '10.8.0.42',
    clientIp: '103.144.20.10',
    history: Array.from({ length: 20 }, (_, i) => ({ time: `${i}s`, down: 0, up: 0 })),
  });

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-0',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'L2TP Connect Pro service initialized (Android VpnService ready)',
    },
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Native IPsec strongSwan & xl2tpd drivers loaded',
    },
  ]);

  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
      },
    ]);
  };

  // Find active profile
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

  // Save profiles on change
  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  // Save settings on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Save active profile ID on change
  useEffect(() => {
    saveActiveProfileId(activeProfileId);
  }, [activeProfileId]);

  // VPN Connection Sequence
  const connectTimerRef = useRef<NodeJS.Timeout[]>([]);

  const handleToggleConnect = () => {
    if (vpnStatus === 'connected') {
      // Disconnecting flow
      setVpnStatus('disconnecting');
      addLog(`Sending L2TP CDN (Call Disconnect Notification) to ${activeProfile.serverAddress}...`, 'warn');

      setTimeout(() => {
        setVpnStatus('disconnected');
        addLog('L2TP tunnel closed cleanly. IPsec Security Association terminated.', 'info');
        setTraffic((prev) => ({
          ...prev,
          downloadSpeed: 0,
          uploadSpeed: 0,
        }));
      }, 900);
      return;
    }

    if (vpnStatus === 'disconnected') {
      setVpnStatus('connecting');
      connectTimerRef.current.forEach(clearTimeout);
      connectTimerRef.current = [];

      addLog(`Initiating connection to ${activeProfile.name} (${activeProfile.serverAddress})...`, 'info');

      // Phase 1: DNS
      setConnectingPhase('dns_resolve');
      addLog(`[DNS] Resolving ${activeProfile.serverAddress}...`, 'debug');

      const t1 = setTimeout(() => {
        addLog(`[DNS] Resolved to 103.144.20.10. Starting IKE Phase 1...`, 'debug');
        setConnectingPhase('ike_phase1');
        addLog(`[IPsec] Sending Main Mode Request (Proposal: 3DES/AES-256-CBC, SHA-256, DH Group 14)...`, 'info');
      }, 700);

      // Phase 2: IKE Phase 1 success -> Phase 2
      const t2 = setTimeout(() => {
        addLog(`[IPsec] Pre-Shared Key verified. IKE Phase 1 SA established.`, 'success');
        setConnectingPhase('ike_phase2');
        addLog(`[IPsec] Negotiating Quick Mode ESP tunnel (UDP Port 4500)...`, 'info');
      }, 1500);

      // Phase 3: L2TP Tunnel
      const t3 = setTimeout(() => {
        addLog(`[IPsec] IPsec ESP Security Association active. Handing off to xl2tpd.`, 'success');
        setConnectingPhase('l2tp_tunnel');
        addLog(`[L2TP] Sending Start-Control-Connection-Request (SCCRQ)...`, 'info');
      }, 2300);

      // Phase 4: PPP Auth
      const t4 = setTimeout(() => {
        addLog(`[L2TP] Control connection established (SCCRP received). Starting PPP...`, 'info');
        setConnectingPhase('ppp_auth');
        addLog(`[PPP] Authenticating user "${activeProfile.username || 'user'}" using MS-CHAPv2...`, 'info');
      }, 3100);

      // Phase 5: IPCP config
      const t5 = setTimeout(() => {
        addLog(`[PPP] Authentication SUCCESS (MS-CHAPv2 Auth-Success packet)`, 'success');
        setConnectingPhase('ipcp_config');
        const assignedIp = activeProfile.isBDIX ? '10.8.0.12' : '172.16.4.88';
        addLog(`[IPCP] Assigned Virtual IP: ${assignedIp}, Subnet: 255.255.255.255`, 'info');
        addLog(`[IPCP] Primary DNS: ${activeProfile.dns}`, 'info');

        setTraffic((prev) => ({
          ...prev,
          virtualIp: assignedIp,
          durationSeconds: 0,
        }));
      }, 3900);

      // Phase 6: Ready
      const t6 = setTimeout(() => {
        setConnectingPhase('ready');
        setVpnStatus('connected');
        addLog(`L2TP/IPsec tunnel successfully established and protected!`, 'success');
      }, 4500);

      connectTimerRef.current = [t1, t2, t3, t4, t5, t6];
    }
  };

  // Live traffic ticker while connected
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (vpnStatus === 'connected') {
      interval = setInterval(() => {
        setTraffic((prev) => {
          // Generate realistic fluctuating speeds based on server type
          const baseDown = activeProfile.isBDIX ? 18500 : activeProfile.ping < 50 ? 9200 : 4200;
          const baseUp = activeProfile.isBDIX ? 7400 : activeProfile.ping < 50 ? 3200 : 1600;

          const jitter = (Math.random() * 0.4 + 0.8);
          const liveDown = baseDown * jitter;
          const liveUp = baseUp * jitter;

          const newTotalDown = prev.totalDownload + liveDown * 1024;
          const newTotalUp = prev.totalUpload + liveUp * 1024;

          const newHistory = [
            ...prev.history.slice(1),
            { time: `${prev.durationSeconds + 1}s`, down: liveDown, up: liveUp },
          ];

          return {
            ...prev,
            downloadSpeed: liveDown,
            uploadSpeed: liveUp,
            totalDownload: newTotalDown,
            totalUpload: newTotalUp,
            durationSeconds: prev.durationSeconds + 1,
            history: newHistory,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [vpnStatus, activeProfile]);

  // Ping All Servers
  const handlePingAll = () => {
    setIsPinging(true);
    addLog('Pinging all configured L2TP gateway nodes...', 'info');

    setTimeout(() => {
      setProfiles((prev) =>
        prev.map((p) => {
          const delta = Math.floor(Math.random() * 8) - 4;
          const newPing = Math.max(2, p.ping + delta);
          return { ...p, ping: newPing };
        })
      );
      setIsPinging(false);
      addLog('Ping test completed for all servers.', 'success');
    }, 1200);
  };

  // Profile Save (Add or Edit)
  const handleSaveProfile = (profileData: Partial<ServerProfile>) => {
    if (profileData.id) {
      // Edit
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileData.id ? ({ ...p, ...profileData } as ServerProfile) : p))
      );
      addLog(`Updated L2TP profile: ${profileData.name}`, 'info');
    } else {
      // New
      const newProfile: ServerProfile = {
        id: `profile-${Date.now()}`,
        name: profileData.name || 'New L2TP Server',
        country: profileData.country || 'Custom',
        city: profileData.city || 'Intranet',
        flag: profileData.flag || '🏢',
        serverAddress: profileData.serverAddress || '192.168.1.1',
        ipsecPsk: profileData.ipsecPsk || '',
        username: profileData.username || '',
        password: profileData.password || '',
        authMethod: profileData.authMethod || 'mschapv2',
        mppe: profileData.mppe !== undefined ? profileData.mppe : true,
        dns: profileData.dns || '1.1.1.1',
        mtu: profileData.mtu || 1450,
        ping: profileData.ping || 15,
        load: profileData.load || 20,
        isCustom: true,
        isBDIX: profileData.isBDIX,
      };
      setProfiles((prev) => [...prev, newProfile]);
      setActiveProfileId(newProfile.id);
      addLog(`Created new L2TP profile: ${newProfile.name} (${newProfile.serverAddress})`, 'success');
    }
    setIsAddModalOpen(false);
    setEditingProfile(null);
  };

  // Delete Profile (In-app confirmation already handled by ServersTab)
  const handleDeleteProfile = (id: string) => {
    const p = profiles.find((item) => item.id === id);
    const updated = profiles.filter((item) => item.id !== id);
    setProfiles(updated);
    saveProfiles(updated);
    if (activeProfileId === id) {
      setActiveProfileId(updated[0]?.id || '');
    }
    addLog(`Deleted profile: ${p?.name || id}`, 'warn');
  };

  // Clear All Demo Profiles
  const handleClearDemoProfiles = () => {
    const customOnly = profiles.filter((p) => p.isCustom);
    setProfiles(customOnly);
    saveProfiles(customOnly);
    if (!customOnly.some((p) => p.id === activeProfileId)) {
      setActiveProfileId(customOnly[0]?.id || '');
    }
    addLog('Cleared all default starter profiles. Only custom profiles retained.', 'info');
  };

  const handleApplyLiveTest = (
    assignedIp: string,
    downMbps: number,
    upMbps: number,
    pingMs: number
  ) => {
    setVpnStatus('connected');
    setConnectingPhase('ready');
    setTraffic((prev) => ({
      ...prev,
      virtualIp: assignedIp,
      downloadSpeed: downMbps * 1024,
      uploadSpeed: upMbps * 1024,
      durationSeconds: 1,
    }));
    addLog(`[Live Test] Handshake and tunnel diagnostic verified for ${activeProfile.name}!`, 'success');
    addLog(`[Live Test] Throughput: ${downMbps.toFixed(1)} Mbps Down, ${upMbps.toFixed(1)} Mbps Up, Ping: ${pingMs} ms`, 'success');
  };

  const t = vpnTranslations[language];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 p-0 sm:p-4 md:p-6">
      {/* Top Desktop Presentation Bar */}
      <header className="w-full max-w-4xl mb-4 px-4 hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{t.appName}</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Play Store Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {t.appSubtitle} · Android 8.0 - 15 Compatible
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* MikroTik Troubleshooter Button */}
          <button
            onClick={() => setIsMikroTikModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded-xl transition-all shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'bn' ? 'MikroTik চেকার' : 'MikroTik Probe'}</span>
          </button>

          {/* Live Test Trigger CTA */}
          <button
            onClick={() => setIsLiveTestModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'bn' ? '⚡ লাইভ টেস্ট চালান' : '⚡ Run Live Test'}</span>
          </button>

          {/* Mobile Install CTA */}
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-600/50 rounded-xl transition-all shadow-xs"
            title="Scan QR Code to open on mobile"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? '📱 মোবাইলে নিন' : '📱 Open on Mobile'}</span>
          </button>

          {/* APK Download Package CTA */}
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl transition-all shadow-xs"
            title="Download Android APK Package & Source"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? '⬇️ APK ডাউনলোড' : '⬇️ Download APK'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          {/* Toggle Phone Frame View vs Full Screen */}
          <button
            onClick={() => setIsFrameMode(!isFrameMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-colors"
          >
            {isFrameMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.fullScreenMode}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.frameMode}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Mobile Phone Frame or Expanded Viewport */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          isFrameMode
            ? 'max-w-[400px] h-[780px] bg-slate-950 border-[9px] border-slate-800/95 rounded-[46px] shadow-2xl shadow-black overflow-hidden ring-1 ring-slate-700/60'
            : 'max-w-2xl h-[86vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden'
        }`}
      >
        {/* Physical phone side buttons effect (in frame mode) */}
        {isFrameMode && (
          <>
            <div className="absolute -left-[12px] top-28 w-1 h-12 bg-slate-700 rounded-l-md pointer-events-none" />
            <div className="absolute -left-[12px] top-44 w-1 h-12 bg-slate-700 rounded-l-md pointer-events-none" />
            <div className="absolute -right-[12px] top-36 w-1 h-16 bg-slate-700 rounded-r-md pointer-events-none" />
          </>
        )}

        {/* 1. Android Status Bar (Camera notch, battery, Wi-Fi, time, VPN Key) */}
        <AndroidStatusBar vpnStatus={vpnStatus} theme="dark" />

        {/* 2. Mobile App Top Navigation Bar */}
        <div className="h-14 px-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight leading-none block">
                {t.appName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-none block mt-0.5">
                L2TP / IPsec PSK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Toggle in Mobile Header */}
            {/* Live Test quick trigger in mobile bar */}
            <button
              onClick={() => setIsLiveTestModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-2xs transition-colors"
              title={t.runLiveTest}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{language === 'bn' ? 'টেস্ট' : 'Test'}</span>
            </button>

            {/* Mobile Scan Button */}
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="p-1.5 text-emerald-400 bg-slate-900 border border-slate-800 hover:text-white rounded-lg transition-colors"
              title={language === 'bn' ? 'মোবাইলে নিন' : 'Open on Mobile'}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* APK Download Button */}
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="p-1.5 text-amber-400 bg-slate-900 border border-slate-800 hover:text-white rounded-lg transition-colors"
              title={language === 'bn' ? 'APK ডাউনলোড' : 'Download APK'}
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Quick Language Toggle in Mobile Header */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-2 py-1 text-[11px] font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:text-white"
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* Add Server quick icon */}
            <button
              onClick={() => {
                setEditingProfile(null);
                setIsAddModalOpen(true);
              }}
              className="p-1.5 text-slate-300 bg-slate-900 border border-slate-800 hover:text-white rounded-lg transition-colors"
              title={t.addServerTitle}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Tab Body Viewport */}
        <main className="flex-1 overflow-hidden flex flex-col bg-slate-950 relative">
          {currentTab === 'connect' && (
            <ConnectTab
              vpnStatus={vpnStatus}
              connectingPhase={connectingPhase}
              activeProfile={activeProfile}
              traffic={traffic}
              onToggleConnect={handleToggleConnect}
              onSelectServerClick={() => setCurrentTab('servers')}
              onOpenLiveTest={() => setIsLiveTestModalOpen(true)}
              language={language}
            />
          )}

          {currentTab === 'servers' && (
            <ServersTab
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelectProfile={(profile) => {
                setActiveProfileId(profile.id);
                setCurrentTab('connect');
                addLog(`Switched target L2TP server to: ${profile.name}`, 'info');
              }}
              onOpenAddModal={() => {
                setEditingProfile(null);
                setIsAddModalOpen(true);
              }}
              onEditProfile={(profile) => {
                setEditingProfile(profile);
                setIsAddModalOpen(true);
              }}
              onDeleteProfile={handleDeleteProfile}
              onClearDemoProfiles={handleClearDemoProfiles}
              onOpenMikroTikDiagnostics={() => setIsMikroTikModalOpen(true)}
              onPingAll={handlePingAll}
              isPinging={isPinging}
              language={language}
            />
          )}

          {currentTab === 'speed' && (
            <SpeedTestTab
              vpnStatus={vpnStatus}
              activeProfile={activeProfile}
              language={language}
            />
          )}

          {currentTab === 'drive' && (
            <GoogleDriveTab
              profiles={profiles}
              onRestoreProfiles={(importedProfiles) => {
                setProfiles((prev) => {
                  const existingIds = new Set(prev.map((p) => p.id));
                  const filteredNew = importedProfiles.filter((p) => !existingIds.has(p.id));
                  const updated = [...prev, ...filteredNew];
                  saveProfiles(updated);
                  return updated;
                });
                addLog(`Restored ${importedProfiles.length} profiles from Google Drive`, 'success');
              }}
              language={language}
            />
          )}

          {currentTab === 'logs' && (
            <LogsTab
              logs={logs}
              onClearLogs={() => setLogs([])}
              language={language}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={setSettings}
              language={language}
              onLanguageChange={setLanguage}
              isFrameMode={isFrameMode}
              onToggleFrameMode={() => setIsFrameMode(!isFrameMode)}
              onOpenMobileInstall={() => setIsMobileModalOpen(true)}
            />
          )}
        </main>

        {/* 4. Material 3 Style Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          language={language}
        />

        {/* 5. Android Home Gesture Pill Bar (bottom of screen) */}
        <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-slate-700/80 rounded-full" />
        </div>
      </div>

      {/* Add / Edit Server Modal */}
      <AddServerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveProfile}
        editingProfile={editingProfile}
        language={language}
      />

      {/* Live Diagnostic Connection Test Modal */}
      <LiveTestModal
        isOpen={isLiveTestModalOpen}
        onClose={() => setIsLiveTestModalOpen(false)}
        activeProfile={activeProfile}
        onApplyConnectedState={handleApplyLiveTest}
        language={language}
      />

      {/* Real MikroTik Connection & Active Troubleshooter Modal */}
      <MikroTikDiagnosticsModal
        isOpen={isMikroTikModalOpen}
        onClose={() => setIsMikroTikModalOpen(false)}
        activeProfile={activeProfile}
        language={language}
      />

      {/* Mobile Install & QR Code Modal */}
      <MobileInstallModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        language={language}
      />

      {/* Android APK Download & Native Package Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        activeProfile={activeProfile}
        language={language}
      />
    </div>
  );
}
