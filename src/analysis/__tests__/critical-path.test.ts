import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { extractCriticalPath, median, spread } from "../critical-path"

describe("median / spread", () => {
  it("handles empty and odd/even lists", () => {
    assert.equal(median([]), 0)
    assert.equal(median([3]), 3)
    assert.equal(median([1, 3, 5]), 3)
    assert.equal(median([1, 2, 3, 4]), 2.5)
  })

  it("computes spread", () => {
    assert.equal(spread([]), 0)
    assert.equal(spread([4]), 0)
    assert.equal(spread([1, 9, 3]), 8)
  })
})

describe("extractCriticalPath", () => {
  it("reads LCP element and critical request chain", () => {
    const path = extractCriticalPath({
      "largest-contentful-paint-element": {
        details: {
          items: [{ node: { snippet: "<img src='/hero.jpg'>" } }],
        },
      },
      "critical-request-chains": {
        details: {
          chains: {
            a: {
              request: {
                url: "https://example.com/",
                startTime: 0.01,
                endTime: 0.05,
                transferSize: 1200,
                resourceType: "Document",
              },
              children: {
                b: {
                  request: {
                    url: "https://example.com/hero.jpg",
                    startTime: 0.06,
                    endTime: 0.2,
                    transferSize: 80_000,
                    resourceType: "Image",
                  },
                },
              },
            },
          },
        },
      },
    })
    assert.equal(path.lcpElement, "<img src='/hero.jpg'>")
    assert.equal(path.requests.length, 2)
    assert.equal(path.requests[1]?.url, "https://example.com/hero.jpg")
    assert.ok((path.requests[1]?.duration ?? 0) > 0)
  })

  it("falls back to network-requests by transfer size", () => {
    const path = extractCriticalPath({
      "network-requests": {
        details: {
          items: [
            { url: "https://cdn.example/a.js", transferSize: 10_000, resourceType: "Script" },
            { url: "https://cdn.example/b.css", transferSize: 50_000, resourceType: "Stylesheet" },
            { url: "", transferSize: 99_000 },
          ],
        },
      },
    })
    assert.equal(path.requests[0]?.url, "https://cdn.example/b.css")
    assert.equal(path.requests.length, 2)
  })
})
