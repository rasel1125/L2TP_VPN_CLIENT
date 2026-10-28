import React from 'react';
import { Upload, HardDrive, Wifi, Plus, Globe } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { ActiveSection } from '../types';

interface TopBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  onTriggerUpload: () => void;
  onOpenNewFolder: () => void;
  onOpenNewDoc: () => void;
  onOpenWifiDrop: () => void;
  lanIp: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  language,
  onLanguageChange,
  activeSection,
  onSelectSection,
  onTriggerUpload,
  onOpenNewFolder,
  onOpenNewDoc,
  onOpenWifiDrop,
  lanIp,
}) => {
  const t = translations[language];

  return (
    <header className="h-16 px-6 bg-white border-b border-neutral-200 flex items-center justify-between gap-8 shrink-0 z-20">
      {/* Zone 1: Single Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectSection('all')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <HardDrive className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
              {t.brand}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums block">
              {lanIp}:3000
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onSelectSection('all')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeSection === 'all'
              ? 'text-slate-950 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          {t.allFiles}
        </button>

        <button
          onClick={() => onSelectSection('images')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeSection === 'images'
              ? 'text-slate-950 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          {t.images}
        </button>

        <button
          onClick={() => onSelectSection('documents')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeSection === 'documents'
              ? 'text-slate-950 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          {t.documents}
        </button>

        <button
          onClick={() => onSelectSection('server')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeSection === 'server'
              ? 'text-slate-950 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          {t.serverMonitor}
        </button>

        <button
          onClick={onOpenWifiDrop}
          className="whitespace-nowrap shrink-0 flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <Wifi className="w-4 h-4" />
          <span>{t.wifiDropTitle}</span>
        </button>
      </nav>

      {/* Zone 3: Actions + Language Toggle + Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language switcher */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          title="বাংলা / English"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
        </button>

        {/* Create quick document/note */}
        <button
          onClick={onOpenNewDoc}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          title={t.newDoc}
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.newDoc}</span>
        </button>

        {/* Primary Upload Action */}
        <button
          onClick={onTriggerUpload}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>{t.uploadFiles}</span>
        </button>
      </div>
    </header>
  );
};
