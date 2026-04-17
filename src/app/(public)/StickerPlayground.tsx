"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { RotateCcw } from "lucide-react";

const HOVER_SHADOW =
  "drop-shadow(0 8px 20px rgba(0,0,0,0.18)) drop-shadow(0 2px 6px rgba(0,0,0,0.1))";

interface StickerPosition {
  x: number;
  y: number;
  z: number;
  rotate: number;
  scale: number;
}

interface DraggableStickerProps {
  id: string;
  x: number;
  y: number;
  children: React.ReactNode;
  z: number;
  rotate: number;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onGrab: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onHover?: () => void;
  onUnhover?: () => void;
}

function DraggableSticker({
  id,
  x,
  y,
  children,
  z,
  rotate,
  scale,
  containerRef,
  onGrab,
  onMove,
  onHover,
  onUnhover,
}: DraggableStickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ clientX: 0, clientY: 0, x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      dragStart.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        x,
        y,
      };
      ref.current?.setPointerCapture(e.pointerId);
      onGrab(id);
    },
    [x, y, onGrab, id],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const container = containerRef.current;
      const cw = container?.offsetWidth ?? 1;
      const ch = container?.offsetHeight ?? 1;
      const dx = e.clientX - dragStart.current.clientX;
      const dy = e.clientY - dragStart.current.clientY;
      const newX =
        Math.round((dragStart.current.x + (dx / cw) * 100) * 10) / 10;
      const newY =
        Math.round((dragStart.current.y + (dy / ch) * 100) * 10) / 10;
      onMove(id, newX, newY);
    },
    [id, onMove, containerRef],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      ref={ref}
      className="absolute cursor-grab touch-none active:cursor-grabbing"
      style={{
        left: `calc(50% + ${x}%)`,
        top: `calc(50% + ${y}%)`,
        transform: `rotate(${rotate}deg) scale(calc(${scale} * var(--sticker-scale, 1)))`,
        zIndex: z,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    >
      {children}
    </div>
  );
}

interface StickerConfig {
  id: string;
  initialX: number;
  initialY: number;
  initialRotate?: number;
  initialScale?: number;
  initialZ?: number;
  element: React.ReactNode;
}

export function StickerPlayground({ stickers }: { stickers: StickerConfig[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialPositions = useMemo(
    () =>
      Object.fromEntries(
        stickers.map((s, i) => [
          s.id,
          {
            x: s.initialX,
            y: s.initialY,
            z: s.initialZ ?? i,
            rotate: s.initialRotate ?? 0,
            scale: s.initialScale ?? 1,
          },
        ]),
      ) as Record<string, StickerPosition>,
    [stickers],
  );

  const [positions, setPositions] =
    useState<Record<string, StickerPosition>>(initialPositions);
  const [lastGrabbed, setLastGrabbed] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const topZ = useRef(
    Math.max(...stickers.map((s) => s.initialZ ?? 0), stickers.length),
  );

  const isDirty = useMemo(() => {
    return Object.entries(positions).some(([id, pos]) => {
      const init = initialPositions[id];
      return pos.x !== init.x || pos.y !== init.y;
    });
  }, [positions, initialPositions]);

  const handleReset = useCallback(() => {
    setPositions(initialPositions);
    topZ.current = Math.max(...Object.values(initialPositions).map((p) => p.z));
  }, [initialPositions]);

  const handleGrab = useCallback((id: string) => {
    topZ.current += 1;
    setLastGrabbed(id);
    setPositions((prev) => ({
      ...prev,
      [id]: { ...prev[id], z: topZ.current },
    }));
  }, []);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setPositions((prev) => ({ ...prev, [id]: { ...prev[id], x, y } }));
  }, []);

  return (
    <div
      className="relative -mb-[40svh] overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 70%, transparent 100%)",
      }}
    >
      {isDirty && (
        <button
          onClick={handleReset}
          className="group/reset absolute top-4 right-4 z-200 flex items-center gap-1.5 rounded-full border-2 border-charcoal bg-cream px-3 py-1.5 font-sans text-xs uppercase tracking-wide text-charcoal shadow-md sketch-subtle transition-transform hover:scale-105 hover:sketch-subtle-animated"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}

      <div
        ref={containerRef}
        className="relative mx-auto h-svh w-full overflow-visible [--sticker-scale:0.85] sm:[--sticker-scale:0.95] md:[--sticker-scale:1] lg:[--sticker-scale:1.1]"
      >
        {stickers.map((s) => {
          const pos = positions[s.id];
          const isHovered = hoveredId === s.id;
          return (
            <DraggableSticker
              key={s.id}
              id={s.id}
              x={pos?.x ?? s.initialX}
              y={pos?.y ?? s.initialY}
              z={isHovered ? 9999 : (pos?.z ?? 0)}
              rotate={pos?.rotate ?? 0}
              scale={pos?.scale ?? 1}
              containerRef={containerRef}
              onGrab={handleGrab}
              onMove={handleMove}
              onHover={() => setHoveredId(s.id)}
              onUnhover={() => setHoveredId(null)}
            >
              {s.element}
            </DraggableSticker>
          );
        })}
      </div>
    </div>
  );
}
