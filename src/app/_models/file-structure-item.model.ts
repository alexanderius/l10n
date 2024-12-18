export interface FileStructureItem {
  itemId: string | null;
  name: string;
  isFolder?: boolean;
  mimeType?: string;
  parentFolderId?: string; // id of folder
  parentName?: string;
  size?: number | null; // bytes
  children?: FileStructureItem[];
  stream?: ReadableStream | null;
  isPlaceholder?: boolean;
}