// services/threeMfExport.service.ts

import { ExportJobRecord } from '../types/export';
import {
  applyThreeMfCompatibility,
  CompatibleThreeMfArtifact
} from './threeMfCompatibility';

export type ExportArtifact = CompatibleThreeMfArtifact;

export type ExportProgressEvent =
  | { type: 'progress'; progress: number; message?: string }
  | { type: 'completed'; artifact: ExportArtifact };

export async function* processThreeMfExport(
  job: ExportJobRecord
): AsyncGenerator<ExportProgressEvent> {
  if (!job.inputFilePath) {
    throw new Error('Input file path was not set on export job.');
  }

  yield { type: 'progress', progress: 10, message: 'Reading uploaded 3MF' };

  yield { type: 'progress', progress: 35, message: 'Inspecting 3MF package' };

  yield {
    type: 'progress',
    progress: 65,
    message: `Applying ${job.request.output.targetProfile} compatibility`
  };

  const artifact = await applyThreeMfCompatibility(job);

  yield { type: 'progress', progress: 90, message: 'Writing compatible 3MF' };

  yield { type: 'completed', artifact };
}