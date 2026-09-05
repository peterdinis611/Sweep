import Link from "next/link"
import * as stylex from "@stylexjs/stylex"
import { FaultScreen } from "@/components/fault-screen"
import { Button, buttonStyles } from "@/components/ui/button"
import { colors } from "@/styles/tokens.stylex"

const styles = stylex.create({
  emAccent: {
    color: colors.accent,
    fontStyle: "italic",
  },
})

export default function ReportNotFound() {
  return (
    <FaultScreen
      code="404"
      kicker="Report chýba"
      title={
        <>
          Meranie sa <em {...stylex.props(styles.emAccent)}>nenašlo.</em>
        </>
      }
      body="Odkaz môže byť starý, identifikátor neplatný, alebo sa report už nezachoval na tomto stroji."
      actions={
        <Button
          nativeButton={false}
          render={<Link href="/" data-testid="fault-home-link" />}
          style={buttonStyles.roundedNone}
        >
          Nové meranie
        </Button>
      }
    />
  )
}
