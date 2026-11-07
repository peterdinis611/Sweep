import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
  type HandleServerErrorFn,
} from "next-safe-action"
import { JobCancelledError, QueueFullError } from "@/analysis/queue"
import { RateLimitError } from "@/server/rate-limit"

const handleServerError: HandleServerErrorFn = (error) => {
  console.error("[sweep]", error)

  if (
    error instanceof RateLimitError ||
    error instanceof QueueFullError ||
    error instanceof JobCancelledError
  ) {
    return error.message
  }

  // Intentional short UX throws from the analysis layer (SSRF, timeouts, missing Chrome, …).
  if (error.message.length > 0 && error.message.length < 280) {
    return error.message
  }

  return DEFAULT_SERVER_ERROR_MESSAGE
}

export const actionClient = createSafeActionClient({
  handleServerError,
})
