export type StoredArtifact = {
  key: string;
  filePath?: string; // local filesystem only
  sizeBytes: number;
};

export interface ArtifactStorageService {
  writeText(key: string, content: string): Promise<StoredArtifact>;
  writeBuffer(key: string, content: Buffer): Promise<StoredArtifact>;
  exists(key: string): Promise<boolean>;
  getLocalPath(key: string): Promise<string | undefined>;
}