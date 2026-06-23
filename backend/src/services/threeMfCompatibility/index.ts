// services/threeMfCompatibility/index.ts

import { ExportJobRecord } from '../../types/export';
import { applyBambuCompatibility } from './bambuCompatibility.service';
import { applyCrealityCompatibility } from './crealityCompatibility.service';

export type CompatibleThreeMfArtifact = {
  filename: string;
  filePath: string;
  mimeType: 'model/3mf';
  sizeBytes: number;
};

export type ThreeMfCompatibilityService = (
  job: ExportJobRecord
) => Promise<CompatibleThreeMfArtifact>;

export const applyThreeMfCompatibility = async (
  job: ExportJobRecord
): Promise<CompatibleThreeMfArtifact> => {
  console.log("checking compatiblity: ", job.request.output.targetProfile);

  switch (job.request.output.targetProfile) {
    case 'bambu':
      return applyBambuCompatibility(job);

    case 'creality':
      return applyCrealityCompatibility(job);

    default:
      throw new Error(`Unsupported target profile.`);
  }
};

export {
  applyBambuCompatibility,
  applyCrealityCompatibility
};