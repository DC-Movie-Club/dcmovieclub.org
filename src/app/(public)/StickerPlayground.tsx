"use client";

import { useState, useRef, useCallback } from "react";

interface StickerPosition {
  x: number;
  y: number;
  z: number;
  rotate: number;
  scale: number;
}

interface DraggableStickerProps {
  id: string;
  initialX: number;
  initialY: number;
  children: React.ReactNode;
  z: number;
  rotate: number;
  scale: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onGrab: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

function DraggableSticker({
  id,
  initialX,
  initialY,
  children,
  z,
  rotate,
  scale,
  containerRef,
  onGrab,
  onMove,
}: DraggableStickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const dragStart = useRef({ clientX: 0, clientY: 0, x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      dragStart.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        x: pos.x,
        y: pos.y,
      };
      ref.current?.setPointerCapture(e.pointerId);
      onGrab(id);
    },
    [pos, onGrab, id],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const containerWidth = containerRef.current?.offsetWidth ?? 1;
      const dx = e.clientX - dragStart.current.clientX;
      const dy = e.clientY - dragStart.current.clientY;
      const x =
        Math.round((dragStart.current.x + (dx / containerWidth) * 100) * 10) /
        10;
      const y = Math.round(dragStart.current.y + dy);
      setPos({ x, y });
      onMove(id, x, y);
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
        left: `calc(50% + ${pos.x}%)`,
        top: pos.y,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        zIndex: z,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="pointer-events-none">{children}</div>
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
  const [positions, setPositions] = useState<Record<string, StickerPosition>>(
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
      ),
  );
  const [lastGrabbed, setLastGrabbed] = useState<string | null>(null);
  const topZ = useRef(
    Math.max(...stickers.map((s) => s.initialZ ?? 0), stickers.length),
  );

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
      <div
        ref={containerRef}
        className="relative mx-auto h-[100svh] w-full overflow-visible"
      >
        {stickers.map((s) => (
          <DraggableSticker
            key={s.id}
            id={s.id}
            initialX={s.initialX}
            initialY={s.initialY}
            z={positions[s.id]?.z ?? 0}
            rotate={positions[s.id]?.rotate ?? 0}
            scale={positions[s.id]?.scale ?? 1}
            containerRef={containerRef}
            onGrab={handleGrab}
            onMove={handleMove}
          >
            {s.element}
          </DraggableSticker>
        ))}
      </div>
    </div>
  );
}
