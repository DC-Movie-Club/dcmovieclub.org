# Hand-Drawn Border Effect — Experimentation Log

## Technique Overview

Core primitive: SVG `feTurbulence` + `feDisplacementMap` applied via CSS `filter: url(#id)`.

Two concerns layered together:
1. **Edge texture** — high-frequency displacement + blur/sharpen makes border edges look organic/pencil-drawn
2. **Shape wobble** — low-frequency displacement makes straight lines irregular, as if drawn with an unsteady hand

### References
- [CSS-Tricks: Creating a Pencil Effect in SVG](https://css-tricks.com/creating-a-pencil-effect-in-svg/)
- [Scott Turner's original post](https://heredragonsabound.blogspot.com/2020/02/creating-pencil-effect-in-svg.html)
- [CodePen: g105b — static hand-drawn border](https://codepen.io/g105b/pen/QwbRjYB) — feTurbulence bf=0.05, numOctaves=4, scale=2
- [CodePen: johnclendvoy — animated version](https://codepen.io/johnclendvoy/pen/bNdyeXM) — 3 filters cycling via CSS keyframes, scale=8 (too turbulent)
- [dev.to: thormeier — draw-in animation](https://dev.to/thormeier/hand-drawn-border-animation-using-clip-path-and-border-radius-36ln) — clip-path + border-radius approach for entrance animation (separate concern)

---

## Edge Texture Exploration (C Series)

Goal: make border edges look pencil-drawn rather than pixel-perfect.

### Simple displacement (rejected)
| ID | baseFrequency | numOctaves | scale | Post-processing | Notes |
|----|--------------|------------|-------|-----------------|-------|
| B  | 0.05         | 4          | 2     | none            | Too pixel-y, jagged |

### High-freq displacement (getting closer)
| ID | baseFrequency | numOctaves | scale | Filter region | Notes |
|----|--------------|------------|-------|---------------|-------|
| C  | 1.2          | 3          | 3     | -2%/104%      | Finer detail, still sharp |
| C2 | 1.8          | 3          | 2     | -1%/102%      | Tighter, smaller |
| C3 | 2.5          | 3          | 2     | 0%/100%       | Flush, getting there |
| C4 | 3.5          | 3          | 2     | 0%/100%       | Even finer |
| C5 | 5.0          | 3          | 2     | 0%/100%       | Very fine grain |

### High-freq + blur/sharpen (the breakthrough)
Adding `feGaussianBlur` then `feConvolveMatrix` (sharpen kernel `0 -1 0 -1 5 -1 0 -1 0`) smooths pixel jitter into organic edges.

| ID  | baseFrequency | numOctaves | scale | blur σ | sharpen center | Notes |
|-----|--------------|------------|-------|--------|----------------|-------|
| C6  | 2.5          | 3          | 2     | 0.4    | 5              | Good but slightly coarse |
| C7  | 3.5          | 3          | 2     | 0.4    | 5              | — |
| C8  | 3.5          | 3          | 2     | 0.6    | 6              | Heavier blur/sharpen |
| **C11** | **3.0**  | **3**      | **2** | **0.45** | **5**        | **Winner — perfect edge texture** |
| C12 | 3.5          | 3          | 2     | 0.45   | 5              | — |
| C13 | 4.0          | 3          | 2     | 0.45   | 5              | — |
| C9  | 5.0          | 3          | 2     | 0.5    | 5              | Too fine |
| C10 | 3.5          | 3          | 3     | 0.5    | 5              | More wobble, slightly too much |

### Grain mask approach (rejected)
Used `feColorMatrix` alpha threshold + `feComposite operator="in"` to create a grainy mask.

| ID | Approach | Notes |
|----|----------|-------|
| D  | Grain mask, bf=2.0, threshold -1.5/1.5 | Too destructive |
| G  | Softer grain mask, bf=1.5, threshold -1.0/1.2 | Still too much |
| E  | Grain mask + displacement | Extreme |
| E2 | Toned down grain + displacement | Better but still off |
| E3 | Lighter grain + high-freq displacement | — |

### Multi-pass blend (different aesthetic)
Multiple displaced copies blended with `feBlend mode="multiply"`. Creates a darkened pencil effect.

| ID | Approach | Notes |
|----|----------|-------|
| F  | 3-pass, low+low+high freq, scale 5/5/3 | Interesting but darkens fill |
| F2 | 3-pass, reduced scale 3/3/2 | Less extreme |
| F3 | 3-pass, all high-freq | — |
| I  | 2-pass high-freq multiply | — |
| J  | 2-pass high-freq screen blend | Lighter |

---

## Wobble Exploration (W Series)

Goal: make straight lines look hand-drawn with unsteady-hand irregularity.

### Key finding
All winners used **single-pass displacement** with **mid-range frequency (0.02–0.04)** and **scale 4–5**. Multi-pass multiply darkens the fill. Chained displacement gets too chaotic.

| ID  | type         | baseFrequency | numOctaves | scale | Extra | Notes |
|-----|-------------|--------------|------------|-------|-------|-------|
| W1  | fractalNoise | 0.015        | 2          | 4     | —     | Too gentle, smooth sway |
| W2  | fractalNoise | 0.015        | 2          | 7     | —     | Too dramatic |
| **W3** | **fractalNoise** | **0.04** | **2**  | **4** | **—** | **Winner — clean wiggles** |
| **W4** | **turbulence** | **0.02** | **3**  | **5** | **—** | **Winner — blockier, angular** |
| W5  | fractalNoise | 0.02         | 3          | 4     | 2-pass multiply | Darkens fill |
| W6  | fractalNoise | 0.06         | 2          | 3     | 2-pass multiply | — |
| W7  | fractalNoise | mixed        | 2          | 5/3/2 | 3-pass multiply | — |
| **W8** | **fractalNoise** | **0.03** | **5** | **5** | **—** | **Winner — most organic (extra octaves)** |
| **W9** | **fractalNoise** | **0.025** | **3** | **4** | **feMorphology erode 0.3** | **Winner — pen-stroke feel** |
| W10 | fractalNoise | 0.02/0.08    | 2          | 4/2   | chained displacement | Too chaotic |
| W11 | fractalNoise | 0.01/0.05/0.2 | 2         | 4/3/1.5 | 3x chained | Too chaotic |
| W12 | fractalNoise | 0.02         | 3          | 5     | blur/sharpen only | Jagged edges |

---

## Combining Wobble + Texture

### Approaches tested

**Approach 1 — Wobble → Texture (chained in one filter):**
Displace for wobble first, then displace the wobbled result for edge texture, then blur/sharpen.

**Approach 2 — Texture → Wobble (reversed):**
Texture + blur/sharpen first, then wobble-displace the finished result.

**Approach 3 — Nested elements (rejected):**
Outer div gets wobble filter, inner div gets texture filter. Each operates independently.

**Approach 4 — Wobble + blur/sharpen only (rejected):**
No texture displacement, just wobble then blur/sharpen. Produced jagged edges.

### Approach 1 variants — wobble → texture (chained)

Base wobble: W8 (bf=0.03, octaves=5, scale=5)
Base texture: C11 chain (bf=3.0, octaves=3, blur 0.45–0.5, sharpen 5)

| ID   | tex scale | tex bf | tex octaves | blur σ | sharpen | Notes |
|------|-----------|--------|-------------|--------|---------|-------|
| A1c  | 1         | 3.0    | 3           | 0.5    | 5       | Not enough grain |
| A1d  | 0.5       | 3.0    | 3           | 0.5    | 5       | Too smooth |
| M1   | 1.5       | 3.0    | 3           | 0.5    | 5       | Good — starred |
| M2   | 1.75      | 3.0    | 3           | 0.5    | 5       | A bit more grain |
| M3   | 1.5       | 3.0    | 2           | 0.5    | 5       | Simpler grain (fewer octaves) |
| M4   | 1.5       | 2.0    | 3           | 0.5    | 5       | Larger grain features (lower freq) |
| M5   | 2         | 3.0    | 3           | 0.7    | 6       | Too blurry |
| M6   | 2         | 2.0    | 3           | 0.7    | 6       | Bigger grain + heavy blur/sharpen |

### Sprinkle approach — smooth base + selective detail

Key insight: blur/sharpen to smooth, then add texture back. Two methods:

**Arithmetic compositing** (`feComposite operator="arithmetic"`): blends smooth and textured versions at a fixed ratio. Uniform grain.

**Sparse mask compositing**: uses thresholded noise (`feColorMatrix` alpha threshold) to selectively show texture in patches.

| ID   | Method | smooth blur σ | smooth sharpen | tex scale | tex blur | blend ratio / mask | Notes |
|------|--------|---------------|----------------|-----------|----------|--------------------|-------|
| S3   | arith  | 0.6           | 6              | 2         | —        | 70/30              | Good but blurry |
| S4   | arith  | 0.6           | 6              | 2         | —        | 50/50              | Good but blurry |
| S7   | mask   | 0.6           | 6              | 1.5       | —        | sparse ~40%        | Interesting concept, too blurry |
| S7b  | mask   | 0.6           | 6              | 1.5       | —        | sparse + sharpen 5 | — |
| S7c  | mask   | 0.6           | 6              | 1.5       | —        | sparse + sharpen 7 | — |
| S7d  | mask   | 0.6           | 6              | 1.5       | —        | sparse + sharpen 9 | — |
| T1   | arith  | 0.4           | 5              | 2         | —        | 70/30              | — |
| T2   | arith  | 0.4           | 5              | 2         | —        | 60/40              | — |
| T3   | arith  | 0.4           | 5              | 2         | —        | 50/50              | — |
| T4   | arith  | 0.5           | 5              | 2         | —        | 60/40              | — |
| T5   | arith  | 0.5           | 5              | 2         | —        | 70/30              | — |
| T6   | re-tex | 0.4           | 5              | 1.0       | —        | smooth→re-displace | — |
| T7   | mask   | 0.4           | 5              | 1.5       | —        | sparse mask         | — |
| T8   | arith  | 0.4           | 5              | 2         | —        | k1=0.1, 55/35      | Nonlinear cross-multiply |
| **T9** | **arith** | **0.4** | **5**      | **2**     | **0.25** | **60/40**          | **Winner — soft grain via light blur on textured path** |

### Why T9 won

T9's key innovation: both paths get blur treatment. The smooth path gets heavy blur (0.4) + sharpen. The textured path gets a light blur (0.25) before blending — this softens the grain itself so it feels organic rather than pixelated, while preserving more detail than the S-series heavy blur. The 60/40 arithmetic blend gives enough texture to read as hand-drawn without being noisy.

---

## Final Filter: T9

```xml
<filter id="hand-drawn" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
  <!-- 1. Wobble: low-freq displacement for shape irregularity -->
  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" result="wobbleNoise" />
  <feDisplacementMap xChannelSelector="R" yChannelSelector="G" in="SourceGraphic" in2="wobbleNoise" scale="5" result="wobbled" />
  <!-- 2a. Smooth path: blur + sharpen -->
  <feGaussianBlur in="wobbled" stdDeviation="0.4" result="smooth" />
  <feConvolveMatrix in="smooth" order="3" kernelMatrix="0 -1 0  -1 5 -1  0 -1 0" result="smoothSharp" />
  <!-- 2b. Textured path: high-freq displacement + light blur -->
  <feTurbulence type="fractalNoise" baseFrequency="3.0" numOctaves="3" seed="77" result="texNoise" />
  <feDisplacementMap xChannelSelector="R" yChannelSelector="G" in="wobbled" in2="texNoise" scale="2" result="textured" />
  <feGaussianBlur in="textured" stdDeviation="0.25" result="texturedSoft" />
  <!-- 3. Arithmetic blend: 60% smooth + 40% textured -->
  <feComposite operator="arithmetic" k1="0" k2="0.6" k3="0.4" k4="0" in="smoothSharp" in2="texturedSoft" />
</filter>
```

---

## Animation

### Final implementation
- **5 frames**, each with a different `seed` value (1, 20, 42, 65, 88)
- Changing `seed` produces an entirely different noise field — the lines land in completely different positions each frame, like someone redrew the border from scratch
- **Duration: 2.25s** infinite cycle
- Filter transitions are discrete (snap, not interpolated) since `filter: url()` values can't be interpolated
- The jumpiness between unrelated seeds is intentional and looks good

### Rejected animation approaches
- Varying `baseFrequency` by tiny amounts (original CodePen approach) — too subtle, just stretches the same pattern
- 3 frames — felt too repetitive
- 1s duration — too jittery
- 3s+ duration — too slow, lost the liveliness

---

## Architecture

### Files
- **`src/components/HandDrawnFilters.tsx`** — `<HandDrawnFilter>` component generates a single T9 filter chain with configurable `id` and `seed`. `<HandDrawnFilters>` renders the hidden SVG with 1 static + 5 animation frame filters. Placed once in root layout.
- **`src/styles/globals.css`** — Tailwind v4 utilities and keyframes

### Usage
```tsx
// Static hand-drawn border
<div className="border-2 border-charcoal hand-drawn" />

// Animated hand-drawn border
<div className="border-2 border-charcoal hand-drawn hand-drawn-animated" />

// With cn() and conditional animation
<div className={cn("border-2 border-charcoal hand-drawn", animate && "hand-drawn-animated")} />
```

### Tailwind utilities
- `hand-drawn` — applies `filter: url(#hand-drawn)` (static T9 filter)
- `hand-drawn-animated` — adds 2.25s infinite keyframe cycle across 5 seed variants

### CSS keyframes
```css
@keyframes hand-drawn-wiggle {
  0%, 100% { filter: url(#hand-drawn-f1); }
  20%      { filter: url(#hand-drawn-f2); }
  40%      { filter: url(#hand-drawn-f3); }
  60%      { filter: url(#hand-drawn-f4); }
  80%      { filter: url(#hand-drawn-f5); }
}
```
