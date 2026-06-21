import { useCallback, useMemo, useState } from "react";
import { EditorPane } from "./components/EditorPane";
import TopToolbar, { type ToolbarPanel } from "./components/TopToolbar";
import CustomizePane from "./components/CustomizePane";
import ViewerPane from "./components/ViewerPane";
import { ResizablePane } from "./components/ResizablePane";
import { useOpenScadRenderer } from "./hooks/useOpenScadRenderer";

function App() {
  const defaultScad = "module mw_assembly_view() { cube(20); }";

  const [scad, setScad] = useState(defaultScad);
  const renderer = useOpenScadRenderer();

async function handleGenerate() {
  console.log("[App] Generate clicked");
  console.log("[App] SCAD:", scad);

  const result = await renderer.render(scad);

  console.log("[App] Render result:", result);
}

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
      prev.map((p) =>
        p.key === key ? { ...p, active: !p.active } : p
      )
    );
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-neutral-950">
      <TopToolbar panels={panels} onToggle={togglePanel} />

{activePanels.code && (
  fillSinglePanel ? (
    <EditorPane value={scad} onChange={setScad} onGenerate={handleGenerate} fill />
  ) : (
    <ResizablePane initialWidth={500}>
      <EditorPane value={scad} onChange={setScad} onGenerate={handleGenerate} />
    </ResizablePane>
  )
)}

{activePanels.customize && (
  fillSinglePanel ? (
    <CustomizePane fill />
  ) : (
    <ResizablePane initialWidth={400}>
      <CustomizePane />
    </ResizablePane>
  )
)}

      {activePanels.view && (
        <ViewerPane model={renderer.result?.model} />
      )}

    </div>
  );
}

export default App;