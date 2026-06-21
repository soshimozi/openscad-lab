import { ScadEditor } from "./ScadEditor";

type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isRendering?: boolean;
  fill?: boolean;
};

export function EditorPane({ value, onChange, onGenerate, fill = false, isRendering = false }: EditorPaneProps) {
  return (
    <aside
      className={[
        "flex h-full flex-col border-r border-neutral-800 bg-neutral-900",
        fill ? "min-w-0 flex-1" : "h-full w-full",
      ].join(" ")}
    >
      <div className="flex h-12 items-center border-b border-neutral-800 px-4 font-semibold text-white">
        Code
      </div>

      <div className="min-h-0 flex-1">
        <ScadEditor value={value} onChange={onChange} />
      </div>
      <div className="flex h-16 items-center justify-end border-t border-neutral-800 px-4">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isRendering}
          className={[
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition",
            isRendering
              ? "cursor-not-allowed bg-neutral-600"
              : "bg-blue-500 hover:bg-blue-400",
          ].join(" ")}
        >
          <i className="fa-solid fa-bolt" />
          {isRendering ? "Generating..." : "Generate"}
        </button>
      </div>
    </aside>
  );
}