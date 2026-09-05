import { FaultScreen } from "@/components/fault-screen"
import { Button, buttonStyles } from "@/components/ui/button"
import Link from "next/link"

export default function CrawlNotFound() {
  return (
    <FaultScreen
      code="404"
      kicker="Crawl chýba"
      title={
        <>
          Sitemap crawl sa <em>nenašiel.</em>
        </>
      }
      body="Odkaz môže byť starý alebo sa výsledok už nezachoval."
      actions={
        <Button nativeButton={false} render={<Link href="/" />} style={buttonStyles.roundedNone}>
          Nové meranie
        </Button>
      }
    />
  )
}
