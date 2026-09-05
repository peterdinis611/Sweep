import { ImageResponse } from "next/og"
import { SITE_DESCRIPTION } from "@/config/site"

export const alt = "Sweep — laboratórne meranie rýchlosti webu"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
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
            inset: 40,
            border: "1px solid #d4cfc3",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "80px 88px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "#5c5a53" }}>
            <span>Sweep</span>
            <span>Laboratórium</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 820 }}>
            <span style={{ fontSize: 68, lineHeight: 0.95, letterSpacing: -2 }}>
              Rýchlosť webu, nameraná presne.
            </span>
            <span style={{ fontSize: 24, color: "#5c5a53", maxWidth: 620 }}>{SITE_DESCRIPTION}</span>
          </div>
          <div style={{ display: "flex", gap: 32, fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "#0a2458" }}>
            <span>LCP</span>
            <span>INP</span>
            <span>CLS</span>
            <span>Waterfall</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
