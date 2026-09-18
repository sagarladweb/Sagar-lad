import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sagar Lad — Author, Keynote Speaker & Data & AI Architect";
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
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "linear-gradient(145deg, #060b1e 0%, #0a1432 50%, #050814 100%)",
          color: "#f8fafc",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            display: "flex",
            background: "linear-gradient(90deg, #0d21a1 0%, #3b82f6 50%, #ffd51d 100%)",
          }}
        />

        {/* Decorative ambient background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(13, 33, 161, 0.35) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "200px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 213, 29, 0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top Header Row: Name & Tag */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #ffd51d 0%, #f59e0b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0a1432",
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              SL
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#ffd51d",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 800,
                display: "flex",
              }}
            >
              SAGAR LAD
            </div>
          </div>

          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: 9999,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "rgba(255, 255, 255, 0.06)",
              fontSize: 15,
              fontWeight: 600,
              color: "#e2e8f0",
              letterSpacing: "0.05em",
            }}
          >
            Official Website
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: 1040,
              color: "#ffffff",
              display: "flex",
              letterSpacing: "-0.02em",
            }}
          >
            MIND UP — Change Your Mind, Change Your Life
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#94a3b8",
              marginTop: 18,
              letterSpacing: "0.02em",
              display: "flex",
            }}
          >
            Published Author · Keynote &amp; TEDx Speaker · Data &amp; AI Architect
          </div>
        </div>

        {/* Footer / Domain Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20 }}>
          <div
            style={{
              fontSize: 16,
              color: "#64748b",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "flex",
            }}
          >
            Books · Speaking · Frameworks · Mentorship
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#ffd51d",
              fontWeight: 700,
              letterSpacing: "0.08em",
              display: "flex",
            }}
          >
            sagarlad.com
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            display: "flex",
            background: "linear-gradient(90deg, #ffd51d 0%, #3b82f6 50%, #0d21a1 100%)",
          }}
        />
      </div>
    ),
    size
  );
}

