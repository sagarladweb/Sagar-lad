import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "Mind Up Explorer";
  const overall = searchParams.get("score") || "78";
  const status = (searchParams.get("status") || "Explorer").toUpperCase();
  const m = searchParams.get("m") || "80";
  const i = searchParams.get("i") || "75";
  const n = searchParams.get("n") || "70";
  const d = searchParams.get("d") || "85";
  const u = searchParams.get("u") || "78";
  const p = searchParams.get("p") || "82";

  const pillarsData = [
    { id: "M", title: "Master Your Mind", score: m },
    { id: "I", title: "Invest in Health", score: i },
    { id: "N", title: "Nurture Relationships", score: n },
    { id: "D", title: "Develop Skills & Work", score: d },
    { id: "U", title: "Unlock Yourself", score: u },
    { id: "P", title: "Progress Daily", score: p },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0b2860", // Layer 1: Outer Blue
          padding: 12,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundColor: "#ffd51d", // Layer 2: Middle Yellow
            padding: 8,
            borderRadius: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              backgroundColor: "#0b2860", // Layer 3: Inner Blue
              padding: 8,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ffffff", // Pure White Certificate Paper
                borderRadius: 8,
                padding: "24px 36px",
                position: "relative",
              }}
            >
              {/* Top Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {/* Brand */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#0b2860", letterSpacing: "-0.02em" }}>
                    SAGAR LAD
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#71809b", letterSpacing: "0.15em" }}>
                    OFFICIAL ASSESSMENT
                  </span>
                </div>

                {/* Center Title */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#0b2860", letterSpacing: "-0.01em" }}>
                    MIND UP™
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#2454d9", letterSpacing: "0.22em" }}>
                    PERSONAL GROWTH ASSESSMENT
                  </span>
                </div>

                {/* Explorer Seal */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fffbe6",
                    border: "2px solid #ffd51d",
                    borderRadius: 9999,
                    padding: "6px 16px 6px 8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#ffd51d",
                      color: "#0b2860",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 900,
                      marginRight: 8,
                    }}
                  >
                    ★
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#0b2860" }}>EXPLORER</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#2454d9" }}>VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Certificate of Completion Header */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#2454d9",
                    letterSpacing: "0.22em",
                  }}
                >
                  C E R T I F I C A T E  O F  C O M P L E T I O N
                </span>
                <span style={{ fontSize: 13, color: "#71809b", marginTop: 4 }}>
                  Proudly presented to
                </span>
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    color: "#0b2860",
                    fontFamily: "serif",
                    marginTop: 2,
                  }}
                >
                  {name.slice(0, 28)}
                </span>
                <div
                  style={{
                    width: 280,
                    height: 3,
                    backgroundColor: "#ffd51d",
                    marginTop: 2,
                    marginBottom: 6,
                  }}
                />
              </div>

              {/* Main Score Row */}
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  gap: 16,
                  marginTop: 8,
                }}
              >
                {/* Overall Score Box */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 250,
                    backgroundColor: "#0b2860",
                    borderRadius: 14,
                    padding: "16px 12px",
                    border: "2px solid #ffd51d",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#ffd51d", letterSpacing: "0.15em" }}>
                    OVERALL MIND UP SCORE
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", marginTop: 4 }}>
                    <span style={{ fontSize: 62, fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>
                      {overall}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginLeft: 4 }}>
                      /100
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: "#ffd51d",
                      borderRadius: 9999,
                      padding: "4px 16px",
                      marginTop: 8,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#0b2860" }}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* 6 Pillars 3x2 Grid */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    gap: 10,
                  }}
                >
                  {pillarsData.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "31%",
                        backgroundColor: "#f8fbff",
                        border: "1px solid #e2e8f0",
                        borderTop: "3px solid #ffd51d",
                        borderRadius: 10,
                        padding: "8px 6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: "#0b2860",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {p.id}
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 900, color: "#0b2860" }}>
                          {p.score}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#5b6a88", marginTop: 2 }}>
                        {p.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  marginTop: "auto",
                  paddingTop: 10,
                  borderTop: "1px solid #ffd51d",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0b2860" }}>
                  Verified Assessment · Sagar Lad MIND UP™
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2454d9" }}>
                  sagarlad.com/mindup-score
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
