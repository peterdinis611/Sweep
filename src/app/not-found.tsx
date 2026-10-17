import type { Metadata } from "next"
import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { FaultScreen } from "@/components/fault-screen"
import { Button, buttonStyles } from "@/components/ui/button"
import { colors } from "@/styles/tokens.stylex"

export const metadata: Metadata = {
  title: "Page not found",
  description: "This address does not exist in the Sweep lab.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "404 · Sweep",
    description: "This address does not exist in the Sweep lab.",
  },
}

const styles = stylex.create({
  emAccent: {
    color: colors.accent,
    fontStyle: "italic",
  },
})

export default function NotFound() {
  return (
    <FaultScreen
      code="404"
      kicker="Stopa prerušená"
      title={
        <>
          Táto adresa v laboratóriu <em {...stylex.props(styles.emAccent)}>nie je.</em>
        </>
      }
      body="Meranie mohlo vypršať, odkaz nie je platný, alebo stránka nikdy neexistovala."
      actions={
        <Button nativeButton={false} render={<Link href="/" data-testid="fault-home-link" />} style={buttonStyles.roundedNone}>
          Nové meranie
        </Button>
      }
    />
  )
}
