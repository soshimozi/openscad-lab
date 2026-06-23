import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { ArtifactStorageService } from './index';

const rootDir = path.join(process.cwd(), 'exports');

export const localArtifactStorage: ArtifactStorageService = {
  async writeText(key, content) {
    const filePath = path.join(rootDir, key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');

    const stats = await fs.stat(filePath);

    return {
      key,
      filePath,
      sizeBytes: stats.size
    };
  },

  async writeBuffer(key, content) {
    const filePath = path.join(rootDir, key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);

    const stats = await fs.stat(filePath);

    return {
      key,
      filePath,
      sizeBytes: stats.size
    };
  },

  async exists(key) {
    return existsSync(path.join(rootDir, key));
  },

  async getLocalPath(key) {
    return path.join(rootDir, key);
  }
};