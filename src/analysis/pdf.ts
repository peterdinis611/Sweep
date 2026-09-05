import type { Report } from "@/analysis/types"

/** Jednoduchý textový PDF (bez externých závislostí) — platný PDF 1.4. */
export function buildReportPdf(report: Report, strategy: "mobile" | "desktop"): Uint8Array {
  const d = report[strategy]
  const host = report.finalUrl.replace(/^https?:\/\//, "")
  const lines = [
    "Sweep · laboratórny odpočet",
    host,
    `Stratégia: ${strategy}`,
    `Dátum: ${report.createdAt}`,
    `Engine: ${report.engine}`,
    "",
    `Performance: ${d.score}/100`,
    `Accessibility: ${fmtCat(d.categories.accessibility)}`,
    `Best Practices: ${fmtCat(d.categories.bestPractices)}`,
    `SEO: ${fmtCat(d.categories.seo)}`,
    "",
    `LCP: ${d.lcp.display}`,
    `TBT: ${d.tbt.display}`,
    `CLS: ${d.cls.display}`,
    `FCP: ${d.fcp.display}`,
    `TTFB: ${d.ttfb.display}`,
    `Prenos: ${d.bytes} B · ${d.requests} requestov`,
    "",
    `Budget: ${report.budgetResult[strategy].passed ? "PASS" : "FAIL"}`,
    `  minScore ≥ ${report.budget.minScore}`,
    `  maxLCP ≤ ${report.budget.maxLcpMs} ms`,
    ...report.budgetResult[strategy].failures.map((f) => `  ✗ ${f.label}: ${f.actual} (limit ${f.limit})`),
    "",
    "Fix plan / opportunities:",
    ...d.opportunities.slice(0, 12).map((o, i) => `${i + 1}. ${o.title} (${o.displayValue ?? `${o.savingsMs} ms`})`),
    "",
    "Strengths:",
    ...d.strengths.slice(0, 8).map((s, i) => `${i + 1}. ${s.title}`),
  ]

  return encodePdf(lines)
}

function fmtCat(n: number | null) {
  return n == null ? "—" : `${n}/100`
}

function encodePdf(lines: string[]): Uint8Array {
  const escaped = lines.map((l) => escapePdf(l.slice(0, 110)))
  const contentLines = [
    "BT",
    "/F1 11 Tf",
    "50 780 Td",
    "14 TL",
    ...escaped.flatMap((l, i) => (i === 0 ? [`(${l}) Tj`] : ["T*", `(${l}) Tj`])),
    "ET",
  ]
  const stream = contentLines.join("\n")
  const objects: string[] = []
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj")
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj")
  objects.push(
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj",
  )
  objects.push(`4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj`)
  objects.push("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj")

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

function escapePdf(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "?")
}
