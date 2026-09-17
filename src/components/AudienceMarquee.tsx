type AudienceRow = {
  key: string;
  src: string;
  width: number;
  height: number;
  // How much of the row's bottom to clip so every row's seat-back tops sit on
  // the same line (the rows are drawn at slightly different seat heights)
  overhang: number;
};

const AUDIENCE_ROWS: Record<string, AudienceRow> = {
  row1: { key: "row1", src: "/images/audience/row-1.svg", width: 660.82, height: 256.02, overhang: 7.5 },
  row2: { key: "row2", src: "/images/audience/row-2.svg", width: 676, height: 243.49, overhang: 31.5 },
  row3: { key: "row3", src: "/images/audience/row-3.svg", width: 671.17, height: 248.31, overhang: 32 },
  row4: { key: "row4", src: "/images/audience/row-4.svg", width: 667.8, height: 269.61, overhang: 99.5 },
  row5: { key: "row5", src: "/images/audience/row-5.svg", width: 684.36, height: 454.56, overhang: 182.5 },
};

function RowSet() {
  return (
    <div className="flex shrink-0 items-end">
      {Object.values(AUDIENCE_ROWS).map((row) => (
        <div
          key={row.key}
          className="mr-[calc(12px*var(--seat-scale))] shrink-0 bg-current [mask-repeat:no-repeat] [mask-size:100%_100%]"
          style={{
            width: `calc(${row.width}px * var(--seat-scale))`,
            aspectRatio: `${row.width} / ${row.height}`,
            marginBottom: `calc(${-row.overhang}px * var(--seat-scale))`,
            maskImage: `url(${row.src})`,
            WebkitMaskImage: `url(${row.src})`,
          }}
        />
      ))}
    </div>
  );
}

export function AudienceMarquee() {
  return (
    <div
      aria-hidden
      className="h-[calc(280px*var(--seat-scale))] w-full overflow-hidden text-teal/45 [mask-image:linear-gradient(to_bottom,black_50%,transparent)] [--seat-scale:0.4] sm:[--seat-scale:0.55]"
    >
      {/* Two identical sets so translating by -50% loops seamlessly */}
      <div className="flex h-full w-max items-end animate-marquee motion-reduce:animate-none">
        <RowSet />
        <RowSet />
      </div>
    </div>
  );
}
