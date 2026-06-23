export type ToolbarPanel = {
  display: string;
  key: string;
  active: boolean;
};

type TopToolbarProps = {
  panels: ToolbarPanel[];
  onToggle?: (key: string) => void;
};

export default function TopToolbar({ panels, onToggle }: TopToolbarProps) {
  return (
    <div className="fixed top-[10px] left-1/2 z-50 flex -translate-x-1/2 gap-[10px] rounded-xl bg-neutral-900/90 p-[10px] shadow-xl backdrop-blur">
      {panels.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onToggle?.(p.key)}
          className={[
            "rounded-lg px-4 py-2 text-sm transition",
            "text-neutral-300 hover:bg-white/10 hover:text-white",
            p.active ? "bg-blue-500 font-semibold text-white" : "",
          ].join(" ")}
        >
          {p.display}
        </button>
      ))}
    </div>
  );
}
