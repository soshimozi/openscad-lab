import { useEffect, useRef } from "react";

type LogPanelProps = {
  logs: string[];
};

function lineClass(line: string): string {
  const l = line.toLowerCase();
  if (l.includes("error")) return "text-red-400";
  if (l.includes("warning")) return "text-amber-400";
  return "text-neutral-300";
}

export default function LogPanel({ logs }: LogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever output changes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const empty = logs.length === 0;

  return (
    <div className="flex h-48 shrink-0 flex-col border-t border-neutral-800 bg-neutral-950">
      <div className="flex h-7 shrink-0 items-center border-b border-neutral-800 px-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Output
        </span>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed"
      >
        {empty && <span className="text-neutral-600">No output yet.</span>}

        {logs.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line}
          </div>
        ))}


      </div>
    </div>
  );
}
