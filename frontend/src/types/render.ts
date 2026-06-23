export interface RenderResult {
  ok: boolean;
  model?: ArrayBuffer;
  logs: string[];
  elapsedMs: number;
  error?: string;
}

export interface WorkerStreamMessage {
  id: number;
  type: "stdout" | "stderr";
  text: string;
}

export interface WorkerResultMessage {
  id: number;
  type: "result";
  ok: boolean;
  model?: ArrayBuffer;
  logs: string[];
  elapsedMs: number;
  error?: string;
}

export type RenderTarget =
  | { kind: "assembly" }
  | { kind: "plate"; plate: number };

export type WorkerMessage = WorkerStreamMessage | WorkerResultMessage;