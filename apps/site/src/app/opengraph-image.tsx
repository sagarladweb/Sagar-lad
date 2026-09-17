import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Sagar Lad — Author & Public Speaker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: "#0e0e10",
          color: "#f5f4f0",
        }}
      >
        {/* Subtle accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #0d21a1, #ffd51d)",
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 26,
                color: "#ffd51d",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Sagar Lad
            </div>
            <div
              style={{
                fontSize: 60,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: 900,
                marginTop: 12,
              }}
            >
              MIND UP — Change Your{" "}
              <span style={{ color: "#ffd51d" }}>MIND</span>, Change Your{" "}
              <span style={{ color: "#ffd51d" }}>LIFE</span>
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#9a998f",
                marginTop: 20,
                letterSpacing: "0.05em",
              }}
            >
              Author • Speaker • Human Potential Advocate
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #ffd51d, #0d21a1)",
          }}
        />
      </div>
    ),
    size
  );
}
