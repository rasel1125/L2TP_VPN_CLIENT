import { ServerProfile } from '../types/vpn';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
}

export interface DriveAbout {
  userName: string;
  userEmail: string;
  userPhoto?: string;
  usageBytes: number;
  limitBytes: number;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export async function fetchDriveAbout(accessToken: string): Promise<DriveAbout> {
  const res = await fetch(`${DRIVE_API_BASE}/about?fields=user(displayName,emailAddress,photoLink),storageQuota(limit,usage)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to load Google Drive storage quota');
  }

  const data = await res.json();
  return {
    userName: data.user?.displayName || 'Google User',
    userEmail: data.user?.emailAddress || '',
    userPhoto: data.user?.photoLink,
    usageBytes: Number(data.storageQuota?.usage) || 0,
    limitBytes: Number(data.storageQuota?.limit) || (15 * 1024 * 1024 * 1024),
  };
}

export async function listDriveFiles(
  accessToken: string,
  query?: string,
  pageSize = 25
): Promise<DriveFile[]> {
  let q = "trashed = false";
  if (query && query.trim()) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const url = `${DRIVE_API_BASE}/files?pageSize=${pageSize}&fields=files(id,name,mimeType,size,modifiedTime,iconLink,thumbnailLink,webViewLink)&orderBy=modifiedTime desc&q=${encodeURIComponent(
    q
  )}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Google Drive files');
  }

  const data = await res.json();
  return data.files || [];
}

export async function backupProfilesToDrive(
  accessToken: string,
  profiles: ServerProfile[]
): Promise<DriveFile> {
  const fileName = `L2TP-VPN-Profiles-Backup-${new Date().toISOString().split('T')[0]}.json`;
  const content = JSON.stringify({
    app: 'L2TP Connect Pro',
    exportedAt: new Date().toISOString(),
    version: '3.4.2-pro',
    profiles,
  }, null, 2);

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'HomeVault L2TP Connect Pro VPN Profiles Backup',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to backup to Google Drive: ${err}`);
  }

  return await res.json();
}

export async function uploadCustomFileToDrive(
  accessToken: string,
  file: File
): Promise<DriveFile> {
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const fileBuffer = await file.arrayBuffer();

  const preBuffer = new TextEncoder().encode(metadataPart);
  const postBuffer = new TextEncoder().encode(closeDelimiter);

  const combined = new Uint8Array(preBuffer.byteLength + fileBuffer.byteLength + postBuffer.byteLength);
  combined.set(preBuffer, 0);
  combined.set(new Uint8Array(fileBuffer), preBuffer.byteLength);
  combined.set(postBuffer, preBuffer.byteLength + fileBuffer.byteLength);

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: combined,
  });

  if (!res.ok) {
    throw new Error('Failed to upload file to Google Drive');
  }

  return await res.json();
}

export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete file from Google Drive');
  }
}

export async function fetchFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to download file content from Google Drive');
  }

  return await res.text();
}
