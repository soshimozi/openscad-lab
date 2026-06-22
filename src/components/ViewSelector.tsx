import type { RenderTarget } from "../types/render";

type ViewSelectorProps = {
  hasAssemblyView: boolean;
  plates: number[];
  target: RenderTarget;
  onChange: (target: RenderTarget) => void;
};

export default function ViewSelector({
  hasAssemblyView,
  plates,
  target,
  onChange,
}: ViewSelectorProps) {
  const hasPlates = plates.length > 0;

  const isAssemblyActive = target.kind === "assembly";
  const isPlateActive = target.kind === "plate";

  const selectedPlateValue =
    target.kind === "plate" ? String(target.plate) : "";

  return (
    <div className="pointer-events-auto mx-auto flex items-center gap-1 rounded-xl bg-neutral-900/90 p-2 shadow-xl backdrop-blur">
      <button
        type="button"
        onClick={() => onChange({ kind: "assembly" })}
        disabled={!hasAssemblyView}
        aria-pressed={isAssemblyActive}
        className={[
          "rounded-lg px-4 py-2 text-sm font-medium transition",
          isAssemblyActive
            ? "bg-blue-500 font-semibold text-white"
            : "text-neutral-300 hover:bg-white/10 hover:text-white",
          !hasAssemblyView
            ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-neutral-300"
            : "",
        ].join(" ")}
      >
        Assembly View
      </button>

      <div className="mx-1 h-5 w-px bg-neutral-700" />

      <div className="relative">
        <select
          value={selectedPlateValue}
          disabled={!hasPlates}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;

            const plate = Number(value);
            if (!Number.isNaN(plate)) {
              onChange({ kind: "plate", plate });
            }
          }}
          aria-label="Plate view"
          className={[
            "appearance-none rounded-lg py-2 pl-4 pr-8 text-sm font-medium transition",
            hasPlates ? "cursor-pointer" : "cursor-not-allowed",
            isPlateActive
              ? "bg-blue-500 font-semibold text-white"
              : "bg-transparent text-neutral-300 hover:bg-white/10 hover:text-white",
            !hasPlates
              ? "opacity-40 hover:bg-transparent hover:text-neutral-300"
              : "",
          ].join(" ")}
        >
          <option value="" className="bg-neutral-900 text-white">
            {hasPlates ? "Plate View" : "No plates"}
          </option>

          {plates.map((plate) => (
            <option
              key={plate}
              value={plate}
              className="bg-neutral-900 text-white"
            >
              Plate {plate}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
          ▾
        </span>
      </div>
    </div>
  );
}