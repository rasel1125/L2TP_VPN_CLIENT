export type FileCategory = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other';

export interface StoredItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  category: FileCategory;
  size: number; // in bytes
  mimeType: string;
  parentId: string | null; // null represents root
  tags: string[];
  starred: boolean;
  inTrash: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
  blob?: Blob;
  blobKey?: string;
  blobUrl?: string;
  textContent?: string;
  isSample?: boolean;
  shared?: boolean;
  shareToken?: string;
  sharePassword?: string;
  shareExpiresAt?: string;
  downloadCount?: number;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ActiveSection = 'all' | 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'starred' | 'trash' | 'server';

export interface LocalDevice {
  id: string;
  name: string;
  ip: string;
  type: 'desktop' | 'mobile' | 'laptop' | 'tv';
  status: 'online' | 'transferring' | 'idle';
  lastSeen: string;
}

export interface ServerStats {
  serverName: string;
  lanIp: string;
  subnetMask: string;
  gateway: string;
  port: number;
  uptimeHours: number;
  totalCapacityGb: number;
  poolType: string;
  readSpeedMbps: number;
  writeSpeedMbps: number;
  temperatureCelsius: number;
  drives: {
    bay: number;
    model: string;
    capacity: string;
    health: 'healthy' | 'warning' | 'degraded';
    temp: number;
  }[];
}
