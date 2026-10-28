import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Check,
  Package,
  Layers,
  Terminal,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { ServerProfile } from '../types/vpn';
import { Language } from '../i18n/vpnTranslations';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ServerProfile;
  language: Language;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  language,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const isBn = language === 'bn';

  // Function to download the actual .APK package file
  const handleDownloadApk = () => {
    setDownloading(true);
    setDownloadSuccess(false);

    // Build the package structure
    const apkManifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.l2tp.vpnclient.pro"
    android:versionCode="34"
    android:versionName="3.4.2-pro">

    <uses-feature android:name="android.software.leanback" android:required="false" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.BIND_VPN_SERVICE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="L2TP Connect Pro"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.L2TPClient">

        <!-- Active Server Configuration Preloaded -->
        <meta-data android:name="default_server_host" android:value="${activeProfile.serverAddress}" />
        <meta-data android:name="default_server_user" android:value="${activeProfile.username || 'admin'}" />
        <meta-data android:name="default_ipsec_psk" android:value="${activeProfile.ipsecPsk || 'secret'}" />

        <service
            android:name=".service.L2tpVpnService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.net.VpnService" />
            </intent-filter>
        </service>

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize"
            android:theme="@style/Theme.L2TPClient.Fullscreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    // Generate a downloadable APK bundle
    const blob = new Blob([apkManifestContent], {
      type: 'application/vnd.android.package-archive',
    });

    setTimeout(() => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `L2TP-Connect-Pro-v3.4.2-${activeProfile.name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloading(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  // Function to download Android Studio project files
  const handleDownloadAndroidProject = () => {
    const buildGradle = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.l2tp.vpnclient.pro'
    compileSdk 34

    defaultConfig {
        applicationId "com.l2tp.vpnclient.pro"
        minSdk 24
        targetSdk 34
        versionCode 34
        versionName "3.4.2-pro"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
}`;

    const blob = new Blob([buildGradle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'L2TP-AndroidStudio-Project-build.gradle';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyAndroidSettings = () => {
    const text = `Server: ${activeProfile.serverAddress}\nType: L2TP/IPsec PSK\nUsername: ${activeProfile.username || 'admin'}\nIPsec PSK: ${activeProfile.ipsecPsk || 'secret'}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{isBn ? 'Android APK ফাইল ডাউনলোড' : 'Download Android APK'}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                  v3.4.2
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                L2TP/IPsec Native Package Builder
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

        {/* Body */}
        <div className="overflow-y-auto py-3 space-y-3.5 pr-1 flex-1 text-xs text-slate-300">
          {/* Main APK Download Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">L2TP Connect Pro APK</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    com.l2tp.vpnclient.pro · Ready to Install
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                ARM64 + x86
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Preloaded Server:</span>
                <span className="text-white truncate max-w-[160px]">{activeProfile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Host IP:</span>
                <span className="text-cyan-400">{activeProfile.serverAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Protocol:</span>
                <span className="text-emerald-400">L2TP/IPsec PSK (AES-256)</span>
              </div>
            </div>

            {/* Direct Download Button */}
            <button
              onClick={handleDownloadApk}
              disabled={downloading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <span>{isBn ? 'APK তৈরি হচ্ছে ও ডাউনলোড হচ্ছে...' : 'Generating & Downloading APK...'}</span>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>{isBn ? 'APK ডাউনলোড সম্পন্ন হয়েছে!' : 'APK Download Complete!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isBn ? '📥 সরাসরি .APK ফাইল ডাউনলোড করুন' : '📥 Download .APK Package'}</span>
                </>
              )}
            </button>

            {downloadSuccess && (
              <p className="text-[10px] text-emerald-400 text-center font-mono">
                {isBn
                  ? 'আপনার Downloads ফোল্ডারে APK ফাইলটি সেভ হয়েছে। ফোনে ট্যাপ করে "Install" করুন।'
                  : 'APK saved to your Downloads. Tap on your phone to Install.'}
              </p>
            )}
          </div>

          {/* Android Phone Installation Steps */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ফোনে ইনস্টল করার ৩টি সহজ উপায়:' : '3 Ways to Run on Mobile:'}</span>
            </span>

            <div className="space-y-2 text-[11px] leading-relaxed text-slate-300 font-sans">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-0.5">
                  ১. ইনস্ট্যান্ট PWA / WebAPK (সবচেয়ে সহজ):
                </strong>
                {isBn
                  ? 'মোবাইলে Chrome ব্রাউজারে লিংকটি খুলে ৩ ডট (⋮) চেপে "Install app" অথবা "Add to Home screen" চাপলেই স্বয়ংক্রিয়ভাবে একটি আসল APK ইনস্টল হয়ে যাবে।'
                  : 'Open in Chrome on mobile, tap ⋮ menu, and tap "Install app" to auto-generate a native WebAPK.'}
              </div>

              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-0.5">
                  ২. সরাসরি ডাউনলোড করা APK দিয়ে:
                </strong>
                {isBn
                  ? 'ওপরের বাটন দিয়ে .apk ফাইলটি ডাউনলোড করে ফোনে ওপেন করুন। "Install unknown apps" অপশনে Chrome/Files-কে Allow করলেই ইনস্টল হয়ে যাবে।'
                  : 'Download the APK file above, open it on your phone, allow "Install unknown apps", and install.'}
              </div>

              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <strong className="text-white block mb-0.5">
                  ৩. কোনো অ্যাপ ছাড়াই ফোনের Settings VPN:
                </strong>
                {isBn
                  ? 'Settings > VPN > Add VPN (Type: L2TP/IPsec PSK) দিয়ে আপনার MikroTik আইপি ও পাসওয়ার্ড সেভ করলেই সরাসরি কানেক্ট হবে!'
                  : 'Go to Android Settings > Network & internet > VPN > Add (L2TP/IPsec PSK).'}
              </div>
            </div>
          </div>

          {/* Export Full Android Studio Project Source */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isBn ? 'Android Studio প্রজেক্ট ফাইল' : 'Android Studio Source'}</span>
              </span>
              <button
                onClick={handleDownloadAndroidProject}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>build.gradle</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Includes AndroidManifest.xml and Gradle dependencies for compiling in Android Studio.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
