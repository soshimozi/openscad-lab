import { ScadEditor } from "./ScadEditor";

type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
  fill?: boolean;
};

export function EditorPane({ value, onChange, fill = false }: EditorPaneProps) {
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
    </aside>
  );
}