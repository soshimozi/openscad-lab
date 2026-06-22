/// <reference lib="webworker" />

import { ensureFontsMounted } from "./fonts";

export {};

declare const self: DedicatedWorkerGlobalScope;

type RenderRequest = {
  id: number;
  scad: string;
};

type WorkerStreamMessage = {
  id: number;
  type: "stdout" | "stderr";
  text: string;
};

type WorkerResultMessage =
  | {
      id: number;
      type: "result";
      ok: true;
      model: ArrayBuffer;
      logs: string[];
      elapsedMs: number;
      exitCode: number;
    }
  | {
      id: number;
      type: "result";
      ok: false;
      error: string;
      logs: string[];
      elapsedMs: number;
      exitCode?: number;
    };

type OpenSCADFactory = (options: Record<string, unknown>) => Promise<any>;

const INPUT_PATH = "/input.scad";
const OUTPUT_PATH = "/output.3mf";

let openscadPromise: Promise<any> | undefined;

let currentJobId = 0;
let currentLogs: string[] = [];

function postStream(type: "stdout" | "stderr", text: string) {
  currentLogs.push(text);

  const message: WorkerStreamMessage = {
    id: currentJobId,
    type,
    text,
  };

  self.postMessage(message);
}

async function getOpenSCAD() {
  if (!openscadPromise) {
    const openscadUrl = `${self.location.origin}/openscad.js`;

    openscadPromise = (async () => {
      const module = (await import(/* @vite-ignore */ openscadUrl)) as {
        default: OpenSCADFactory;
      };

      return module.default({
        noInitialRun: true,
        locateFile: (path: string) => `${self.location.origin}/${path}`,
        print: (text: string) => postStream("stdout", text),
        printErr: (text: string) => postStream("stderr", text),
      });
    })();
  }

  return openscadPromise;
}

function unlinkIfExists(instance: any, path: string) {
  try {
    instance.FS.unlink(path);
  } catch {
    // file may not exist yet
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function ensureLocalizationMounted(instance: any) {
  instance.FS.mkdirTree("/usr/share/openscad/locale");
  instance.FS.mkdirTree("/locale");
  instance.FS.mkdirTree("/translations");

  Object.assign(instance.ENV ?? {}, {
    LANG: "en_US.UTF-8",
    LC_ALL: "en_US.UTF-8",
    LANGUAGE: "en_US",
  });
}

self.addEventListener("message", async (event: MessageEvent<RenderRequest>) => {
  const { id, scad } = event.data;

  currentJobId = id;
  currentLogs = [];

  const started = performance.now();

  try {
    const instance = await getOpenSCAD();
    

    unlinkIfExists(instance, INPUT_PATH);
    unlinkIfExists(instance, OUTPUT_PATH);

    ensureLocalizationMounted(instance);

    await ensureFontsMounted(instance);

    instance.FS.writeFile(INPUT_PATH, scad);

    let exitCode: number;

    try {
      exitCode = instance.callMain([
        INPUT_PATH,
        "-o",
        OUTPUT_PATH,
        "--backend=manifold",
        "--export-format=3mf",
      ]);
    } catch (error) {
      if (typeof error === "number" && instance.formatException) {
        throw new Error(instance.formatException(error));
      }

      throw error;
    }

    if (exitCode !== 0) {
      throw new Error(`OpenSCAD exited with code ${exitCode}`);
    }

    const bytes = instance.FS.readFile(OUTPUT_PATH) as Uint8Array;
    const model = toArrayBuffer(bytes);

    const message: WorkerResultMessage = {
      id,
      type: "result",
      ok: true,
      model,
      logs: [...currentLogs],
      elapsedMs: performance.now() - started,
      exitCode,
    };

    self.postMessage(message, [model]);
  } catch (error) {
    const errorText = error instanceof Error ? error.message : String(error);

    const message: WorkerResultMessage = {
      id,
      type: "result",
      ok: false,
      error: errorText,
      logs: [...currentLogs, errorText],
      elapsedMs: performance.now() - started,
    };

    self.postMessage(message);
  }
});
