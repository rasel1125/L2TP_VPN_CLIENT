import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Check,
  Edit2,
  Trash2,
  Search,
  Zap,
  Server,
  AlertTriangle,
  X,
  Radio,
} from 'lucide-react';
import { ServerProfile } from '../types/vpn';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';

interface ServersTabProps {
  profiles: ServerProfile[];
  activeProfileId: string;
  onSelectProfile: (profile: ServerProfile) => void;
  onOpenAddModal: () => void;
  onEditProfile: (profile: ServerProfile) => void;
  onDeleteProfile: (id: string) => void;
  onClearDemoProfiles: () => void;
  onOpenMikroTikDiagnostics: () => void;
  onPingAll: () => void;
  isPinging: boolean;
  language: Language;
}

export const ServersTab: React.FC<ServersTabProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onOpenAddModal,
  onEditProfile,
  onDeleteProfile,
  onClearDemoProfiles,
  onOpenMikroTikDiagnostics,
  onPingAll,
  isPinging,
  language,
}) => {
  const t = vpnTranslations[language];
  const [filter, setFilter] = useState<'all' | 'bdix' | 'global' | 'custom'>('all');
  const [search, setSearch] = useState('');
  const [profileToDelete, setProfileToDelete] = useState<ServerProfile | null>(null);
  const [confirmClearDemos, setConfirmClearDemos] = useState(false);

  const isBn = language === 'bn';

  const demoProfilesCount = profiles.filter((p) => !p.isCustom).length;

  const filteredProfiles = profiles.filter((p) => {
    // Filter type
    if (filter === 'bdix' && !p.isBDIX) return false;
    if (filter === 'global' && (p.isBDIX || p.isCustom)) return false;
    if (filter === 'custom' && !p.isCustom) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.serverAddress.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPingColor = (ping: number) => {
    if (ping < 45) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (ping < 120) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      onDeleteProfile(profileToDelete.id);
      setProfileToDelete(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3.5 relative">
      {/* Header bar with count & Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>{t.tabServers}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            {profiles.length} {t.serversCount}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* MikroTik Diagnostics Trigger */}
          <button
            onClick={onOpenMikroTikDiagnostics}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-semibold rounded-xl transition-colors shadow-xs"
            title="MikroTik Connection Troubleshooter"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>MikroTik Check</span>
          </button>

          {/* Ping All */}
          <button
            onClick={onPingAll}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
            title={t.testAllPings}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{t.testAllPings}</span>
          </button>

          {/* Add Profile */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'যুক্ত করুন' : 'Add L2TP'}</span>
          </button>
        </div>
      </div>

      {/* Clear Demo Profiles Banner (If demo profiles exist) */}
      {demoProfilesCount > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-slate-400 truncate">
            <span>{isBn ? 'পূর্ববর্তী ডেমো প্রোফাইল:' : 'Demo profiles:'} </span>
            <span className="font-bold text-slate-200">{demoProfilesCount} টি</span>
          </div>
          <button
            onClick={() => setConfirmClearDemos(true)}
            className="px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 rounded-xl transition-colors shrink-0"
          >
            {isBn ? 'সব ডেমো প্রোফাইল মুছুন' : 'Remove Demo Profiles'}
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isBn ? 'সার্ভার খুঁজুন (নাম, আইপি)...' : 'Search servers, IP, location...'}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            filter === 'all'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.filterAll}
        </button>
        <button
          onClick={() => setFilter('bdix')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            filter === 'bdix'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.filterBdix}
        </button>
        <button
          onClick={() => setFilter('global')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            filter === 'global'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.filterGlobal}
        </button>
        <button
          onClick={() => setFilter('custom')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            filter === 'custom'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.filterCustom}
        </button>
      </div>

      {/* Server List */}
      <div className="space-y-2 flex-1">
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <p className="text-sm text-slate-400 font-medium">
              {isBn ? 'কোনো প্রোফাইল নেই' : 'No servers available'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'আপনার MikroTik L2TP সার্ভার যুক্ত করতে ওপরের "+ যুক্ত করুন" বাটনে ক্লিক করুন।'
                : 'Click "+ Add L2TP" to configure your MikroTik VPN profile.'}
            </p>
          </div>
        ) : (
          filteredProfiles.map((p) => {
            const isSelected = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProfile(p)}
                className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-slate-850/90 border-emerald-500/60 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850/60 hover:border-slate-700'
                }`}
              >
                {/* Left: Flag & Details */}
                <div className="flex items-center gap-3 truncate min-w-0">
                  <span className="text-2xl select-none shrink-0">{p.flag}</span>
                  <div className="truncate min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-semibold text-white truncate">
                        {p.name}
                      </span>
                      {p.isBDIX && (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1 rounded shrink-0">
                          BDIX
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate flex items-center gap-1.5 mt-0.5">
                      <span>{p.serverAddress}</span>
                      <span>·</span>
                      <span className="text-slate-500">{p.authMethod.toUpperCase()}</span>
                      {p.username && (
                        <>
                          <span>·</span>
                          <span className="text-cyan-400">{p.username}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Ping & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${getPingColor(
                      p.ping
                    )}`}
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>{p.ping} ms</span>
                  </span>

                  {/* Edit and Delete Actions available on ALL profiles */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEditProfile(p)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title={t.editServerTitle}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProfileToDelete(p)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title={t.deleteProfile}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* In-App Single Profile Delete Confirmation Dialog (Never fails in iframe) */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{isBn ? 'প্রোফাইল মুছে ফেলবেন?' : 'Delete Server Profile?'}</span>
            </div>
            <p className="text-xs text-slate-300">
              {isBn
                ? `আপনি কি নিশ্চিতভাবে "${profileToDelete.name}" প্রোফাইলটি মুছে ফেলতে চান?`
                : `Are you sure you want to delete "${profileToDelete.name}"?`}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setProfileToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-xs"
              >
                {t.deleteProfile}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Clear All Demo Profiles Dialog */}
      {confirmClearDemos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{isBn ? 'সব ডেমো প্রোফাইল মুছবেন?' : 'Remove All Demo Profiles?'}</span>
            </div>
            <p className="text-xs text-slate-300">
              {isBn
                ? 'পূর্ববর্তী সকল ডিফল্ট ডেমো প্রোফাইল তালিকা থেকে মুছে যাবে। কেবলমাত্র আপনার যুক্ত করা কাস্টম ও মাইক্রোটিক প্রোফাইল থাকবে।'
                : 'All default starter profiles will be removed, keeping only your custom MikroTik servers.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmClearDemos(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  onClearDemoProfiles();
                  setConfirmClearDemos(false);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-xs"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
