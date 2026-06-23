import { passthrough, readThreeMf } from '../threeMf';
import {
  CompatibleThreeMfArtifact,
  ThreeMfCompatibilityService
} from './index';

export const applyCrealityCompatibility:
  ThreeMfCompatibilityService = async (job) => {

    if(!job.inputFilePath) throw new Error("No input file specified.");
    
    const pkg = await readThreeMf(job.inputFilePath);
    
    console.log('[Creality compatibility] 3MF contents:', pkg.allFiles);

    return passthrough(job);
};