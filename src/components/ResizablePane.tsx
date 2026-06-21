import { useEffect, useRef, useState } from "react";

type ResizablePaneProps = {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
};

export function ResizablePane({
  initialWidth,
  minWidth = 280,
  maxWidth = 900,
  children,
}: ResizablePaneProps) {
  const [width, setWidth] = useState(initialWidth);
  const [dragging, setDragging] = useState(false);
  const paneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dragging) return;

    function onMouseMove(e: MouseEvent) {
      const left = paneRef.current?.getBoundingClientRect().left ?? 0;
      const nextWidth = e.clientX - left;

      setWidth(Math.min(maxWidth, Math.max(minWidth, nextWidth)));
    }

    function onMouseUp() {
      setDragging(false);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, minWidth, maxWidth]);

  return (
    <div ref={paneRef} className="flex h-full shrink-0" style={{ width }}>
      <div className="min-w-0 flex-1">{children}</div>

      <div
        className="w-1 cursor-col-resize bg-neutral-800 hover:bg-blue-500"
        onMouseDown={() => setDragging(true)}
      />
    </div>
  );
}