import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import AdmZip from 'adm-zip';
import { ThreeMfPackage } from './types';

const tempRoot = path.join(process.cwd(), 'tmp', 'three-mf');

export async function readThreeMf(
  filePath: string
): Promise<ThreeMfPackage> {
  const packageId = randomUUID();
  const rootDir = path.join(tempRoot, packageId);

  await fs.mkdir(rootDir, { recursive: true });

  const zip = new AdmZip(filePath);
  zip.extractAllTo(rootDir, true);

  const allFiles = await listFiles(rootDir);

  const modelPath = findRequiredFile(
    rootDir,
    allFiles,
    '3D/3dmodel.model'
  );

  const contentTypesPath = findRequiredFile(
    rootDir,
    allFiles,
    '[Content_Types].xml'
  );

  const relationshipsPath = findRequiredFile(
    rootDir,
    allFiles,
    '_rels/.rels'
  );

  const metadataFiles = allFiles
    .filter((file) => file.startsWith('Metadata/'))
    .map((file) => path.join(rootDir, file));

  return {
    sourceFilePath: filePath,
    rootDir,
    modelPath,
    contentTypesPath,
    relationshipsPath,
    metadataFiles,
    allFiles
  };
}

async function listFiles(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, {
      withFileTypes: true
    });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      const relativePath = path
        .relative(rootDir, fullPath)
        .replaceAll(path.sep, '/');

      results.push(relativePath);
    }
  }

  await walk(rootDir);

  return results.sort();
}

function findRequiredFile(
  rootDir: string,
  allFiles: string[],
  relativePath: string
): string {
  if (!allFiles.includes(relativePath)) {
    throw new Error(`Invalid 3MF package. Missing ${relativePath}.`);
  }

  return path.join(rootDir, relativePath);
}