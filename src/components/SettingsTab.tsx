import {
  Settings,
  Shield,
  RefreshCw,
  Lock,
  Split,
  Globe,
  Radio,
  Info,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { VpnSettings } from '../types/vpn';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';

interface SettingsTabProps {
  settings: VpnSettings;
  onUpdateSettings: (newSettings: VpnSettings) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  onOpenMobileInstall?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  language,
  onLanguageChange,
  isFrameMode,
  onToggleFrameMode,
  onOpenMobileInstall,
}) => {
  const t = vpnTranslations[language];

  const toggle = (key: keyof VpnSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>{t.tabSettings}</span>
        </h2>
        <p className="text-[11px] text-slate-400 font-mono">
          L2TP/IPsec Android Configuration
        </p>
      </div>

      {/* Language & Viewport Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t.switchLanguage}</span>
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                language === 'bn'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>{language === 'bn' ? 'ডিসপ্লে মোড' : 'Display Mode'}</span>
          </span>
          <button
            onClick={onToggleFrameMode}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {isFrameMode ? t.fullScreenMode : t.frameMode}
          </button>
        </div>

        {/* Mobile Quick Install Card */}
        {onOpenMobileInstall && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'মোবাইলে ওপেন ও ইনস্টল করুন' : 'Open / Install on Mobile'}</span>
            </span>
            <button
              onClick={onOpenMobileInstall}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'QR কোড' : 'Get App'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Security & Connection Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 divide-y divide-slate-800">
        <div className="pb-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.killSwitch}</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.killSwitchDesc}</p>
          </div>
          <button
            onClick={() => toggle('killSwitch')}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.killSwitch ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.killSwitch ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="py-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.autoReconnect}</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.autoReconnectDesc}</p>
          </div>
          <button
            onClick={() => toggle('autoReconnect')}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.autoReconnect ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.autoReconnect ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="py-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.dnsLeakProtection}</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.dnsLeakProtectionDesc}</p>
          </div>
          <button
            onClick={() => toggle('dnsLeakProtection')}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.dnsLeakProtection ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.dnsLeakProtection ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="py-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.natTraversal}</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.natTraversalDesc}</p>
          </div>
          <button
            onClick={() => toggle('natTraversal')}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.natTraversal ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.natTraversal ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="pt-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Split className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.splitTunneling}</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.splitTunnelingDesc}</p>
          </div>
          <button
            onClick={() => toggle('splitTunneling')}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.splitTunneling ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.splitTunneling ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* App Play Store Info Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Info className="w-4 h-4 text-slate-400" />
          <span>{t.aboutTitle}</span>
        </div>

        <div className="text-[11px] text-slate-400 space-y-1 font-mono">
          <p className="text-white font-semibold">{t.version}</p>
          <p>{t.compatibility}</p>
          <p>Cipher: 3DES / AES-256 · Hash: SHA-256 · DH Group: 2/14</p>
          <p>Package: com.l2tp.vpnclient.pro</p>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Google Play Protect Verified</span>
        </div>
      </div>
    </div>
  );
};
