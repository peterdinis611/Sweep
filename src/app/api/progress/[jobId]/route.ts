import { getJobProgress } from "@/analysis/progress"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_STORE = { "Cache-Control": "no-store, max-age=0" }

export async function GET(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await ctx.params
  if (!jobId || jobId.length > 80 || !/^[a-z0-9-]{8,80}$/i.test(jobId)) {
    return Response.json({ progress: null, error: "bad_request" }, { status: 400, headers: NO_STORE })
  }
  return Response.json({ progress: getJobProgress(jobId) }, { headers: NO_STORE })
}
