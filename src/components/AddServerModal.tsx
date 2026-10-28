import React, { useState } from 'react';
import { X, Key, Lock, User, Globe, Server, Eye, EyeOff, Shield } from 'lucide-react';
import { ServerProfile } from '../types/vpn';
import { Language, vpnTranslations } from '../i18n/vpnTranslations';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<ServerProfile>) => void;
  editingProfile?: ServerProfile | null;
  language: Language;
}

export const AddServerModal: React.FC<AddServerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProfile,
  language,
}) => {
  const t = vpnTranslations[language];

  const [name, setName] = useState(editingProfile?.name || '');
  const [serverAddress, setServerAddress] = useState(editingProfile?.serverAddress || '');
  const [ipsecPsk, setIpsecPsk] = useState(editingProfile?.ipsecPsk || '');
  const [username, setUsername] = useState(editingProfile?.username || '');
  const [password, setPassword] = useState(editingProfile?.password || '');
  const [authMethod, setAuthMethod] = useState<'mschapv2' | 'pap' | 'chap'>(
    editingProfile?.authMethod || 'mschapv2'
  );
  const [mppe, setMppe] = useState(editingProfile ? editingProfile.mppe : true);
  const [dns, setDns] = useState(editingProfile?.dns || '1.1.1.1, 8.8.8.8');
  const [mtu, setMtu] = useState(editingProfile?.mtu || 1450);
  const [isBDIX, setIsBDIX] = useState(editingProfile?.isBDIX || false);
  const [showPsk, setShowPsk] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serverAddress.trim()) return;

    onSave({
      id: editingProfile?.id,
      name: name.trim(),
      country: isBDIX ? 'Bangladesh' : 'Custom Network',
      city: isBDIX ? 'Dhaka' : 'Intranet',
      flag: isBDIX ? '🇧🇩' : '🏢',
      serverAddress: serverAddress.trim(),
      ipsecPsk: ipsecPsk.trim(),
      username: username.trim(),
      password: password.trim(),
      authMethod,
      mppe,
      dns: dns.trim(),
      mtu: Number(mtu) || 1450,
      isCustom: true,
      isBDIX,
      ping: Math.floor(Math.random() * 20) + 5,
      load: Math.floor(Math.random() * 30) + 10,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {editingProfile ? t.editServerTitle : t.addServerTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-3 space-y-3.5 pr-1 flex-1">
          {/* Profile Name */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              {t.serverName} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.serverNamePlaceholder}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {/* Server Address */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              {t.serverAddress} *
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={serverAddress}
                onChange={(e) => setServerAddress(e.target.value)}
                placeholder={t.serverAddressPlaceholder}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* IPsec Pre-Shared Key (Secret) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>{t.ipsecSecret} *</span>
              <span className="text-[10px] text-emerald-400 font-mono">IPsec PSK</span>
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPsk ? 'text' : 'password'}
                required
                value={ipsecPsk}
                onChange={(e) => setIpsecPsk(e.target.value)}
                placeholder={t.ipsecSecretPlaceholder}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-9 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPsk(!showPsk)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                {showPsk ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                {t.username}
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="vpn_user"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-2 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-7 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Auth Method Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              {t.authMethod}
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
              {(['mschapv2', 'pap', 'chap'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setAuthMethod(method)}
                  className={`py-1 text-xs font-mono font-medium rounded-lg uppercase transition-colors ${
                    authMethod === method
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* MTU & DNS */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                {t.mtuSize}
              </label>
              <input
                type="number"
                value={mtu}
                onChange={(e) => setMtu(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                {t.dnsServer}
              </label>
              <input
                type="text"
                value={dns}
                onChange={(e) => setDns(e.target.value)}
                placeholder="1.1.1.1"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* MPPE & BDIX Toggles */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>MPPE 128-bit Encryption</span>
              <input
                type="checkbox"
                checked={mppe}
                onChange={(e) => setMppe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <span>🇧🇩 BDIX Local Route</span>
              </span>
              <input
                type="checkbox"
                checked={isBDIX}
                onChange={(e) => setIsBDIX(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
              />
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-xs"
            >
              {t.saveProfile}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
