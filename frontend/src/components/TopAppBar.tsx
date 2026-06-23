export type AppBarAction = {
  key: string;
  display: string;
  active: boolean;
  disabled?: boolean;
};

type TopAppBarProps = {
  title?: string;

  actions: AppBarAction[];
  onToggle: (key: string) => void;

  onNotifications?: () => void;
  onProfile?: () => void;

  onDownload?: () => void;
  onDownloadMenu?: () => void;
};

export default function TopAppBar({
  title = "OpenSCAD Playground",
  actions,
  onToggle,
  onNotifications,
  onProfile,
  onDownload,
  onDownloadMenu,
}: TopAppBarProps) {
  return (
    <header className="
      h-16 shrink-0 
      border-b
      border-neutral-800
      bg-neutral-950/95
      backdrop-blur
    ">
      <div className="
        grid
        h-full
        grid-cols-[1fr_auto_1fr]
        items-center
        px-6
      ">

        {/* Left */}

<div className="flex items-center gap-3">

  <div
    className="
      flex
      h-9
      w-9
      items-center
      justify-center
      rounded-xl
      bg-gradient-to-br
      from-blue-500
      to-cyan-400
      font-bold
      text-white
      shadow-lg
    "
  >
    ◈
  </div>

  <div className="flex flex-col">

    <div className="text-sm font-semibold leading-tight text-white">
      {title}
    </div>

    <div className="text-[11px] leading-tight text-neutral-400">
        v0.1.0 • SCAD → WASM → 3MF → Three.js
    </div>

  </div>

</div>

        {/* Center */}

        <nav className="
          flex
          rounded-xl
          bg-neutral-900
          p-1
          shadow-lg
        ">
          <div className="flex-row gap-4">
          {actions.map((action, i) => (
            <button
              key={action.key}
              disabled={action.disabled}
              onClick={() => onToggle(action.key)}
              className={[
                "rounded-lg px-4 py-2 text-sm transition",

                i != 0
                  ? "ml-5"
                  : "",

                action.active
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white",

                action.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              ].join(" ")}
            >
              {action.display}
            </button>
          ))}
          </div>
        </nav>

        {/* Right */}

        <div className="
          flex
          items-center
          justify-end
          gap-3
        ">

          <button
            onClick={onNotifications}
            className="
              rounded-full
              p-2
              text-neutral-300
              hover:bg-white/10
              hover:text-white
            "
          >
            <i className="fa-regular fa-bell" />
          </button>

          <button
            onClick={onProfile}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-neutral-700
              font-semibold
              text-white
            "
          >
            S
          </button>

          <div className="flex overflow-hidden rounded-lg">

            <button
              onClick={onDownload}
              className="
                bg-blue-500
                px-4
                py-2
                font-semibold
                text-white
                hover:bg-blue-400
              "
            >
              Download
            </button>

            <button
              onClick={onDownloadMenu}
              className="
                border-l
                border-blue-400
                bg-blue-500
                px-3
                text-white
                hover:bg-blue-400
              "
            >
              <i className="fa-solid fa-chevron-down" />
            </button>

          </div>
        </div>

      </div>
    </header>
  );
}