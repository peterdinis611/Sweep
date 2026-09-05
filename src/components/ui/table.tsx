import * as stylex from "@stylexjs/stylex"
import { colors, fonts } from "@/styles/tokens.stylex"

const styles = stylex.create({
  container: {
    position: "relative",
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    captionSide: "bottom",
    fontSize: "0.875rem",
    borderCollapse: "collapse",
  },
  footer: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    backgroundColor: colors.secondary,
    fontWeight: 500,
  },
  row: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.line,
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "color-mix(in oklab, var(--bg) 40%, transparent)",
    },
  },
  rowPlain: {
    borderTopWidth: 0,
    ":hover": {
      backgroundColor: "transparent",
    },
  },
  head: {
    height: "2.5rem",
    paddingInline: "1.25rem",
    textAlign: "left",
    verticalAlign: "middle",
    fontFamily: fonts.mono,
    fontSize: "0.62rem",
    fontWeight: 500,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: colors.muted,
  },
  cell: {
    paddingInline: "1.25rem",
    paddingBlock: "0.75rem",
    verticalAlign: "middle",
  },
  caption: {
    marginTop: "0.75rem",
    fontSize: "0.875rem",
    color: colors.muted,
  },
  cellMuted: {
    color: colors.muted,
  },
  cellStrong: {
    fontWeight: 500,
    fontFeatureSettings: '"tnum"',
  },
})

function Table({
  style,
  ...props
}: Omit<React.ComponentProps<"table">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return (
    <div data-slot="table-container" {...stylex.props(styles.container)}>
      <table data-slot="table" {...props} {...stylex.props(styles.table, style)} />
    </div>
  )
}

function TableHeader({
  style,
  ...props
}: Omit<React.ComponentProps<"thead">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <thead data-slot="table-header" {...props} {...stylex.props(style)} />
}

function TableBody({
  style,
  ...props
}: Omit<React.ComponentProps<"tbody">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <tbody data-slot="table-body" {...props} {...stylex.props(style)} />
}

function TableFooter({
  style,
  ...props
}: Omit<React.ComponentProps<"tfoot">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <tfoot data-slot="table-footer" {...props} {...stylex.props(styles.footer, style)} />
}

function TableRow({
  style,
  ...props
}: Omit<React.ComponentProps<"tr">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <tr data-slot="table-row" {...props} {...stylex.props(styles.row, style)} />
}

function TableHead({
  style,
  ...props
}: Omit<React.ComponentProps<"th">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <th data-slot="table-head" {...props} {...stylex.props(styles.head, style)} />
}

function TableCell({
  style,
  ...props
}: Omit<React.ComponentProps<"td">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <td data-slot="table-cell" {...props} {...stylex.props(styles.cell, style)} />
}

function TableCaption({
  style,
  ...props
}: Omit<React.ComponentProps<"caption">, "className" | "style"> & {
  style?: stylex.StyleXStyles
}) {
  return <caption data-slot="table-caption" {...props} {...stylex.props(styles.caption, style)} />
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  styles as tableStyles,
}
