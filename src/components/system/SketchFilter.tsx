import { createElement } from "react";
import { FILTER_COLOR_SPACE, sketchFilters } from "@/components/system/filters";

// The shared filter defs the sketch, ink and boil utilities point at
export function SketchFilter() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute"
      style={{ width: 0, height: 0 }}
    >
      <defs>
        {sketchFilters.map(({ id, region, steps }) => (
          <filter key={id} id={id} {...region} filterUnits="objectBoundingBox" {...FILTER_COLOR_SPACE}>
            {steps.map((step, i) => createElement(step.tag, { key: i, ...step.attrs }))}
          </filter>
        ))}
      </defs>
    </svg>
  );
}
