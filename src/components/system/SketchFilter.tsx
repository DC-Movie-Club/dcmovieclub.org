import { filterMarkup, sketchFilters } from "@/components/system/filters";

// The shared filter defs the sketch, ink and boil utilities point at. Written
// as markup because React doesn't render the SMIL <animate> that re-rolls the
// animated filters' noise.
export function SketchFilter() {
  const svg = `<svg aria-hidden="true" class="pointer-events-none absolute" style="width:0;height:0">
    <defs>
      ${sketchFilters.map(filterMarkup).join("\n      ")}
    </defs>
  </svg>`;

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
