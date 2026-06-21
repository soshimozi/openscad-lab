import type { RenderResult, WorkerMessage } from "../types/render";

let renderJobId = 0;
let activeWorker: Worker | undefined;

export function renderScad(
  scad: string,
  onStream: (line: string) => void
): Promise<RenderResult> {
  const id = ++renderJobId;

  activeWorker?.terminate();

  return new Promise((resolve) => {
    console.log("[Client] creating worker")    

    const worker = new Worker(
      new URL("../workers/openscad.worker.ts", import.meta.url),
      { type: "module" }
    );

    activeWorker = worker;

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      
      const message = event.data;

      console.log("[Client] worker message:", message);

      if (message.id !== id) return;

      if (message.type === "stdout" || message.type === "stderr") {
        onStream(message.text);
        return;
      }

      if (message.type === "result") {
        worker.terminate();

        if (activeWorker === worker) {
          activeWorker = undefined;
        }

        resolve({
          ok: message.ok,
          model: message.ok ? message.model : undefined,
          logs: message.logs,
          elapsedMs: message.elapsedMs,
          error: message.ok ? undefined : message.error,
        });
      }
    };

    worker.onerror = (event) => {
    console.error("[Client] worker error:", event.message);

      worker.terminate();

      if (activeWorker === worker) {
        activeWorker = undefined;
      }

      resolve({
        ok: false,
        logs: [],
        elapsedMs: 0,
        error: event.message,
      });
    };


    console.log("[Client] posting render request", { id, scadLength: scad.length });
    worker.postMessage({ id, scad });
  });
}

export function cancelRender() {
  activeWorker?.terminate();
  activeWorker = undefined;
}