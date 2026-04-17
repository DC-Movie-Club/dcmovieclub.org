# Sticker System — Experimentation & Design Notes

This is the archive of the sticker-lab page. Everything we tried is captured here so the lab page can be rebuilt from these notes alone.

## Summary

Three production components:

| Component | Shape | Border | Peel |
|-----------|-------|--------|------|
| `DieCutSticker` | Arbitrary alpha (logos, PNGs, SVGs with transparency) | SVG `feMorphology` dilate on `SourceAlpha` | SVG `image` + polygon clip-path + reflected mirror copy. Requires `peel.src` image. CSS fallback for non-image children. |
| `TextSticker` | Typography | CSS `-webkit-text-stroke` + `paint-order: stroke fill` | SVG `foreignObject` + polygon clip-path. Measures the glyph bounding box via `useLayoutEffect`. |
| `RectSticker` | Rectangles with known backgrounds | CSS `border` | SlidePeel geometry (bsehovac-style): front slides, back revealed. Requires explicit `width` + `height`. |

All three share:
- **Elevation scale** `none / l1 / l2 / l3 / l4 / l5` — stacked drop shadows, Josh Comeau layered approach.
- **Shadow color** `#6b2e06` (warm dark brown, never pure black).
- **`elevationHover` prop** to swap the shadow on hover.
- **Controlled or hover-triggered peel** via `peel.active` (explicit) or hover (implicit).

---

## Elevation System

Shared across all three sticker components. Implemented with SVG filter primitives in DieCut/Text (so the silhouette follows the peeled shape) and stacked CSS `box-shadow` on the RectSticker front face.

```ts
const SHADOW_COLOR = "#6b2e06";

const elevations = {
  none: { layers: [] },
  l1: { layers: [{ dy: 1, stdDev: 0.75, opacity: 0.12 }] },
  l2: { layers: [
    { dy: 1, stdDev: 0.5, opacity: 0.075 },
    { dy: 2, stdDev: 2,   opacity: 0.075 },
  ]},
  l3: { layers: [
    { dy: 1, stdDev: 0.5, opacity: 0.06 },
    { dy: 2, stdDev: 2,   opacity: 0.06 },
    { dy: 4, stdDev: 4,   opacity: 0.06 },
  ]},
  l4: { layers: [
    { dy: 1, stdDev: 0.5, opacity: 0.05 },
    { dy: 2, stdDev: 1,   opacity: 0.05 },
    { dy: 4, stdDev: 2,   opacity: 0.05 },
    { dy: 8, stdDev: 4,   opacity: 0.05 },
  ]},
  l5: { layers: [
    { dy: 1,  stdDev: 0.5, opacity: 0.04 },
    { dy: 2,  stdDev: 1,   opacity: 0.04 },
    { dy: 4,  stdDev: 2,   opacity: 0.04 },
    { dy: 8,  stdDev: 4,   opacity: 0.04 },
    { dy: 16, stdDev: 8,   opacity: 0.04 },
  ]},
};
```

CSS-side translation (RectSticker): `box-shadow: 0 {dy}px {stdDev*2}px rgba(107,46,6,{opacity})` stacked with commas.

SVG-side pattern (DieCut / Text):

```xml
<feColorMatrix in="sticker" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="stickerAlpha"/>
<!-- For each layer: -->
<feGaussianBlur in="stickerAlpha" stdDeviation="{stdDev}" result="blur{i}"/>
<feOffset in="blur{i}" dy="{dy}" result="offset{i}"/>
<feFlood flood-color="#6b2e06" flood-opacity="{opacity}" result="sColor{i}"/>
<feComposite in="sColor{i}" in2="offset{i}" operator="in" result="shadow{i}"/>
<!-- Then: -->
<feMerge>
  <feMergeNode in="shadow{n-1}"/> ... <feMergeNode in="shadow0"/>
  <feMergeNode in="sticker"/>
</feMerge>
```

---

## Animation Helper

All peel components use the same eased-tween hook for when animation isn't driven by CSS transitions:

```ts
function useSmoothValue(target: number, duration: number) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  useEffect(() => {
    const start = valueRef.current;
    const startTime = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      const v = start + (target - start) * eased;
      valueRef.current = v;
      setValue(v);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}
```

The lab page used cosine easing `0.5 - cos(t*PI)/2` instead; production uses cubic ease-out. Either works.

---

## Peel Techniques Evaluated

Nine approaches. All rendered side-by-side as `Swatch` components in the lab, with three modes (hover/auto/manual) and shared controls for `peel`, `peelAngle`, `corner`, `color`.

### Shared lab controls

```ts
const presetColors = [
  { key: "rose",   value: "#ca6c84" },
  { key: "teal",   value: "#375b6d" },
  { key: "orange", value: "#eca344" },
  { key: "olive",  value: "#b1ad26" },
  { key: "rust",   value: "#a2390a" },
  { key: "purple", value: "#6372af" },
];

const corners = [
  { key: "tl", label: "↖" },
  { key: "tr", label: "↗" },
  { key: "bl", label: "↙" },
  { key: "br", label: "↘" },
];

const peelAnglePresets = [
  { label: "↘", value: -45 },
  { label: "→", value: 0 },
  { label: "↗", value: 45 },
  { label: "↑", value: 90 },
  { label: "↖", value: 135 },
];

type Mode = "manual" | "hover" | "auto";
```

Swatch shell (drives `peel` value by mode):

```tsx
function Swatch({ title, subtitle, mode, peel, period = 2400, children }) {
  const [hovered, setHovered] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  useEffect(() => {
    if (mode !== "auto") return;
    const i = setInterval(() => setAutoOpen(o => !o), period);
    return () => clearInterval(i);
  }, [mode, period]);
  const effectivePeel =
    mode === "manual" ? peel :
    mode === "hover"  ? (hovered ? peel : 0) :
                        (autoOpen ? peel : 0);
  return (
    <div className="flex flex-col gap-3">
      <div className={cn("flex min-h-[280px] items-center justify-center rounded-xl border border-charcoal/15 bg-background p-8",
           mode === "hover" && "cursor-pointer")}
           onMouseEnter={mode === "hover" ? () => setHovered(true) : undefined}
           onMouseLeave={mode === "hover" ? () => setHovered(false) : undefined}>
        {children(effectivePeel)}
      </div>
      <div>
        <h3 className="text-sm uppercase tracking-widest">{title}</h3>
        <p className="mt-0.5 font-sans text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
```

---

### 1. SlidePeel (bsehovac geometry) — **ADOPTED for RectSticker**

Credit: [bsehovac/peel](https://github.com/bsehovac/peel). Corner slides diagonally along `peelAngle`, clipped by a rotated overflow:hidden container. Mirrored back fills the revealed area.

Most realistic of the CSS techniques, no dependence on image silhouette.

```ts
const DEG = Math.PI / 180;

function computePeelStyles({ width, height, peelAngle, peel, borderRadius = 0 }) {
  const size = Math.sqrt(width * width + height * height);
  const offsetTop = (size - height) / 2;
  const offsetLeft = (size - width) / 2;

  let rotationAngleFix = 90 - peelAngle;
  if (peelAngle > 90)       rotationAngleFix = peelAngle - 90;
  else if (peelAngle < -90) rotationAngleFix = 270 - peelAngle;
  else if (peelAngle < 0)   rotationAngleFix = peelAngle + 90;

  let borderAngleFix = peelAngle;
  if (peelAngle > 90)       borderAngleFix = peelAngle - 90;
  else if (peelAngle < -90) borderAngleFix = peelAngle;
  else if (peelAngle < 0)   borderAngleFix = peelAngle - 90;

  const diagonalAngle = (Math.atan(height / width) * 180) / Math.PI;
  const angleFix = rotationAngleFix + diagonalAngle;
  const angleFixBack = peelAngle + 180;

  const offsetDiagonalAngle = (size - Math.sin(angleFix * DEG) * size) / 2;
  const offsetBorderRadiusBase = borderRadius * Math.SQRT2 - borderRadius;
  const offsetBorderRadius = offsetBorderRadiusBase * Math.sin(borderAngleFix * 2 * DEG);
  const offset = offsetDiagonalAngle + offsetBorderRadius;
  const offsetBack = offset - size;
  const peelTranslate = (size - offset * 2) * peel;

  const clipX = offset + peelTranslate;
  const frontFactor = -offset - peelTranslate;
  const frontX = frontFactor * Math.cos(peelAngle * DEG);
  const frontY = frontFactor * Math.sin(peelAngle * DEG);

  const backOs = offsetBack + peelTranslate;
  const backX = backOs * Math.cos(angleFixBack * DEG);
  const backY = backOs * Math.sin(angleFixBack * DEG);

  return {
    container: { width: size, height: size, top: -offsetTop, left: -offsetLeft, position: "absolute" },
    wrapper:   { width: size, height: size, transform: `rotate(${peelAngle}deg)`, position: "absolute", top: 0, left: 0 },
    clip:      { width: size, height: size, transform: `translateX(${clipX}px)`, position: "absolute", top: 0, left: 0, overflow: "hidden" },
    front:     { left: offsetLeft, top: offsetTop, width, height, borderRadius,
                 transform: `rotate(${-peelAngle}deg) translateX(${frontX}px) translateY(${frontY}px)`, position: "absolute" },
    back:      { left: offsetLeft, top: offsetTop, width, height, borderRadius,
                 transform: `rotate(${angleFixBack}deg) translateX(${backX}px) translateY(${-backY}px)`, position: "absolute" },
  };
}
```

Shell:

```tsx
function SlidePeel({ width=180, height=180, peelAngle=45, peel, color="#ca6c84",
                    backColor="#efecdf", borderRadius=8, duration=500,
                    curlShading=true, children }) {
  const s = computePeelStyles({ width, height, peelAngle, peel, borderRadius });
  const backBg = curlShading
    ? `linear-gradient(${peelAngle + 90}deg,
        rgba(0,0,0,0.22) 0%, ${backColor} 35%, ${backColor} 70%, rgba(255,255,255,0.25) 100%)`
    : backColor;
  return (
    <div className="relative" style={{ width, height }}>
      <div style={s.container}>
        <div style={s.wrapper}>
          <div style={{ ...s.clip, transition: `transform ${duration}ms ease-in-out` }}>
            <div style={{ ...s.front, background: color, zIndex: 1,
                          transition: `transform ${duration}ms ease-in-out`,
                          backfaceVisibility: "hidden", overflow: "hidden" }}>
              {children}
            </div>
            <div style={{ ...s.back, background: backBg, zIndex: 2,
                          transition: `transform ${duration}ms ease-in-out, box-shadow ${duration}ms ease-in-out`,
                          boxShadow: peel > 0.02
                            ? `${-3*Math.cos(peelAngle*DEG)}px ${-3*Math.sin(peelAngle*DEG)}px ${14*peel}px rgba(0,0,0,${0.35*peel})`
                            : "none",
                          backfaceVisibility: "hidden" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

Swatches:
- **Slide Peel** — borderRadius 8. Diagonal peel via 2D translate + clip mask. Cream underside, drop shadow.
- **Rounded** — borderRadius 28. Math compensates for radius offset.
- **Flat back** — `curlShading=false`. Solid underside, no curl shading. Reads more like folded paper.
- **Wide** — `width=240 height=140`. Non-square aspect. Useful for banner-shaped stickers.
- **With content** — `children` on the front face. Stays put as the corner peels.
- **Slow** — `duration=1200`. Easier to see each layer.

**Differences in RectSticker production version:**
- Corner prop instead of free peelAngle; mapping `tl=45, tr=135, bl=-45, br=-135`.
- Uses `rgba(0,0,0,0) → rgba(255,255,255,0)` for the mid stops and layers `backBg` over opaque `backingColor` (gradient on top, solid underneath) — avoids transparent underside.
- Shadow on the **front face** (so elevation follows the peeled shape, not the outer rectangle).
- `pointer-events: none` on the peel container (hit testing confined to outer `width × height`).
- Default `duration = 280` to match DieCutSticker.

---

### 2. Gradient Curl (linkesch ramp) — rejected

Corner wedge with `transparent → grey` ramp to fake the curl. Reads as a flat triangle, not a peel.

```tsx
function GradientCurl({ size=180, curl, corner="br", color="#ca6c84", duration=500 }) {
  const curlPx = curl * size * 0.55;

  const curlPos = {
    br: { bottom: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    tr: { top: 0, right: 0 },
    tl: { top: 0, left: 0 },
  }[corner];

  const curlGradient = {
    br: `linear-gradient(225deg, transparent 0%, transparent 45%, rgba(255,255,255,0.9) 50%, #c8c4b0 60%, #8a8676 90%, #6a6656 100%)`,
    bl: `linear-gradient(135deg, transparent 0%, transparent 45%, rgba(255,255,255,0.9) 50%, #c8c4b0 60%, #8a8676 90%, #6a6656 100%)`,
    tr: `linear-gradient(315deg, transparent 0%, transparent 45%, rgba(255,255,255,0.9) 50%, #c8c4b0 60%, #8a8676 90%, #6a6656 100%)`,
    tl: `linear-gradient(45deg,  transparent 0%, transparent 45%, rgba(255,255,255,0.9) 50%, #c8c4b0 60%, #8a8676 90%, #6a6656 100%)`,
  }[corner];

  const shadowOffset = {
    br: `-6px 6px 12px -3px rgba(0,0,0,0.45)`,
    bl: `6px 6px 12px -3px rgba(0,0,0,0.45)`,
    tr: `-6px -6px 12px -3px rgba(0,0,0,0.45)`,
    tl: `6px -6px 12px -3px rgba(0,0,0,0.45)`,
  }[corner];

  const bodyClip = {
    br: `polygon(0 0, 100% 0, 100% calc(100% - ${curlPx}px), calc(100% - ${curlPx}px) 100%, 0 100%)`,
    bl: `polygon(0 0, 100% 0, 100% 100%, ${curlPx}px 100%, 0 calc(100% - ${curlPx}px))`,
    tr: `polygon(0 0, calc(100% - ${curlPx}px) 0, 100% ${curlPx}px, 100% 100%, 0 100%)`,
    tl: `polygon(${curlPx}px 0, 100% 0, 100% 100%, 0 100%, 0 ${curlPx}px)`,
  }[corner];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-md"
           style={{ background: color, clipPath: curl > 0.02 ? bodyClip : undefined,
                    boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)",
                    transition: `clip-path ${duration}ms ease-in-out` }} />
      <div className="absolute"
           style={{ ...curlPos, width: curlPx, height: curlPx,
                    background: curlGradient,
                    boxShadow: curl > 0.02 ? shadowOffset : "none",
                    transition: `width ${duration}ms ease-in-out, height ${duration}ms ease-in-out, box-shadow ${duration}ms ease-in-out` }} />
    </div>
  );
}
```

Swatches: default, small max (`curl * 0.5` cap), slow (1200ms).

---

### 3. Giraudel Fold (clip-path morph) — rejected

Three-layer clip-path morph (body / shadow / flap). Pure CSS. Reads as folded paper, not a peel.

```tsx
function GiraudelFold({ size=180, fold, corner="br", color="#ca6c84",
                       underColor="#efecdf", duration=500 }) {
  const t = fold * 55;
  const config = {
    br: {
      bodyClip:   `polygon(0% 0%, 100% 0%, 100% ${100-t}%, ${100-t}% 100%, 0% 100%)`,
      flapClip:   `polygon(100% ${100-t}%, ${100-t}% 100%, ${100-t}% ${100-t}%)`,
      shadowClip: `polygon(100% ${100-t}%, ${100-t}% 100%, ${Math.max(0,100-t-2)}% ${Math.max(0,100-t-2)}%)`,
      gradient: `linear-gradient(135deg, #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
    bl: {
      bodyClip:   `polygon(0% 0%, 100% 0%, 100% 100%, ${t}% 100%, 0% ${100-t}%)`,
      flapClip:   `polygon(0% ${100-t}%, ${t}% 100%, ${t}% ${100-t}%)`,
      shadowClip: `polygon(0% ${100-t}%, ${t}% 100%, ${Math.min(100,t+2)}% ${Math.max(0,100-t-2)}%)`,
      gradient: `linear-gradient(225deg, #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
    tr: {
      bodyClip:   `polygon(0% 0%, ${100-t}% 0%, 100% ${t}%, 100% 100%, 0% 100%)`,
      flapClip:   `polygon(${100-t}% 0%, 100% ${t}%, ${100-t}% ${t}%)`,
      shadowClip: `polygon(${100-t}% 0%, 100% ${t}%, ${Math.max(0,100-t-2)}% ${Math.min(100,t+2)}%)`,
      gradient: `linear-gradient(45deg,  #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
    tl: {
      bodyClip:   `polygon(${t}% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${t}%)`,
      flapClip:   `polygon(${t}% 0%, 0% ${t}%, ${t}% ${t}%)`,
      shadowClip: `polygon(${t}% 0%, 0% ${t}%, ${Math.min(100,t+2)}% ${Math.min(100,t+2)}%)`,
      gradient: `linear-gradient(315deg, #b8b4a0 0%, ${underColor} 60%, #fff 100%)`,
    },
  }[corner];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-md"
           style={{ background: color, clipPath: config.bodyClip,
                    boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)",
                    transition: `clip-path ${duration}ms ease-in-out` }} />
      <div className="absolute inset-0"
           style={{ background: "rgba(0,0,0,0.45)", clipPath: config.shadowClip,
                    filter: "blur(3px)", transition: `clip-path ${duration}ms ease-in-out` }} />
      <div className="absolute inset-0 rounded-md"
           style={{ background: config.gradient, clipPath: config.flapClip,
                    transition: `clip-path ${duration}ms ease-in-out` }} />
    </div>
  );
}
```

Swatches: default, slow (1200ms), cream-under (`underColor="#efecdf"` — reads as paper folding back).

---

### 4. SVG Path Curl (cubic bezier) — rejected

Body with quadratic-bezier cut, curl as cubic-bezier petal with linear gradient + drop-shadow. Looks the most "real" of the pure shape approaches but is over-designed for a subtle hover effect.

```tsx
function SvgPathCurl({ size=180, fold, corner="br", color="#ca6c84", duration=500 }) {
  const animFold = useSmoothValue(fold, duration);
  const t = animFold * size * 0.5;
  const pad = 12;
  const W = size + pad * 2;

  const corners = {
    br: { ax: size, ay: size - t, bx: size - t, by: size },
    bl: { ax: 0,    ay: size - t, bx: t,        by: size },
    tr: { ax: size, ay: t,        bx: size - t, by: 0 },
    tl: { ax: 0,    ay: t,        bx: t,        by: 0 },
  }[corner];

  const cornerPt = {
    br: { x: size, y: size }, bl: { x: 0, y: size },
    tr: { x: size, y: 0 },    tl: { x: 0, y: 0 },
  }[corner];

  const inward = {
    br: { x: -1, y: -1 }, bl: { x: 1, y: -1 },
    tr: { x: -1, y: 1 },  tl: { x: 1, y: 1 },
  }[corner];

  const tipX = cornerPt.x + inward.x * t * 1.1;
  const tipY = cornerPt.y + inward.y * t * 1.1;
  const c1x = corners.ax + inward.x * t * 0.3;
  const c1y = corners.ay + inward.y * t * 0.3;
  const c2x = tipX + (corners.ax - cornerPt.x) * 0.4;
  const c2y = tipY + (corners.ay - cornerPt.y) * 0.4;
  const c3x = tipX + (corners.bx - cornerPt.x) * 0.4;
  const c3y = tipY + (corners.by - cornerPt.y) * 0.4;
  const c4x = corners.bx + inward.x * t * 0.3;
  const c4y = corners.by + inward.y * t * 0.3;

  const bodyPath = (() => {
    if (corner === "br") return `M 0 0 L ${size} 0 L ${corners.ax} ${corners.ay} Q ${cornerPt.x - t/2} ${cornerPt.y - t/2} ${corners.bx} ${corners.by} L 0 ${size} Z`;
    if (corner === "bl") return `M ${size} 0 L ${size} ${size} L ${corners.bx} ${corners.by} Q ${cornerPt.x + t/2} ${cornerPt.y - t/2} ${corners.ax} ${corners.ay} L 0 0 Z`;
    if (corner === "tr") return `M 0 ${size} L 0 0 L ${corners.bx} ${corners.by} Q ${cornerPt.x - t/2} ${cornerPt.y + t/2} ${corners.ax} ${corners.ay} L ${size} ${size} Z`;
    return                       `M ${size} ${size} L 0 ${size} L ${corners.ax} ${corners.ay} Q ${cornerPt.x + t/2} ${cornerPt.y + t/2} ${corners.bx} ${corners.by} L ${size} 0 Z`;
  })();

  const curlPath = `M ${corners.ax} ${corners.ay} C ${c1x} ${c1y} ${c2x} ${c2y} ${tipX} ${tipY} C ${c3x} ${c3y} ${c4x} ${c4y} ${corners.bx} ${corners.by} Z`;

  const gradAngle = {
    br: { x1: "100%", y1: "100%", x2: "0%",   y2: "0%" },
    bl: { x1: "0%",   y1: "100%", x2: "100%", y2: "0%" },
    tr: { x1: "100%", y1: "0%",   x2: "0%",   y2: "100%" },
    tl: { x1: "0%",   y1: "0%",   x2: "100%", y2: "100%" },
  }[corner];

  const gradId = `svg-curl-grad-${corner}`;
  const shadowId = `svg-curl-shadow-${corner}`;

  return (
    <svg width={W} height={W} viewBox={`${-pad} ${-pad} ${W} ${W}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} {...gradAngle}>
          <stop offset="0%"   stopColor="#fff7ed"/>
          <stop offset="40%"  stopColor="#d8d4c0"/>
          <stop offset="80%"  stopColor="#8a8676"/>
          <stop offset="100%" stopColor="#4a4636"/>
        </linearGradient>
        <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={2 + t * 0.05}/>
          <feOffset dx={inward.x * -2} dy={inward.y * -2} result="offsetblur"/>
          <feFlood floodColor="black" floodOpacity={0.35}/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d={bodyPath} fill={color} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))" }}/>
      {animFold > 0.02 && <path d={curlPath} fill={`url(#${gradId})`} filter={`url(#${shadowId})`}/>}
    </svg>
  );
}
```

Swatches: default, slow (1200ms), small (capped at `fold * 0.5`).

---

### 5. Mirrored Flap (React Bits style) — rejected

Clip body upward; mirrored duplicate slides down to simulate back-of-paper. Only works for edges (top/bottom/left/right), not corners. Fakes back-of-paper by mirroring content.

```tsx
function MirroredFlap({ width=180, height=180, peel, color="#ca6c84",
                       duration=500, edge="top", children }) {
  const p = peel * 50;
  const config = {
    top: {
      bodyClip: `polygon(0% ${p}%, 100% ${p}%, 100% 100%, 0% 100%)`,
      flapClip: `polygon(0% ${100-p}%, 100% ${100-p}%, 100% 100%, 0% 100%)`,
      flapStyle: { top: `calc(-100% + ${2*p}% - 1px)`, left: 0, width: "100%", height: "100%", transform: "scaleY(-1)" },
      flapTransition: `top ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
    bottom: {
      bodyClip: `polygon(0% 0%, 100% 0%, 100% ${100-p}%, 0% ${100-p}%)`,
      flapClip: `polygon(0% 0%, 100% 0%, 100% ${p}%, 0% ${p}%)`,
      flapStyle: { top: `calc(100% - ${2*p}% + 1px)`, left: 0, width: "100%", height: "100%", transform: "scaleY(-1)" },
      flapTransition: `top ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
    left: {
      bodyClip: `polygon(${p}% 0%, 100% 0%, 100% 100%, ${p}% 100%)`,
      flapClip: `polygon(${100-p}% 0%, 100% 0%, 100% 100%, ${100-p}% 100%)`,
      flapStyle: { left: `calc(-100% + ${2*p}% - 1px)`, top: 0, width: "100%", height: "100%", transform: "scaleX(-1)" },
      flapTransition: `left ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
    right: {
      bodyClip: `polygon(0% 0%, ${100-p}% 0%, ${100-p}% 100%, 0% 100%)`,
      flapClip: `polygon(0% 0%, ${p}% 0%, ${p}% 100%, 0% 100%)`,
      flapStyle: { left: `calc(100% - ${2*p}% + 1px)`, top: 0, width: "100%", height: "100%", transform: "scaleX(-1)" },
      flapTransition: `left ${duration}ms ease-in-out, clip-path ${duration}ms ease-in-out`,
    },
  }[edge];

  return (
    <div className="relative" style={{ width, height }}>
      <div className="absolute inset-0 overflow-hidden rounded-md"
           style={{ background: color, clipPath: config.bodyClip,
                    transition: `clip-path ${duration}ms ease-in-out`,
                    boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)" }}>
        {children}
      </div>
      <div className="absolute overflow-hidden rounded-md"
           style={{ ...config.flapStyle, background: color, clipPath: config.flapClip,
                    transition: config.flapTransition,
                    filter: "brightness(1.25) saturate(0.6)",
                    boxShadow: peel > 0.02 ? "0 6px 14px rgba(0,0,0,0.3)" : "none" }}>
        {children}
      </div>
    </div>
  );
}
```

Swatches: top edge with "DCMC" text, bottom edge with "DCMC" text, top edge solid (no content — reads more like a tab than a peel).

---

### 6. Rotated Flap (true 3D) — rejected

Real 3D rotation around the fold axis with `rotate3d` + backface-visibility. Reads as tilted, not curled.

```tsx
function RotatedFlap({ size=180, peel, corner="br", color="#ca6c84",
                      underColor="#efecdf", duration=500 }) {
  const fold = size * 0.45;
  const angle = peel * 170;

  const config = {
    br: { bodyClip: `polygon(0 0, 100% 0, 100% calc(100% - ${fold}px), calc(100% - ${fold}px) 100%, 0 100%)`,
          flapPos: { bottom: 0, right: 0 }, flapClip: "polygon(100% 0, 100% 100%, 0 100%)",
          axis: "1, -1, 0", sign: 1, shadowDx: -2, shadowDy: -2 },
    bl: { bodyClip: `polygon(0 0, 100% 0, 100% 100%, ${fold}px 100%, 0 calc(100% - ${fold}px))`,
          flapPos: { bottom: 0, left: 0 }, flapClip: "polygon(0 0, 100% 100%, 0 100%)",
          axis: "1, 1, 0", sign: -1, shadowDx: 2, shadowDy: -2 },
    tr: { bodyClip: `polygon(0 0, calc(100% - ${fold}px) 0, 100% ${fold}px, 100% 100%, 0 100%)`,
          flapPos: { top: 0, right: 0 }, flapClip: "polygon(0 0, 100% 0, 100% 100%)",
          axis: "1, 1, 0", sign: 1, shadowDx: -2, shadowDy: 2 },
    tl: { bodyClip: `polygon(${fold}px 0, 100% 0, 100% 100%, 0 100%, 0 ${fold}px)`,
          flapPos: { top: 0, left: 0 }, flapClip: "polygon(0 0, 100% 0, 0 100%)",
          axis: "1, -1, 0", sign: -1, shadowDx: 2, shadowDy: 2 },
  }[corner];

  return (
    <div className="relative" style={{ width: size, height: size, perspective: "800px" }}>
      <div className="absolute inset-0 rounded-md"
           style={{ background: color, clipPath: config.bodyClip,
                    boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)" }} />
      <div className="absolute"
           style={{ ...config.flapPos, width: fold, height: fold,
                    transformStyle: "preserve-3d", transformOrigin: "50% 50%",
                    transform: `rotate3d(${config.axis}, ${config.sign * angle}deg)`,
                    transition: `transform ${duration}ms ease-in-out` }}>
        <div className="absolute inset-0"
             style={{ background: color, clipPath: config.flapClip, backfaceVisibility: "hidden" }} />
        <div className="absolute inset-0"
             style={{ background: underColor, clipPath: config.flapClip, backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)", boxShadow: "inset 0 0 12px rgba(0,0,0,0.2)" }} />
      </div>
      <div className="absolute pointer-events-none"
           style={{ ...config.flapPos, width: fold, height: fold,
                    background: "rgba(0,0,0,0.35)", clipPath: config.flapClip,
                    filter: "blur(4px)",
                    transform: `translate(${config.shadowDx}px, ${config.shadowDy}px)`,
                    opacity: peel > 0.05 ? Math.min(1, peel * 1.5) : 0,
                    transition: `opacity ${duration}ms ease-in-out`, zIndex: -1 }} />
    </div>
  );
}
```

Swatches: default, slow (1200ms — watch the back face appear past 90°), high-contrast (`underColor="#ffffff"`).

---

### 7. SvgPeel (simple SVG clip-path mirror)

Used as the hero of the lab. Plain logo PNG with the peel applied directly — SVG masks + reflection.

```tsx
function SvgPeel({ src, size=280, fold, corner="br", duration=500 }) {
  const rawId = useRef(Math.random().toString(36).slice(2, 9));
  const id = rawId.current;
  const animFold = useSmoothValue(fold, duration);
  const p = animFold * 0.55;
  const cut = p * size;

  let frontPolygon = "", flapPolygon = "", reflectionMatrix = "";
  switch (corner) {
    case "br": {
      const c = 2 * size - cut;
      frontPolygon = `0,0 ${size},0 ${size},${size-cut} ${size-cut},${size} 0,${size}`;
      flapPolygon  = `${size-cut},${size} ${size},${size-cut} ${size-cut},${size-cut}`;
      reflectionMatrix = `matrix(0 -1 -1 0 ${c} ${c})`;
      break;
    }
    case "bl": {
      const k = size - cut;
      frontPolygon = `0,0 ${size},0 ${size},${size} ${cut},${size} 0,${size-cut}`;
      flapPolygon  = `0,${size-cut} ${cut},${size} ${cut},${size-cut}`;
      reflectionMatrix = `matrix(0 1 1 0 ${-k} ${k})`;
      break;
    }
    case "tr": {
      const k = size - cut;
      frontPolygon = `0,0 ${size-cut},0 ${size},${cut} ${size},${size} 0,${size}`;
      flapPolygon  = `${size-cut},0 ${size},${cut} ${size-cut},${cut}`;
      reflectionMatrix = `matrix(0 1 1 0 ${k} ${-k})`;
      break;
    }
    case "tl": {
      frontPolygon = `${cut},0 ${size},0 ${size},${size} 0,${size} 0,${cut}`;
      flapPolygon  = `${cut},0 0,${cut} ${cut},${cut}`;
      reflectionMatrix = `matrix(0 -1 -1 0 ${cut} ${cut})`;
      break;
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={`front-${id}`}><polygon points={frontPolygon}/></clipPath>
        <clipPath id={`flap-${id}`}><polygon points={flapPolygon}/></clipPath>
        <filter id={`drop-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.22"/>
        </filter>
      </defs>
      <g filter={`url(#drop-${id})`}>
        <image href={src} x="0" y="0" width={size} height={size}
               preserveAspectRatio="xMidYMid meet" clipPath={`url(#front-${id})`}/>
      </g>
      <g clipPath={`url(#flap-${id})`}>
        <image href={src} x="0" y="0" width={size} height={size}
               preserveAspectRatio="xMidYMid meet" transform={reflectionMatrix}
               style={{ filter: "brightness(0.55) saturate(0.6)" }}/>
      </g>
    </svg>
  );
}
```

**This is the exact geometry that powers `DieCutSticker`'s `PeelImage`** (when `peel.src` is passed). Flap silhouette follows the logo outline, not the bounding box. Hinge stays straight.

---

### 8. Peel-js style (shape-aware peel) — production DieCutSticker

The front is clipped to remove a triangular corner. The flap is a *mirrored* copy of the logo reflected across the fold line, then double-clipped: (a) to the flap triangle and (b) to the logo's own alpha silhouette (via CSS mask).

The flap's free edge curves with the logo outline — not the bounding box. Hinge stays straight.

```tsx
function PeelJsStyle({ src, size=180, fold, corner="br", duration=500, backDim=0.85 }) {
  const p = fold * 0.55;
  const pct = p * 100;
  const k = size * (1 - p);
  const c = size * (2 - p);
  const kTl = size * p;

  const config = {
    br: {
      frontClip: `polygon(0 0, 100% 0, 100% ${100-pct}%, ${100-pct}% 100%, 0 100%)`,
      flapClip:  `polygon(${100-pct}% 100%, 100% ${100-pct}%, ${100-pct}% ${100-pct}%)`,
      matrix: `matrix(0, -1, -1, 0, ${c}, ${c})`, shadowAngle: 135,
    },
    bl: {
      frontClip: `polygon(0 0, 100% 0, 100% 100%, ${pct}% 100%, 0 ${100-pct}%)`,
      flapClip:  `polygon(0 ${100-pct}%, ${pct}% 100%, ${pct}% ${100-pct}%)`,
      matrix: `matrix(0, 1, 1, 0, ${-k}, ${k})`, shadowAngle: 45,
    },
    tr: {
      frontClip: `polygon(0 0, ${100-pct}% 0, 100% ${pct}%, 100% 100%, 0 100%)`,
      flapClip:  `polygon(${100-pct}% 0, 100% ${pct}%, ${100-pct}% ${pct}%)`,
      matrix: `matrix(0, 1, 1, 0, ${k}, ${-k})`, shadowAngle: 225,
    },
    tl: {
      frontClip: `polygon(${pct}% 0, 100% 0, 100% 100%, 0 100%, 0 ${pct}%)`,
      flapClip:  `polygon(${pct}% 0, 0 ${pct}%, ${pct}% 0)`,
      matrix: `matrix(0, -1, -1, 0, ${kTl}, ${kTl})`, shadowAngle: 315,
    },
  }[corner];

  const logoFill = {
    backgroundImage: `url(${src})`, backgroundSize: "contain",
    backgroundRepeat: "no-repeat", backgroundPosition: "center",
  };

  const maskStyle = {
    maskImage: `url(${src})`, WebkitMaskImage: `url(${src})`,
    maskSize: "contain", WebkitMaskSize: "contain",
    maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
    maskPosition: "center", WebkitMaskPosition: "center",
    maskMode: "alpha",
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0"
           style={{ ...logoFill, clipPath: config.frontClip,
                    transition: `clip-path ${duration}ms ease-in-out`,
                    filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.2))" }}/>
      <div className="absolute inset-0"
           style={{ ...maskStyle, clipPath: config.flapClip,
                    transition: `clip-path ${duration}ms ease-in-out` }}>
        <div className="absolute inset-0"
             style={{ ...logoFill, transform: config.matrix, transformOrigin: "0 0",
                      filter: `brightness(${backDim}) saturate(0.7) contrast(0.95)` }}/>
        <div className="absolute inset-0"
             style={{ background: `linear-gradient(${config.shadowAngle}deg, rgba(0,0,0,0.45) 0%, transparent 45%)`,
                      mixBlendMode: "multiply" }}/>
        <div className="absolute inset-0"
             style={{ background: `linear-gradient(${config.shadowAngle}deg, transparent 55%, rgba(255,255,255,0.3) 100%)`,
                      mixBlendMode: "screen" }}/>
      </div>
    </div>
  );
}
```

Swatches: default (DCMC logo), large (220px), wrapped in DieCutSticker (outline re-dilates), dark back (`backDim=0.55`), audience image, slow (1200ms).

---

### 9. DieCutPeel (simple mask peel) — rejected

Just a gradient curl masked to the logo silhouette. No mirrored back. Kept as comparison for #8.

```tsx
function DieCutPeel({ src, size=180, fold, corner="br", duration=500, curlBase=0.55 }) {
  const cutSize = fold * size * curlBase;
  const bodyClip = {
    br: `polygon(0 0, 100% 0, 100% calc(100% - ${cutSize}px), calc(100% - ${cutSize}px) 100%, 0 100%)`,
    bl: `polygon(0 0, 100% 0, 100% 100%, ${cutSize}px 100%, 0 calc(100% - ${cutSize}px))`,
    tr: `polygon(0 0, calc(100% - ${cutSize}px) 0, 100% ${cutSize}px, 100% 100%, 0 100%)`,
    tl: `polygon(${cutSize}px 0, 100% 0, 100% 100%, 0 100%, 0 ${cutSize}px)`,
  }[corner];
  const curlPos = {
    br: { bottom: 0, right: 0 }, bl: { bottom: 0, left: 0 },
    tr: { top: 0, right: 0 },    tl: { top: 0, left: 0 },
  }[corner];
  const curlGradient = {
    br: `linear-gradient(225deg, transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
    bl: `linear-gradient(135deg, transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
    tr: `linear-gradient(315deg, transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
    tl: `linear-gradient(45deg,  transparent 0%, transparent 48%, rgba(255,255,255,0.9) 52%, #c8c4b0 62%, #7a7666 90%, #4a4636 100%)`,
  }[corner];
  const curlShadow = {
    br: "-4px 4px 10px -2px rgba(0,0,0,0.45)",
    bl: "4px 4px 10px -2px rgba(0,0,0,0.45)",
    tr: "-4px -4px 10px -2px rgba(0,0,0,0.45)",
    tl: "4px -4px 10px -2px rgba(0,0,0,0.45)",
  }[corner];
  const maskStyle = {
    maskImage: `url(${src})`, WebkitMaskImage: `url(${src})`,
    maskSize: "contain", WebkitMaskSize: "contain",
    maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
    maskPosition: "center", WebkitMaskPosition: "center",
  };
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0"
           style={{ backgroundImage: `url(${src})`, backgroundSize: "contain",
                    backgroundRepeat: "no-repeat", backgroundPosition: "center",
                    clipPath: bodyClip,
                    transition: `clip-path ${duration}ms ease-in-out`,
                    filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.2))" }}/>
      <div className="absolute inset-0" style={maskStyle}>
        <div className="absolute"
             style={{ ...curlPos, width: cutSize, height: cutSize,
                      background: curlGradient,
                      boxShadow: fold > 0.02 ? curlShadow : "none",
                      transition: `width ${duration}ms ease-in-out, height ${duration}ms ease-in-out, box-shadow ${duration}ms ease-in-out` }}/>
      </div>
    </div>
  );
}
```

---

## DieCutSticker Integrated Peel (production)

The baked-in peel on the production `DieCutSticker` is an opt-in `peel` prop that combines #7 / #8 for image sources with a CSS clip-path fallback for non-image children.

```ts
interface PeelConfig {
  src?: string;          // If present: PeelImage (SVG mirror). If absent: CssPeel (clip polygons)
  size?: number;         // Default 200
  corner?: "tl"|"tr"|"bl"|"br";  // Default "br"
  amount?: number;       // Default 0.5
  duration?: number;     // Default 280 ms
  active?: boolean;      // Controlled mode (undefined = hover-triggered)
  backingColor?: string; // CssPeel fallback only, default "#e8e5d8"
}
```

The white outline filter (`feMorphology` dilate) wraps the peeled silhouette each frame — the outline follows the cut shape, not the bounding box.

Swatches demonstrated in the lab (all work with `active: p > 0.01` controlled by mode toggle):
- Default (br, 50%, 200px)
- No outline (`outlineColor="transparent"` — just the peel, no white border)
- Always-on (`active: true` — static decoration)
- Slow (`duration: 1200`)
- With tape (existing `tape` prop composes)
- Audience PNG (same API, different source)

### CssPeel fallback (non-image children)

Same clip polygons as `cssPeelClips`:

```ts
function cssPeelClips(corner, cutPct) {
  const c = `${cutPct}%`;
  const r = `${100 - cutPct}%`;
  switch (corner) {
    case "br": return {
      front: `polygon(0% 0%, 100% 0%, 100% ${r}, ${r} 100%, 0% 100%)`,
      flap:  `polygon(${r} 100%, 100% ${r}, 100% 100%)`,
      flapGradient: "linear-gradient(225deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
    };
    case "bl": return {
      front: `polygon(0% 0%, 100% 0%, 100% 100%, ${c} 100%, 0% ${r})`,
      flap:  `polygon(0% ${r}, ${c} 100%, 0% 100%)`,
      flapGradient: "linear-gradient(315deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
    };
    case "tr": return {
      front: `polygon(0% 0%, ${r} 0%, 100% ${c}, 100% 100%, 0% 100%)`,
      flap:  `polygon(${r} 0%, 100% ${c}, 100% 0%)`,
      flapGradient: "linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
    };
    case "tl": return {
      front: `polygon(${c} 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${c})`,
      flap:  `polygon(${c} 0%, 0% ${c}, 0% 0%)`,
      flapGradient: "linear-gradient(45deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 100%)",
    };
  }
}
```

This was the original peel approach for `RectSticker` — abandoned because it reads as a flat colored triangle rather than a peel. Superseded by SlidePeel geometry. It remains in DieCutSticker only as a fallback for the rare case where `peel.src` is absent.

---

## TextSticker Peel

Measures the glyph bounding box with `useLayoutEffect`, then renders the SVG-foreignObject variant:

```tsx
function TextPeel({ children, fold, corner, duration }) {
  const measureRef = useRef(null);
  const [size, setSize] = useState(null);
  const animFold = useSmoothValue(fold, duration);
  useLayoutEffect(() => {
    if (measureRef.current) {
      setSize({ w: measureRef.current.offsetWidth, h: measureRef.current.offsetHeight });
    }
  }, [children]);
  if (!size) return <span ref={measureRef} style={{ display: "inline-block" }}>{children}</span>;
  const { w, h } = size;
  const p = animFold * 0.55;
  const cut = p * Math.min(w, h);
  // ... same polygon math as SvgPeel but parameterised by w/h (not size)
  // ... foreignObject contains <span>{children}</span> for both front and reflected flap
}
```

Unlike SvgPeel, dimensions come from measurement, not a prop. Unlike RectSticker, measurement works fine here because glyphs have synchronous layout (no async image load).

---

## Final Mapping / Production Choices

| Sticker | Peel variant | Source |
|---------|--------------|--------|
| `DieCutSticker` with `peel.src` | PeelImage (SvgPeel #7 — polygon clip + mirrored `<image>`) | Used for transparent PNGs / logos |
| `DieCutSticker` without `peel.src` | CssPeel (gradient triangle clip-path) | Fallback only |
| `TextSticker` | TextPeel (SvgPeel variant with `foreignObject`, measured w/h) | For typography |
| `RectSticker` | SlidePeel (#1 — bsehovac geometry) | For rectangles with known backgrounds |

**Peel amount production values:** 0.05–0.15 for subtle hover lift. Values above ~0.2 read as "tearing" rather than "lifting."

**Peel duration production value:** 280ms across all three components.

---

## Lab Page Structure

If reconstructing the lab page (`src/app/(public)/sticker-lab/page.tsx`):

1. **Sticky control bar** at top with Mode (`hover`/`auto`/`manual`), Peel slider (0–100%), Angle slider (-90 to 180, with preset buttons `↘→↗↑↖`), Corner picker (4 arrow buttons), Color swatches (6 preset colors).
2. **Hero section** — `SvgPeel` with the DCMC logo at 320px, using current corner/peel from state.
3. **Sections** in this order, each a grid of Swatch components:
   - DieCutSticker integrated peel (6 swatches)
   - Slide Peel (6 swatches incl. rounded, flat back, wide, with content, slow)
   - Gradient Curl (3)
   - Giraudel Fold (3)
   - SVG Path Curl (3)
   - Mirrored Flap (3)
   - Rotated Flap (3)
   - Peel-js style (6 incl. audience image, wrapped in DieCutSticker)
   - DieCutPeel comparison (1)
   - RectSticker (9 — Solid + text, elevation hover, Image content, Tinted border, Wide banner SVG, Thin border heavy shadow, Rotated, No radius, Slow peel)
4. **Footer** summarizing the five technique families.

All swatches share the same Swatch shell; mode/peel/corner/color come from top-level state.

---

## Gotchas Encountered

- **Tiny image sticker.** `RectSticker` initially used `useLayoutEffect` + `ResizeObserver` measurement. Next.js `<Image>` starts at 0×0 before load, so the sticker rendered as a 16×16 white square until the image loaded. Fixed by requiring explicit `width` + `height` props on `RectSticker`.
- **Transparent peel backing.** The original `backBg` gradient used `rgba(0,0,0,0.22) → backingColor` stops, making the underside mostly transparent at the edges. Fixed by layering the gradient on an opaque base: `linear-gradient(..., rgba(0,0,0,0) → rgba(255,255,255,0) …), ${backingColor}`.
- **Rectangular box-shadow over a peeled sticker.** `overflow: hidden` on the outer clips the peel hit-area but makes the outer shadow rectangular — visually wrong when the corner is peeled. Fixed by moving `box-shadow` to the front face (moves with the peel) and dropping `overflow: hidden`; added `pointer-events: none` on the peel container to keep hit-testing within `width × height`.
- **Peel corners mapped to wrong angles.** CSS rotation is clockwise and Y is down, so the mathematical intuition was inverted. Correct map: `tl=45, tr=135, bl=-45, br=-135`.
- **Measurement timing in TextSticker vs RectSticker.** Text measurement is synchronous (glyphs lay out immediately). Image measurement is async (load event). Passing dimensions explicitly is more reliable than measuring for RectSticker.
- **Non-`priority` `<Image>` lazy-loads**, which defers the `onLoad` event until the image is near the viewport. Another reason to pass explicit dimensions to RectSticker.

---

## References

- [bsehovac/peel](https://github.com/bsehovac/peel) — SlidePeel geometry source
- [linkesch.com](https://linkesch.com/) — gradient curl inspiration
- [Hugo Giraudel's fold demo](https://codepen.io/HugoGiraudel) — three-layer clip-path fold
- [React Bits Peel](https://reactbits.dev) — mirrored flap technique
- [Josh Comeau — Designing Beautiful Shadows in CSS](https://www.joshwcomeau.com/css/designing-shadows/) — layered shadow approach
