/** Homepage demo buttons — on in development unless explicitly disabled. */
export function demosEnabled() {
  const v = process.env.SWEEP_ALLOW_DEMO?.trim().toLowerCase()
  if (v === "1" || v === "true") return true
  if (v === "0" || v === "false") return false
  return process.env.NODE_ENV !== "production"
}
