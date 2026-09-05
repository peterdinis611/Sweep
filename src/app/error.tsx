"use client"

import { useEffect } from "react"
import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { FaultScreen } from "@/components/fault-screen"
import { Button, buttonStyles } from "@/components/ui/button"
import { colors, fonts } from "@/styles/tokens.stylex"
import { common } from "@/styles/common.stylex"

const styles = stylex.create({
  emBad: {
    color: colors.bad,
    fontStyle: "italic",
  },
  digest: {
    marginTop: "1rem",
    fontFamily: fonts.mono,
    fontSize: "0.75rem",
    color: colors.muted,
    animationDelay: "180ms",
  },
})

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <FaultScreen
      code="500"
      kicker="Porucha merania"
      tone="bad"
      title={
        <>
          Laboratórium <em {...stylex.props(styles.emBad)}>zlyhalo.</em>
        </>
      }
      body="Pri vykreslení sa niečo pokazilo. Skús obnoviť odpočet, alebo začni nové meranie."
      detail={
        error.digest ? (
          <p {...stylex.props(common.reveal, styles.digest)}>lístok {error.digest}</p>
        ) : null
      }
      actions={
        <>
          <Button type="button" onClick={() => retry()} style={buttonStyles.roundedNone}>
            Skúsiť znova
          </Button>
          <Button nativeButton={false} variant="ghost" render={<Link href="/" />} style={buttonStyles.roundedNone}>
            Domov
          </Button>
        </>
      }
    />
  )
}
