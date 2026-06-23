export interface ScadModuleScan {
  hasAssemblyView: boolean;
  plates: number[];
}

const MODULE_REGEX = /\bmodule\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
const PLATE_REGEX = /^osl_plate_(\d+)$/;

export function scanScadModules(scad: string): ScadModuleScan {
  let hasAssemblyView = false;
  const plateSet = new Set<number>();

  MODULE_REGEX.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = MODULE_REGEX.exec(scad)) !== null) {
    const name = m[1];
    if (name === "osl_assembly_view") {
      hasAssemblyView = true;
    } else {
      const plateMatch = PLATE_REGEX.exec(name);
      if (plateMatch) {
        plateSet.add(parseInt(plateMatch[1], 10));
      }
    }
  }

  return {
    hasAssemblyView,
    plates: Array.from(plateSet).sort((a, b) => a - b),
  };
}
