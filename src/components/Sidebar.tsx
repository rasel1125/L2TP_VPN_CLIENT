import React from 'react';
import {
  Folder,
  FileText,
  Image,
  Film,
  Music,
  Code,
  Star,
  Trash2,
  HardDrive,
  Wifi,
  FolderPlus,
  Plus,
  Server,
  Share2,
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { ActiveSection, StoredItem } from '../types';
import { formatBytes } from '../services/storageService';

interface SidebarProps {
  language: Language;
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  items: StoredItem[];
  onOpenNewFolder: () => void;
  onOpenWifiDrop: () => void;
  usedBytes: number;
  totalCapacityGb: number;
  lanIp: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  language,
  activeSection,
  onSelectSection,
  items,
  onOpenNewFolder,
  onOpenWifiDrop,
  usedBytes,
  totalCapacityGb,
  lanIp,
}) => {
  const t = translations[language];

  // Calculate live counts
  const nonTrashItems = items.filter((i) => !i.inTrash);
  const trashItems = items.filter((i) => i.inTrash);
  const starredItems = nonTrashItems.filter((i) => i.starred);

  const getCount = (section: ActiveSection): number => {
    switch (section) {
      case 'all':
        return nonTrashItems.length;
      case 'documents':
        return nonTrashItems.filter((i) => i.category === 'document').length;
      case 'images':
        return nonTrashItems.filter((i) => i.category === 'image').length;
      case 'videos':
        return nonTrashItems.filter((i) => i.category === 'video').length;
      case 'audio':
        return nonTrashItems.filter((i) => i.category === 'audio').length;
      case 'archives':
        return nonTrashItems.filter(
          (i) => i.category === 'archive' || i.category === 'code'
        ).length;
      case 'starred':
        return starredItems.length;
      case 'trash':
        return trashItems.length;
      default:
        return 0;
    }
  };

  const navItems: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
    {
      id: 'all',
      label: t.allFiles,
      icon: <Folder className="w-4 h-4" />,
    },
    {
      id: 'documents',
      label: t.documents,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'images',
      label: t.images,
      icon: <Image className="w-4 h-4" />,
    },
    {
      id: 'videos',
      label: t.videos,
      icon: <Film className="w-4 h-4" />,
    },
    {
      id: 'audio',
      label: t.audio,
      icon: <Music className="w-4 h-4" />,
    },
    {
      id: 'archives',
      label: t.archives,
      icon: <Code className="w-4 h-4" />,
    },
    {
      id: 'starred',
      label: t.starred,
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'trash',
      label: t.trash,
      icon: <Trash2 className="w-4 h-4" />,
    },
  ];

  // Storage usage calculation
  const totalCapacityBytes = totalCapacityGb * 1024 * 1024 * 1024;
  const usagePercentage = Math.min(100, Math.max(0.5, (usedBytes / totalCapacityBytes) * 100));

  return (
    <aside className="w-64 bg-slate-50 border-r border-neutral-200 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewFolder}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-neutral-200 rounded-lg shadow-2xs transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-slate-600" />
            <span>{t.newFolder}</span>
          </button>
          <button
            onClick={onOpenWifiDrop}
            className="flex items-center justify-center p-2 text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-neutral-200 rounded-lg shadow-2xs transition-colors"
            title={t.wifiDropTitle}
          >
            <Wifi className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'bn' ? 'ফাইল ক্যাটাগরি' : 'Storage Categories'}
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const count = getCount(item.id);
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Server & LAN Tools */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'bn' ? 'সার্ভার ও নেটওয়ার্ক' : 'Server & Network'}
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectSection('server')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeSection === 'server'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Server
                  className={`w-4 h-4 ${
                    activeSection === 'server' ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <span>{t.serverMonitor}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                LAN
              </span>
            </button>

            <button
              onClick={onOpenWifiDrop}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>{t.wifiDropTitle}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Wi-Fi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Storage Pool Usage Widget */}
      <div className="p-4 border-t border-neutral-200 bg-slate-100/60">
        <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
          <span className="font-semibold flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.storageUsage}</span>
          </span>
          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
            {usagePercentage.toFixed(1)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(2, usagePercentage)}%` }}
          />
        </div>

        <div className="text-[11px] text-slate-500 font-mono tabular-nums flex items-center justify-between">
          <span>{formatBytes(usedBytes)}</span>
          <span>{totalCapacityGb >= 1000 ? `${(totalCapacityGb / 1000).toFixed(1)} TB` : `${totalCapacityGb} GB`}</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-neutral-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>LAN IP:</span>
          <span className="font-mono font-medium text-slate-800">{lanIp}</span>
        </div>
      </div>
    </aside>
  );
};
