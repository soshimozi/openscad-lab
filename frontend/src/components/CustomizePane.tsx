type CustomizePaneProps = {
  fill?: boolean;
};

export default function CustomizePane({ fill = false }: CustomizePaneProps) {
  return (
    <aside
      className={[
        "flex h-full flex-col border-r border-neutral-800 bg-neutral-900",
       fill ? "min-w-0 flex-1" : "h-full w-full",
      ].join(" ")}
    >
      <div className="flex h-12 items-center border-b border-neutral-800 px-4 font-semibold text-white">
        Customize
      </div>
    </aside>
  );
}