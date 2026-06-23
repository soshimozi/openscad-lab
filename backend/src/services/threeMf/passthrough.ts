import fs from 'fs/promises';

import { ExportJobRecord } from '../../types/export';

import {
  CompatibleThreeMfArtifact
} from '../threeMfCompatibility';

export async function passthrough(
  job: ExportJobRecord
): Promise<CompatibleThreeMfArtifact> {

  if (!job.inputFilePath) {
    throw new Error("Missing input file.");
  }

  const stats = await fs.stat(job.inputFilePath);

  return {
    filename: `${job.jobId}.3mf`,
    filePath: job.inputFilePath,
    mimeType: 'model/3mf',
    sizeBytes: stats.size
  };
}