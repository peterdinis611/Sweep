"use client"

import { useEffect } from "react"
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import * as stylex from "@stylexjs/stylex"
import { Button, buttonStyles } from "@/components/ui/button"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"
import "./globals.css"

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
})

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
})

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
})

const styles = stylex.create({
  html: {
    height: "100%",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  body: {
    display: "flex",
    minHeight: "100%",
    flexDirection: "column",
    fontFamily: fonts.body,
  },
  shell: {
    position: "relative",
    zIndex: 1,
    marginInline: "auto",
    display: "flex",
    width: "100%",
    maxWidth: "72rem",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    flexDirection: "column",
    paddingInline: "1.25rem",
    "@media (min-width: 640px)": {
      paddingInline: "2rem",
    },
  },
  header: {
    paddingBlock: "1.25rem",
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: "1.65rem",
    lineHeight: 1,
    letterSpacing: "-0.025em",
  },
  section: {
    position: "relative",
    overflow: "hidden",
    paddingTop: "2.5rem",
  },
  title: {
    marginTop: "1.25rem",
    maxWidth: "36rem",
    fontFamily: fonts.display,
    fontSize: "3rem",
    fontWeight: 500,
    lineHeight: 0.95,
  },
  emBad: {
    color: colors.bad,
    fontStyle: "italic",
  },
  bodyText: {
    marginTop: "1.25rem",
    maxWidth: "28rem",
    color: colors.muted,
  },
  digest: {
    marginTop: "1rem",
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    color: colors.muted,
  },
  retry: {
    marginTop: "2rem",
  },
})

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const htmlSx = stylex.props(styles.html)
  return (
    <html
      lang="sk"
      className={[display.variable, body.variable, mono.variable, htmlSx.className].filter(Boolean).join(" ")}
      style={htmlSx.style}
    >
      <head>
        <title>Porucha · Sweep</title>
        <meta name="robots" content="noindex, nofollow" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('sweep-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body {...stylex.props(styles.body)}>
        <div {...stylex.props(styles.shell)}>
          <header {...stylex.props(styles.header)}>
            <p {...stylex.props(styles.brand)}>Sweep</p>
          </header>
          <section {...stylex.props(styles.section)}>
            <p {...stylex.props(common.kicker)}>Kritická porucha</p>
            <h1 {...stylex.props(styles.title)}>
              Aplikácia <em {...stylex.props(styles.emBad)}>spadla.</em>
            </h1>
            <p {...stylex.props(styles.bodyText)}>
              Root layout sa nepodarilo vykresliť. Obnov odpočet. Ak to pretrváva, reštartuj vývojový server.
            </p>
            {error.digest ? <p {...stylex.props(styles.digest)}>lístok {error.digest}</p> : null}
            <div {...stylex.props(styles.retry)}>
              <Button type="button" onClick={() => retry()}>
                Skúsiť znova
              </Button>
            </div>
          </section>
        </div>
      </body>
    </html>
  )
}
