import type { Report } from "@/analysis/types"
import { formatMs } from "@/analysis/pagespeed"

/** Štruktúrovaný PDF: skóre, kategórie, budget, top opportunities (PDF 1.4, bez deps). */
export function buildReportPdf(report: Report, strategy: "mobile" | "desktop"): Uint8Array {
  const d = report[strategy]
  const host = report.finalUrl.replace(/^https?:\/\//, "").slice(0, 72)
  const budget = report.budget
  const check = report.budgetResult[strategy]
  const cats = [
    ["Performance", d.score],
    ["Accessibility", d.categories.accessibility],
    ["Best Practices", d.categories.bestPractices],
    ["SEO", d.categories.seo],
  ] as const

  const page1: PdfOp[] = [
    { type: "text", size: 18, x: 50, y: 742, text: "Sweep lab report" },
    { type: "text", size: 10, x: 50, y: 722, text: host },
    {
      type: "text",
      size: 9,
      x: 50,
      y: 706,
      text: `${strategy.toUpperCase()}  ·  ${report.createdAt.slice(0, 19)}  ·  ${report.engine}`,
    },
    { type: "rule", x1: 50, y1: 694, x2: 562, y2: 694 },
    { type: "text", size: 12, x: 50, y: 670, text: `Performance score: ${d.score}/100` },
    { type: "bar", x: 50, y: 648, w: 200, h: 10, fill: Math.max(0, Math.min(1, d.score / 100)) },
  ]

  let y = 620
  page1.push({ type: "text", size: 11, x: 50, y, text: "Categories" })
  y -= 18
  for (const [label, value] of cats) {
    const v = value == null ? null : Math.max(0, Math.min(100, value))
    page1.push({
      type: "text",
      size: 9,
      x: 50,
      y,
      text: `${label}: ${v == null ? "—" : `${v}/100`}`,
    })
    if (v != null) {
      page1.push({ type: "bar", x: 200, y: y - 2, w: 160, h: 8, fill: v / 100 })
    }
    y -= 16
  }

  y -= 8
  page1.push({ type: "text", size: 11, x: 50, y, text: "Core Web Vitals (lab)" })
  y -= 16
  const metrics = [
    `LCP  ${d.lcp.display}`,
    `TBT  ${d.tbt.display}`,
    `CLS  ${d.cls.display}`,
    `FCP  ${d.fcp.display}`,
    `TTFB ${d.ttfb.display}`,
    `Transfer ${d.bytes} B · ${d.requests} requests`,
  ]
  for (const line of metrics) {
    page1.push({ type: "text", size: 9, x: 50, y, text: line })
    y -= 14
  }

  y -= 10
  page1.push({
    type: "text",
    size: 11,
    x: 50,
    y,
    text: `Budget: ${check.passed ? "PASS" : "FAIL"}`,
  })
  y -= 14
  page1.push({
    type: "text",
    size: 8,
    x: 50,
    y,
    text: `score >= ${budget.minScore}  ·  LCP <= ${formatMs(budget.maxLcpMs)}  ·  CLS <= ${budget.maxCls.toFixed(3)}  ·  TBT <= ${formatMs(budget.maxTbtMs)}`,
  })
  y -= 14
  for (const f of check.failures.slice(0, 6)) {
    page1.push({
      type: "text",
      size: 8,
      x: 50,
      y,
      text: `x ${f.label}: ${f.actual} (limit ${f.limit})`,
    })
    y -= 12
  }

  const page2: PdfOp[] = [
    { type: "text", size: 14, x: 50, y: 742, text: "Fix plan / opportunities" },
    { type: "rule", x1: 50, y1: 728, x2: 562, y2: 728 },
  ]
  let y2 = 708
  const ops = d.opportunities.slice(0, 10)
  if (!ops.length) {
    page2.push({ type: "text", size: 10, x: 50, y: y2, text: "No high-impact opportunities." })
  } else {
    for (let i = 0; i < ops.length; i++) {
      const o = ops[i]!
      const savings = o.displayValue ?? (o.savingsMs ? `${o.savingsMs} ms` : o.impact)
      page2.push({
        type: "text",
        size: 10,
        x: 50,
        y: y2,
        text: `${i + 1}. ${o.title.slice(0, 70)}`,
      })
      y2 -= 13
      page2.push({
        type: "text",
        size: 8,
        x: 62,
        y: y2,
        text: `Impact: ${o.impact}  ·  ${savings}`.slice(0, 90),
      })
      y2 -= 18
      if (y2 < 80) break
    }
  }

  y2 -= 8
  page2.push({ type: "text", size: 12, x: 50, y: y2, text: "Strengths" })
  y2 -= 16
  for (const s of d.strengths.slice(0, 6)) {
    page2.push({ type: "text", size: 9, x: 50, y: y2, text: `- ${s.title.slice(0, 80)}` })
    y2 -= 13
  }

  return encodeStructuredPdf([page1, page2])
}

type PdfOp =
  | { type: "text"; size: number; x: number; y: number; text: string }
  | { type: "rule"; x1: number; y1: number; x2: number; y2: number }
  | { type: "bar"; x: number; y: number; w: number; h: number; fill: number }

function encodeStructuredPdf(pages: PdfOp[][]): Uint8Array {
  const pageStreams = pages.map((ops) => buildPageStream(ops))
  const objects: string[] = []
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj")

  const kidRefs = pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")
  objects.push(`2 0 obj<< /Type /Pages /Kids [${kidRefs}] /Count ${pages.length} >>endobj`)

  const fontObjNum = 3 + pages.length * 2
  for (let i = 0; i < pages.length; i++) {
    const pageObj = 3 + i * 2
    const contentObj = pageObj + 1
    const stream = pageStreams[i]!
    objects.push(
      `${pageObj} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObj} 0 R /Resources<< /Font<< /F1 ${fontObjNum} 0 R >> >> >>endobj`,
    )
    objects.push(`${contentObj} 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj`)
  }
  objects.push(`${fontObjNum} 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj`)

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"))
    pdf += obj + "\n"
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8")
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return new TextEncoder().encode(pdf)
}

function buildPageStream(ops: PdfOp[]): string {
  const parts: string[] = []
  for (const op of ops) {
    if (op.type === "text") {
      parts.push("BT", `/F1 ${op.size} Tf`, `1 0 0 1 ${op.x} ${op.y} Tm`, `(${escapePdf(op.text)}) Tj`, "ET")
    } else if (op.type === "rule") {
      parts.push("0.6 w", `${op.x1} ${op.y1} m`, `${op.x2} ${op.y2} l`, "S")
    } else if (op.type === "bar") {
      const fillW = Math.max(0, op.w * op.fill)
      parts.push("0.85 g", `${op.x} ${op.y} ${op.w} ${op.h} re`, "f")
      parts.push("0.35 g", `${op.x} ${op.y} ${fillW} ${op.h} re`, "f", "0 g")
    }
  }
  return parts.join("\n")
}

function escapePdf(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "?")
}
