import React, { useState, useEffect } from 'react';
import {
  Folder,
  File,
  Upload,
  Cloud,
  CheckCircle2,
  Trash2,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  getAccessToken,
} from '../services/googleDriveAuth';
import {
  listDriveFiles,
  backupProfilesToDrive,
  uploadCustomFileToDrive,
  deleteDriveFile,
  fetchDriveAbout,
  DriveFile,
  DriveAbout,
} from '../services/googleDriveService';
import { ServerProfile } from '../types/vpn';
import { Language } from '../i18n/vpnTranslations';

interface GoogleDriveTabProps {
  profiles: ServerProfile[];
  onRestoreProfiles: (importedProfiles: ServerProfile[]) => void;
  language: Language;
}

export const GoogleDriveTab: React.FC<GoogleDriveTabProps> = ({
  profiles,
  onRestoreProfiles,
  language,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [driveAbout, setDriveAbout] = useState<DriveAbout | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [search, setSearch] = useState<string>('');
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Destructive delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);

  const isBn = language === 'bn';

  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser, accessToken) => {
        setUser(authenticatedUser);
        setToken(accessToken);
        setAuthChecking(false);
        loadDriveData(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setAuthChecking(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadDriveData = async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const [about, files] = await Promise.all([
        fetchDriveAbout(accessToken).catch(() => null),
        listDriveFiles(accessToken),
      ]);
      if (about) setDriveAbout(about);
      setDriveFiles(files);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await loadDriveData(result.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setDriveAbout(null);
  };

  const handleBackup = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const backupFile = await backupProfilesToDrive(token, profiles);
      setBackupSuccess(backupFile.name);
      await loadDriveData(token);
      setTimeout(() => setBackupSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Backup to Google Drive failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      setLoading(true);
      await uploadCustomFileToDrive(token, file);
      await loadDriveData(token);
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete || !token) return;
    try {
      setLoading(true);
      await deleteDriveFile(token, fileToDelete.id);
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const formatGb = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1);
  };

  const filteredFiles = driveFiles.filter((f) =>
    search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>{isBn ? 'গুগল ড্রাইভ ক্লাউড ব্যাকআপ' : 'Google Drive Cloud'}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            Sync &amp; Backup VPN Profiles &amp; Files
          </p>
        </div>

        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isBn ? 'লগআউট' : 'Sign Out'}</span>
          </button>
        )}
      </div>

      {/* Auth State */}
      {!user ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center text-center space-y-4 my-auto">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {isBn ? 'গুগল ড্রাইভের সাথে যুক্ত করুন' : 'Connect Your Google Drive'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {isBn
                ? 'আপনার MikroTik L2TP ভিপিএন প্রোফাইল গুগল ড্রাইভে ক্লাউড ব্যাকআপ রাখুন এবং যেকোনো মোবাইল থেকে অ্যাক্সেস করুন।'
                : 'Backup your MikroTik VPN configs and sync files across all your mobile devices with Google Drive.'}
            </p>
          </div>

          {/* Official Google Material Sign-In Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-2xl shadow-md transition-all active:scale-95 text-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isBn ? 'গুগল দিয়ে সাইন-ইন করুন' : 'Sign in with Google'}</span>
          </button>
        </div>
      ) : (
        <>
          {/* User & Storage Status Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">
                  {user.displayName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  {user.email}
                </span>
              </div>
            </div>

            {driveAbout && (
              <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
                <span className="text-emerald-400 font-bold">{formatGb(driveAbout.usageBytes)} GB</span>
                <span> / {formatGb(driveAbout.limitBytes)} GB</span>
              </div>
            )}
          </div>

          {/* Quick Actions (Backup & Upload) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleBackup}
              disabled={loading}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
            >
              <Cloud className="w-4 h-4" />
              <span>{isBn ? 'ড্রাইভে ভিপিএন ব্যাকআপ' : 'Backup VPN to Drive'}</span>
            </button>

            <label className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 font-semibold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ফাইল আপলোড' : 'Upload File'}</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {backupSuccess && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isBn
                  ? `সফলভাবে গুগল ড্রাইভে ব্যাকআপ সেভ হয়েছে: ${backupSuccess}`
                  : `Successfully backed up to Google Drive: ${backupSuccess}`}
              </span>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBn ? 'ড্রাইভের ফাইল খুঁজুন...' : 'Search Google Drive files...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {/* Google Drive Files List */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{isBn ? 'গুগল ড্রাইভ ফাইলসমূহ' : 'Recent Google Drive Files'}</span>
              <span>{filteredFiles.length} files</span>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                {loading ? 'Loading Drive files...' : 'No files found in Google Drive'}
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {file.mimeType.includes('folder') ? (
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-white truncate font-medium">{file.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setFileToDelete(file)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="Delete from Google Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Delete */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{isBn ? 'গুগল ড্রাইভ থেকে ফাইল মুছবেন?' : 'Delete File from Google Drive?'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn
                ? `আপনি কি নিশ্চিত যে "${fileToDelete.name}" ফাইলটি আপনার গুগল ড্রাইভ থেকে মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।`
                : `Are you sure you want to permanently delete "${fileToDelete.name}" from your Google Drive? This cannot be undone.`}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={confirmDeleteFile}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-xs"
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
