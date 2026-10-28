import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { QrCodeSvg } from './QrCodeSvg';
import { Language } from '../i18n/vpnTranslations';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Real app URL for mobile access
  const mobileUrl = window.location.origin;

  const copyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isBn ? 'মোবাইলে যেভাবে অ্যাপটি নিবেন' : 'Open & Install on Mobile'}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                  PWA APP
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Android &amp; iOS Compatible
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

        {/* Modal Body */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1 flex-1 text-xs text-slate-300">
          {/* 1. QR Code Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? '১. মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন:' : '1. Scan with Phone Camera:'}</span>
            </span>

            {/* Render Sharp SVG QR Code */}
            <div className="p-2 bg-white rounded-2xl shadow-md">
              <QrCodeSvg value={mobileUrl} size={150} />
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              {isBn
                ? 'আপনার ফোনের ক্যামেরা বা QR স্ক্যানার দিয়ে ওপরের কোডটি স্ক্যান করলেই সরাসরি অ্যাপটি ফোনে ওপেন হবে।'
                : 'Point your phone camera at this QR code to instantly launch the app.'}
            </p>
          </div>

          {/* 2. Copy Direct Link */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBn ? '২. অথবা মোবাইলের লিংক কপি করুন:' : '2. Or Copy Mobile Link:'}</span>
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={mobileUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[11px] text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : isBn ? 'কপি করুন' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 3. Install as APK/PWA Home Screen App */}
          <div className="bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Download className="w-4 h-4 shrink-0" />
              <span>{isBn ? '৩. মোবাইলে অ্যাপ হিসেবে ইনস্টল করার নিয়ম (Play Store Experience):' : '3. Install as Mobile App:'}</span>
            </div>

            <ol className="text-[11px] text-slate-300 space-y-2 list-decimal pl-4 font-sans leading-relaxed">
              <li>
                {isBn
                  ? 'মোবাইলে লিংকটি Chrome ব্রাউজারে ওপেন করুন।'
                  : 'Open the link in Chrome browser on your mobile phone.'}
              </li>
              <li>
                {isBn
                  ? 'Chrome ব্রাউজারের ওপরে ডানে ৩টি ডট (⋮) মেন্যুতে চাপুন।'
                  : 'Tap the three dots (⋮) menu in Chrome.'}
              </li>
              <li>
                {isBn ? (
                  <>
                    <strong className="text-emerald-400">"Install app"</strong> অথবা{' '}
                    <strong className="text-emerald-400">"Add to Home screen (হোম স্ক্রিনে যোগ করুন)"</strong> এ ক্লিক করুন।
                  </>
                ) : (
                  <>
                    Select <strong className="text-emerald-400">"Install app"</strong> or <strong className="text-emerald-400">"Add to Home screen"</strong>.
                  </>
                )}
              </li>
              <li>
                {isBn
                  ? 'এখন প্লে-স্টোরের মতো একটি অ্যাপ আইকন আপনার মোবাইলের স্ক্রিনে চলে আসবে এবং ব্রাউজার ছাড়া ফুল স্ক্রিন অ্যাপ হিসেবে চলবে!'
                  : 'The app icon will be added to your phone home screen and will run in full screen like a native Play Store app!'}
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
            {isBn ? 'ঠিক আছে (Done)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
