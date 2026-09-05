import type { WaterfallItem } from "@/analysis/types"
import { formatBytes, shortUrl } from "@/analysis/pagespeed"
import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const TYPE_COLOR: Record<string, string> = {
  Document: "var(--accent)",
  Script: "var(--warn)",
  Stylesheet: "#3d6a9a",
  Image: "var(--good)",
  Font: "#7a6a4a",
  XHR: "var(--muted)",
  Fetch: "var(--muted)",
  Other: "var(--muted)",
}

const styles = stylex.create({
  empty: {
    fontFamily: fonts.mono,
    fontSize: "0.875rem",
    color: colors.muted,
  },
  root: {
    overflowX: "auto",
  },
  legend: {
    marginBottom: "1.25rem",
    display: "flex",
    flexWrap: "wrap",
    columnGap: "1.25rem",
    rowGap: "0.5rem",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: colors.muted,
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
  },
  swatch: {
    width: "0.375rem",
    height: "0.375rem",
  },
  chart: {
    minWidth: 680,
  },
  axis: {
    marginBottom: "0.5rem",
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.muted,
  },
  labelCol: {
    width: "13rem",
    flexShrink: 0,
  },
  axisTrack: {
    position: "relative",
    height: "1rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  },
  tick: {
    position: "absolute",
    transform: "translateX(-50%)",
  },
  list: {
    listStyleType: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  url: {
    width: "13rem",
    flexShrink: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
  },
  barTrack: {
    position: "relative",
    height: "0.625rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    overflow: "hidden",
    backgroundColor: "color-mix(in oklab, var(--line) 40%, transparent)",
  },
  bar: {
    position: "absolute",
    top: 0,
    height: "100%",
  },
})

export function Waterfall({ items }: { items: WaterfallItem[] }) {
  if (!items.length) {
    return <p {...stylex.props(styles.empty)}>Waterfall v tomto behu nie je dostupný.</p>
  }
  const max = Math.max(...items.map((i) => i.start + i.duration), 1)
  const scale = Math.max(1, Math.ceil(max / 1000))

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.legend)}>
        {Object.entries(TYPE_COLOR).map(([k, c]) => (
          <span key={k} {...stylex.props(styles.legendItem)}>
            <i {...stylex.props(styles.swatch)} style={{ background: c }} />
            {k}
          </span>
        ))}
      </div>
      <div {...stylex.props(styles.chart)}>
        <div {...stylex.props(styles.axis)}>
          <span {...stylex.props(styles.labelCol)}>Request</span>
          <span {...stylex.props(styles.axisTrack)}>
            {Array.from({ length: scale + 1 }, (_, i) => (
              <span key={i} {...stylex.props(styles.tick)} style={{ left: `${(i / scale) * 100}%` }}>
                {i}s
              </span>
            ))}
          </span>
        </div>
        <ul {...stylex.props(styles.list)}>
          {items.map((item, idx) => {
            const left = (item.start / max) * 100
            const width = Math.max(0.7, (item.duration / max) * 100)
            const color = TYPE_COLOR[item.type] ?? TYPE_COLOR.Other
            return (
              <li key={`${item.url}-${idx}`} {...stylex.props(styles.row)}>
                <span {...stylex.props(styles.url)} title={item.url}>
                  {shortUrl(item.url)}
                </span>
                <div {...stylex.props(styles.barTrack)}>
                  <span
                    {...stylex.props(styles.bar)}
                    style={{ left: `${left}%`, width: `${width}%`, background: color }}
                    title={`${Math.round(item.duration)} ms · ${formatBytes(item.transferSize)} · ${item.status || "—"}`}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
