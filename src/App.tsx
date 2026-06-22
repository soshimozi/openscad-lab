import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorPane } from "./components/EditorPane";
import { type ToolbarPanel } from "./components/TopToolbar";
import CustomizePane from "./components/CustomizePane";
import ViewerPane from "./components/ViewerPane";
import { ResizablePane } from "./components/ResizablePane";
import { useOpenScadRenderer } from "./hooks/useOpenScadRenderer";
import type { RenderTarget } from "./types/render";
import { scanScadModules } from "./services/scadModuleScanner";
import { buildRenderableScad } from "./services/buildRenderableScad";
import ViewSelector from "./components/ViewSelector";
import TopAppBar from "./components/TopAppBar";

type GenerateButtonProps = {
  onGenerate: () => void;
  isRendering?: boolean;
};

function GenerateButton({ onGenerate, isRendering = false }: GenerateButtonProps) {
  return (
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
  );
}

type RenderCache = {
  assembly?: ArrayBuffer;
  plates: Record<number, ArrayBuffer>;
};

function App() {
  const defaultScad = "module osl_assembly_view() { cube(20); }";

  const [scad, setScad] = useState(defaultScad);
  const [isDirty, setIsDirty] = useState(false);

  function handleScadChange(value: string) {
    setScad(value);
    setIsDirty(true);
  }

  const renderer = useOpenScadRenderer();

  const [renderTarget, setRenderTarget] = useState<RenderTarget>({
    kind: "assembly",
  });

  const scan = useMemo(() => scanScadModules(scad), [scad]);
  const plateKey = scan.plates.join(",");

  const [renderCache, setRenderCache] = useState<RenderCache>({
    plates: {},
  });

  const activeModel = useMemo(() => {
    if (renderTarget.kind === "assembly") {
      return renderCache.assembly;
    }

    return renderCache.plates[renderTarget.plate];
  }, [renderCache, renderTarget]);

  
  // useEffect(() => {
  //   setRenderCache({ plates: {} });
  // }, [scad, plateKey, scan.hasAssemblyView]);

  useEffect(() => {
    if (renderTarget.kind === "assembly") {
      if (scan.hasAssemblyView) return;

      if (scan.plates.length > 0) {
        setRenderTarget({ kind: "plate", plate: scan.plates[0] });
      }

      return;
    }

    if (renderTarget.kind === "plate") {
      if (scan.plates.includes(renderTarget.plate)) return;

      if (scan.plates.length > 0) {
        setRenderTarget({ kind: "plate", plate: scan.plates[0] });
        return;
      }

      if (scan.hasAssemblyView) {
        setRenderTarget({ kind: "assembly" });
      }
    }
  }, [scan.hasAssemblyView, plateKey, renderTarget, scan.plates]);

  const handleGenerate = useCallback(async () => {
    console.log("[App] Generate clicked");

    const nextCache: RenderCache = {
      plates: {},
    };

    if (scan.hasAssemblyView) {
      const target: RenderTarget = { kind: "assembly" };
      const scadText = buildRenderableScad(scad, target);

      console.log("[App] Rendering assembly view");
      const result = await renderer.render(scadText);

      if (result.ok && result.model) {
        nextCache.assembly = result.model;
      } else {
        console.error("[App] Assembly render failed:", result.error);
      }
    }

    for (const plate of scan.plates) {
      const target: RenderTarget = { kind: "plate", plate };
      const scadText = buildRenderableScad(scad, target);

      console.log("[App] Rendering plate:", plate);
      const result = await renderer.render(scadText);

      if (result.ok && result.model) {
        nextCache.plates[plate] = result.model;
      } else {
        console.error(`[App] Plate ${plate} render failed:`, result.error);
      }
    }

    setRenderCache(nextCache);
    setIsDirty(false);
  }, [scad, scan.hasAssemblyView, plateKey, scan.plates, renderer]);

  const [panels, setPanels] = useState<ToolbarPanel[]>([
    { display: "Code", active: true, key: "code" },
    { display: "View", active: true, key: "view" },
    { display: "Customize", active: false, key: "customize" },
  ]);

  const activePanels = useMemo(
    () => Object.fromEntries(panels.map((p) => [p.key, p.active])),
    [panels]
  );

  const visiblePanelCount = panels.filter((p) => p.active).length;
  const fillSinglePanel = visiblePanelCount === 1;

  function togglePanel(key: string) {
    setPanels((prev) =>
      prev.map((p) => (p.key === key ? { ...p, active: !p.active } : p))
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-950">
      <TopAppBar
        title="OpenSCAD Playground"
        actions={panels}
        onToggle={togglePanel}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {activePanels.code &&
          (fillSinglePanel ? (
            <EditorPane value={scad} onChange={handleScadChange} fill />
          ) : (
            <ResizablePane initialWidth={500}>
              <EditorPane value={scad} onChange={handleScadChange} />
            </ResizablePane>
          ))}

        {activePanels.customize &&
          (fillSinglePanel ? (
            <div className="flex min-w-0 flex-1 flex-col">
              <CustomizePane fill />

              <div className="flex h-16 shrink-0 items-center justify-end border-t border-neutral-800 bg-neutral-900 px-4">
                <GenerateButton
                  onGenerate={handleGenerate}
                  isRendering={renderer.isRendering}
                />
              </div>
            </div>
          ) : (
            <ResizablePane initialWidth={400}>
              <div className="flex h-full flex-col">
                <CustomizePane />

                <div className="flex flex-row h-16 shrink-0 items-center justify-end border-t border-neutral-800 bg-neutral-900 px-4">
                  <GenerateButton
                    onGenerate={handleGenerate}
                    isRendering={renderer.isRendering}
                  />
                  {isDirty && (
                    <span className="ml-3 text-xs text-amber-400">
                      Changes not generated
                    </span>
                  )}                  
                </div>
              </div>
            </ResizablePane>
          ))}

        {activePanels.view && (
          <ViewerPane model={activeModel}>
            <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex">
              <ViewSelector
                hasAssemblyView={scan.hasAssemblyView}
                plates={scan.plates}
                target={renderTarget}
                onChange={setRenderTarget}
              />
            </div>
          </ViewerPane>
        )}
      </div>
    </div>
  );
}

export default App;