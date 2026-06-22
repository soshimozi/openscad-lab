import type { RenderTarget } from "../types/render";

export function buildRenderableScad(scad: string, target: RenderTarget): string {
  const call =
    target.kind === "assembly"
      ? "osl_assembly_view();"
      : `osl_plate_${target.plate}();`;

  const separator = scad.length > 0 && !scad.endsWith("\n") ? "\n" : "";
  return `${scad}${separator}${call}\n`;
}
