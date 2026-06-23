// src/hooks/useOpenScadRenderer.ts

import { useCallback, useEffect, useState } from "react";
import { cancelRender, renderScad } from "../services/openscadRenderClient";
import type { RenderResult } from "../types/render";

export function useOpenScadRenderer() {
  const [isRendering, setIsRendering] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

const render = useCallback(async (scad: string) => {
  console.log("[Hook] render start");

  setIsRendering(true);
  setLogs([]);
  setResult(null);
  setError(null);

  const renderResult = await renderScad(scad, (line) => {
    console.log("[Hook] stream:", line);
    setLogs((prev) => [...prev, line]);
  });

  console.log("[Hook] render result:", renderResult);

  setResult(renderResult);

  if (!renderResult.ok) {
    setError(renderResult.error ?? "OpenSCAD render failed.");
  }

  setIsRendering(false);

  return renderResult;
}, []);

  const cancel = useCallback(() => {
    cancelRender();
    setIsRendering(false);
  }, []);

  useEffect(() => {
    return () => {
      cancelRender();
    };
  }, []);

  return {
    render,
    cancel,
    isRendering,
    logs,
    result,
    error,
  };
}