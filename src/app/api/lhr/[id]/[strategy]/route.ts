import { loadRawLhr } from "@/analysis/lhr-store"

export const dynamic = "force-dynamic"
export const revalidate = 0

const ID_RE = /^[a-z0-9-]{8,64}$/i

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string; strategy: string }> },
) {
  const { id, strategy } = await ctx.params
  if (!ID_RE.test(id)) {
    return Response.json({ error: "bad_request" }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }
  if (strategy !== "mobile" && strategy !== "desktop") {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } })
  }
  const lhr = await loadRawLhr(id, strategy)
  if (!lhr) return new Response("Not found", { status: 404, headers: { "Cache-Control": "private, no-cache" } })
  return new Response(JSON.stringify(lhr, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="sweep-${id.slice(0, 8)}-${strategy}.lhr.json"`,
      "Cache-Control": "private, no-cache",
    },
  })
}
