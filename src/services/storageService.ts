import { StoredItem, FileCategory, ServerStats, LocalDevice } from '../types';

const DB_NAME = 'HomeVaultStorageDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'items';
const STORE_BLOBS = 'blobs';

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS);
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function detectCategory(fileName: string, mimeType: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'].includes(ext) || mimeType.startsWith('image/')) {
    return 'image';
  }
  if (['mp4', 'mkv', 'webm', 'mov', 'avi', 'flv'].includes(ext) || mimeType.startsWith('video/')) {
    return 'video';
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext) || mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'md'].includes(ext) || mimeType.includes('pdf') || mimeType.includes('text') || mimeType.includes('document')) {
    return 'document';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'archive';
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json', 'yaml', 'yml', 'sh', 'sql', 'cpp', 'c', 'java', 'go', 'rs'].includes(ext)) {
    return 'code';
  }
  return 'other';
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return `${d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return isoString;
  }
}

// Initial Starter Dataset for HomeVault Server
const INITIAL_SEED_ITEMS: StoredItem[] = [
  {
    id: 'folder-docs',
    name: 'Personal Documents',
    type: 'folder',
    category: 'document',
    size: 0,
    mimeType: 'inode/directory',
    parentId: null,
    tags: ['personal', 'important'],
    starred: true,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'folder-media',
    name: 'Photos & Family Media',
    type: 'folder',
    category: 'image',
    size: 0,
    mimeType: 'inode/directory',
    parentId: null,
    tags: ['photos', 'family', 'archive'],
    starred: true,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'folder-backups',
    name: 'System & Phone Backups',
    type: 'folder',
    category: 'archive',
    size: 0,
    mimeType: 'inode/directory',
    parentId: null,
    tags: ['backup', 'automated'],
    starred: false,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'folder-code',
    name: 'Development Projects',
    type: 'folder',
    category: 'code',
    size: 0,
    mimeType: 'inode/directory',
    parentId: null,
    tags: ['code', 'work'],
    starred: false,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'doc-home-inventory',
    name: 'Home_Network_Devices_Inventory.md',
    type: 'file',
    category: 'document',
    size: 4280,
    mimeType: 'text/markdown',
    parentId: 'folder-docs',
    tags: ['home', 'network', 'inventory'],
    starred: true,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    textContent: `# Home Local Network & Server Devices Inventory

### Personal Storage Server (HomeVault NAS)
- **Local IP:** 192.168.1.120
- **MAC Address:** 7C:D3:0A:44:B9:E1
- **File Protocols:** SMB 3.0 / NFS / WebDAV / HTTP Local Drop
- **Storage Drive 1:** 4TB Seagate IronWolf NAS (SATA 6Gb/s, 7200 RPM)
- **Storage Drive 2:** 4TB WD Red Plus NAS (SATA 6Gb/s, 5400 RPM)
- **ZFS Configuration:** Mirror Pool (4TB Total Usable Redundant)
- **NVMe Cache:** 512GB Samsung 980 Pro (Read/Write L2ARC)

### Connected Client Devices:
1. **Primary Workstation:** 192.168.1.101 (Ethernet 2.5G)
2. **Personal Laptop:** 192.168.1.104 (Wi-Fi 6 5GHz)
3. **Android Smartphone (Rasal):** 192.168.1.112 (Wi-Fi 6)
4. **Living Room Smart TV:** 192.168.1.118 (DLNA Media Stream)

### Local Sharing Rules:
- Direct LAN access is isolated to 192.168.1.0/24 subnet.
- Zero external cloud reliance: all documents, media, and backups remain on local storage.
`,
  },
  {
    id: 'doc-nas-setup-notes',
    name: 'Local_Storage_Configuration_Guide.txt',
    type: 'file',
    category: 'document',
    size: 2150,
    mimeType: 'text/plain',
    parentId: 'folder-docs',
    tags: ['config', 'lan'],
    starred: false,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    textContent: `HomeVault Local Server Configuration Notes:
----------------------------------------------
* Server Port: 3000
* Storage Pool Directory: /mnt/storage_pool/homevault
* Daily Sync Schedule: 03:00 AM local time
* Auto-quarantine: Enabled for unknown archive extensions
* Speed: Gigabit Full-Duplex (1000 Mbps)
* Wi-Fi Drop: Instant peer-to-peer file transfer enabled on local subnet.
`,
  },
  {
    id: 'code-backup-script',
    name: 'local_rsync_backup.sh',
    type: 'file',
    category: 'code',
    size: 1680,
    mimeType: 'application/x-sh',
    parentId: 'folder-code',
    tags: ['bash', 'automation', 'backup'],
    starred: false,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    textContent: `#!/usr/bin/env bash
# Automated Local Storage Backup Script for HomeVault
set -euo pipefail

SOURCE_DIR="$HOME/Documents"
DEST_SERVER="user@192.168.1.120:/mnt/storage_pool/backups/workstation"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting incremental local backup..."
rsync -avz --progress --delete "$SOURCE_DIR/" "$DEST_SERVER/"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup synchronization finished cleanly."
`,
  },
  {
    id: 'archive-phone-backup',
    name: 'Android_Photos_Backup_2026.zip',
    type: 'file',
    category: 'archive',
    size: 348576000, // ~348 MB
    mimeType: 'application/zip',
    parentId: 'folder-backups',
    tags: ['mobile', 'archive', 'backup'],
    starred: true,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'audio-voice-memo',
    name: 'Voice_Note_Server_Ideas.mp3',
    type: 'file',
    category: 'audio',
    size: 2450000, // ~2.45 MB
    mimeType: 'audio/mpeg',
    parentId: null,
    tags: ['audio', 'memo'],
    starred: false,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'image-server-chassis',
    name: 'HomeVault_Server_Enclosure.jpg',
    type: 'file',
    category: 'image',
    size: 2840000,
    mimeType: 'image/jpeg',
    parentId: 'folder-media',
    tags: ['hardware', 'nas', 'server'],
    starred: true,
    inTrash: false,
    trashedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    blobUrl: '/src/assets/images/home_nas_server_chassis_1793161665061.jpg',
  },
];

export async function initStorage(): Promise<StoredItem[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_ITEMS, 'readonly');
  const store = tx.objectStore(STORE_ITEMS);
  const getAllReq = store.getAll();

  return new Promise((resolve) => {
    getAllReq.onsuccess = async () => {
      let items: StoredItem[] = getAllReq.result || [];
      if (items.length === 0) {
        // Seed initial items
        const writeTx = db.transaction(STORE_ITEMS, 'readwrite');
        const writeStore = writeTx.objectStore(STORE_ITEMS);
        for (const item of INITIAL_SEED_ITEMS) {
          writeStore.put(item);
        }
        writeTx.oncomplete = () => {
          resolve(INITIAL_SEED_ITEMS);
        };
      } else {
        resolve(items);
      }
    };
    getAllReq.onerror = () => {
      resolve(INITIAL_SEED_ITEMS);
    };
  });
}

export async function saveItem(item: StoredItem, blob?: Blob): Promise<StoredItem> {
  const db = await getDB();
  const tx = db.transaction([STORE_ITEMS, STORE_BLOBS], 'readwrite');
  const itemStore = tx.objectStore(STORE_ITEMS);
  const blobStore = tx.objectStore(STORE_BLOBS);

  if (blob) {
    blobStore.put(blob, item.id);
    item.blobKey = item.id;
  }

  itemStore.put(item);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFileBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  const tx = db.transaction(STORE_BLOBS, 'readonly');
  const store = tx.objectStore(STORE_BLOBS);
  const req = store.get(id);

  return new Promise((resolve) => {
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function deleteItemPermanent(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE_ITEMS, STORE_BLOBS], 'readwrite');
  tx.objectStore(STORE_ITEMS).delete(id);
  tx.objectStore(STORE_BLOBS).delete(id);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function emptyTrashStorage(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE_ITEMS, STORE_BLOBS], 'readwrite');
  const itemStore = tx.objectStore(STORE_ITEMS);
  const blobStore = tx.objectStore(STORE_BLOBS);
  const req = itemStore.getAll();

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      const items: StoredItem[] = req.result || [];
      for (const item of items) {
        if (item.inTrash) {
          itemStore.delete(item.id);
          blobStore.delete(item.id);
        }
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const INITIAL_SERVER_STATS: ServerStats = {
  serverName: 'HomeVault-NAS-01',
  lanIp: '192.168.1.120',
  subnetMask: '255.255.255.0',
  gateway: '192.168.1.1',
  port: 3000,
  uptimeHours: 342,
  totalCapacityGb: 4000, // 4 TB mirror pool
  poolType: 'ZFS Mirror (RAID-1 Redundancy)',
  readSpeedMbps: 114, // Gigabit line speed
  writeSpeedMbps: 98,
  temperatureCelsius: 36,
  drives: [
    { bay: 1, model: 'Seagate IronWolf 4TB (ST4000VN006)', capacity: '4.0 TB', health: 'healthy', temp: 34 },
    { bay: 2, model: 'WD Red Plus 4TB (WD40EFZX)', capacity: '4.0 TB', health: 'healthy', temp: 36 },
    { bay: 3, model: 'Samsung 980 Pro NVMe Cache', capacity: '512 GB', health: 'healthy', temp: 41 },
    { bay: 4, model: 'Spare Hot-Swap Bay (Empty)', capacity: 'Unassigned', health: 'healthy', temp: 28 },
  ],
};

export const INITIAL_LOCAL_DEVICES: LocalDevice[] = [
  { id: 'dev-1', name: 'Workstation PC (Windows)', ip: '192.168.1.101', type: 'desktop', status: 'online', lastSeen: 'Active now' },
  { id: 'dev-2', name: 'Rasal iPhone / Android Mobile', ip: '192.168.1.112', type: 'mobile', status: 'online', lastSeen: 'Active now' },
  { id: 'dev-3', name: 'MacBook Air M2', ip: '192.168.1.104', type: 'laptop', status: 'idle', lastSeen: '12 min ago' },
  { id: 'dev-4', name: 'Living Room Android TV', ip: '192.168.1.118', type: 'tv', status: 'online', lastSeen: 'Streaming DLNA' },
];
