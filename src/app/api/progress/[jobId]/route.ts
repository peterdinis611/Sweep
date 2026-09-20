import { getJobProgress } from "@/analysis/progress"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await ctx.params
  if (!jobId || jobId.length > 80) {
    return Response.json({ progress: null }, { status: 400 })
  }
  return Response.json({ progress: getJobProgress(jobId) })
}
