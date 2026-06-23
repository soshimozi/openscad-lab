import { passthrough } from '../threeMf/passthrough';
import { readThreeMf } from '../threeMf/readThreeMf';
import {
  CompatibleThreeMfArtifact,
  ThreeMfCompatibilityService
} from './index';


export const applyBambuCompatibility: ThreeMfCompatibilityService = async (job) => {
    console.log("in apply compatiblity");

    if(!job.inputFilePath) throw new Error("No input file specified.");
    
    const pkg = await readThreeMf(job.inputFilePath);
    
    console.log('[Bambu compatibility] 3MF contents:', pkg.allFiles);

    return passthrough(job);
}
