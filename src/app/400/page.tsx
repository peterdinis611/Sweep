import type { Metadata } from "next"
import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { FaultScreen } from "@/components/fault-screen"
import { Button, buttonStyles } from "@/components/ui/button"
import { colors } from "@/styles/tokens.stylex"

export const metadata: Metadata = {
  title: "Bad request",
  description: "The request was malformed or the identifier is invalid.",
  robots: { index: false, follow: false },
}

const styles = stylex.create({
  emAccent: {
    color: colors.accent,
    fontStyle: "italic",
  },
})

export default async function BadRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const body =
    reason === "invalid-id"
      ? "Identifikátor reportu alebo crawlu nie je v platnom formáte (očakávam 8–64 znakov: a–z, 0–9, pomlčka)."
      : "Požiadavka je neplatná alebo neúplná. Skontroluj URL a skús to znova."

  return (
    <FaultScreen
      code="400"
      kicker="Neplatná požiadavka"
      title={
        <>
          Signál je <em {...stylex.props(styles.emAccent)}>poškodený.</em>
        </>
      }
      body={body}
      actions={
        <Button nativeButton={false} render={<Link href="/" />} style={buttonStyles.roundedNone}>
          Domov
        </Button>
      }
    />
  )
}
