import React from 'react';
import { Shield, Server, Gauge, Terminal, Settings, Cloud } from 'lucide-react';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';

export type MobileTab = 'connect' | 'servers' | 'speed' | 'drive' | 'logs' | 'settings';

interface BottomNavBarProps {
  currentTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  language: Language;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onChangeTab, language }) => {
  const t = vpnTranslations[language];

  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'connect',
      label: t.tabConnect,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'servers',
      label: t.tabServers,
      icon: <Server className="w-4 h-4" />,
    },
    {
      id: 'speed',
      label: t.tabSpeed,
      icon: <Gauge className="w-4 h-4" />,
    },
    {
      id: 'drive',
      label: language === 'bn' ? 'ড্রাইভ' : 'Drive',
      icon: <Cloud className="w-4 h-4" />,
    },
    {
      id: 'logs',
      label: t.tabLogs,
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: t.tabSettings,
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-1 grid grid-cols-6 items-center z-30 shrink-0">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all rounded-xl relative ${
              isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-emerald-500/15' : 'bg-transparent'
              }`}
            >
              {tab.icon}
            </div>
            <span
              className={`text-[9px] tracking-tight mt-0.5 truncate max-w-[56px] font-medium ${
                isActive ? 'font-semibold text-emerald-400' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 bg-emerald-400 rounded-full absolute bottom-1" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
