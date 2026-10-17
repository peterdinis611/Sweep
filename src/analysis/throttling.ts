import type { ThrottlePreset } from "@/analysis/types"

/** Lighthouse throttling profiles (applied to mobile; desktop keeps its form factor). */
export function throttlingFor(preset: ThrottlePreset) {
  switch (preset) {
    case "slow4g":
      return {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 150 * 3.75,
        downloadThroughputKbps: (1.6 * 1024) / 8,
        uploadThroughputKbps: (750 * 1024) / 8 / 8,
      }
    case "cable":
      return {
        rttMs: 28,
        throughputKbps: 40 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      }
    case "unthrottled":
      return {
        rttMs: 0,
        throughputKbps: 0,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      }
    case "mobileDefault":
    default:
      // Lighthouse mobile default (approx Simulated Slow 4G)
      return {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 150 * 3.75,
        downloadThroughputKbps: (1.6 * 1024) / 8,
        uploadThroughputKbps: (750 * 1024) / 8 / 8,
      }
  }
}

export function desktopThrottlingFor(preset: ThrottlePreset) {
  if (preset === "unthrottled") {
    return {
      rttMs: 0,
      throughputKbps: 0,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    }
  }
  if (preset === "slow4g") {
    return {
      rttMs: 150,
      throughputKbps: 1.6 * 1024,
      cpuSlowdownMultiplier: 2,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    }
  }
  // cable + mobileDefault desktop: LH desktop defaults
  return {
    rttMs: 40,
    throughputKbps: 10 * 1024,
    cpuSlowdownMultiplier: 1,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
  }
}
