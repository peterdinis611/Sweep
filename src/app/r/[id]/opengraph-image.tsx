import { ImageResponse } from "next/og"
import { loadReport } from "@/analysis/store"

export const alt = "Sweep report"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const runtime = "nodejs"

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await loadReport(id)
  if (!report) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f4f1ea",
            color: "#5c5a53",
            fontSize: 42,
          }}
        >
          Report sa nenašiel
        </div>
      ),
      { ...size },
    )
  }

  const host = report.finalUrl.replace(/^https?:\/\//, "").slice(0, 48)
  const mobile = report.mobile.score
  const desktop = report.desktop.score
  const pass = report.budgetResult.mobile.passed && report.budgetResult.desktop.passed
  const accent = scoreColor(Math.min(mobile, desktop))

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4f1ea",
          color: "#12141a",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            border: "1px solid #d4cfc3",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#5c5a53",
            }}
          >
            <span>Sweep</span>
            <span style={{ color: pass ? "#1b6a42" : "#9e2b1e" }}>{pass ? "Budget PASS" : "Budget FAIL"}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
            <span style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#5c5a53" }}>
              Laboratórny odpočet
            </span>
            <span style={{ fontSize: 54, lineHeight: 1, letterSpacing: -1.5 }}>{host}</span>
          </div>

          <div style={{ display: "flex", gap: 48, alignItems: "flex-end" }}>
            <ScoreBlock label="Mobil" score={mobile} color={accent} />
            <ScoreBlock label="Desktop" score={desktop} color={scoreColor(desktop)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 24 }}>
              <span style={{ fontSize: 16, color: "#5c5a53", letterSpacing: 2, textTransform: "uppercase" }}>
                LCP mobil
              </span>
              <span style={{ fontSize: 36, color: accent }}>{report.mobile.lcp.display}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}

function ScoreBlock({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 16, color: "#5c5a53", letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 72, lineHeight: 1, color, letterSpacing: -2 }}>{score}</span>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 90) return "#1b6a42"
  if (score >= 50) return "#9a5b12"
  return "#9e2b1e"
}
