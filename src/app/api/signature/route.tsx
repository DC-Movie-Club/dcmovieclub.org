import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

// TODO: Replace Libre Baskerville with the actual font used in the Canva signature
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "Member Name";
  const title = searchParams.get("title") ?? "Member";

  const [serifFontData, logoData] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/libre-baskerville.ttf")),
    readFile(join(process.cwd(), "public/images/dcmc-logo.png")),
  ]);

  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          padding: "20px 30px",
          fontFamily: "Libre Baskerville",
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={120}
          height={120}
          style={{ objectFit: "contain" }}
          alt="DC Movie Club"
        />

        {/* Divider */}
        <div
          style={{
            width: "2px",
            height: "100px",
            backgroundColor: "#444",
            marginLeft: "20px",
            marginRight: "20px",
            flexShrink: 0,
          }}
        />

        {/* Right content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "#2a2a2a",
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#555",
              marginTop: "4px",
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Social Icons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            {/* Instagram */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                stroke="#8b2020"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="5"
                stroke="#8b2020"
                strokeWidth="2"
              />
              <circle cx="17.5" cy="6.5" r="1.5" fill="#8b2020" />
            </svg>

            {/* Letterboxd */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="8" cy="12" r="5" fill="#8b2020" />
              <circle
                cx="12"
                cy="12"
                r="5"
                fill="#8b2020"
                opacity="0.65"
              />
              <circle
                cx="16"
                cy="12"
                r="5"
                fill="#8b2020"
                opacity="0.35"
              />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      width: 480,
      height: 170,
      fonts: [
        {
          name: "Libre Baskerville",
          data: serifFontData,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=604800, immutable",
      },
    },
  );
}
