import { createSafeActionClient } from "next-safe-action"

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("[sweep]", error)
    if (error instanceof Error && error.message.length > 0 && error.message.length < 280) {
      return error.message
    }
    return "Analýza zlyhala. Skús to znova."
  },
})
