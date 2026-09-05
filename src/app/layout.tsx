import type { Metadata, Viewport } from "next"
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import * as stylex from "@stylexjs/stylex"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LocaleProvider } from "@/i18n/provider"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/config/site"
import { fonts } from "@/styles/tokens.stylex"
import "./globals.css"

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
})

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
})

const title = `${SITE_NAME} — ${SITE_TAGLINE}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: title,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "PageSpeed Insights",
    "Core Web Vitals",
    "Lighthouse",
    "LCP",
    "INP",
    "CLS",
    "TTFB",
    "analýza rýchlosti webu",
    "waterfall",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  category: "technology",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: "/",
    siteName: SITE_NAME,
    title,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE_DESCRIPTION,
  },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
}

export const maxDuration = 180

const bootScript = `try{
  var t=localStorage.getItem('sweep-theme');
  if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');
  var l=localStorage.getItem('sweep-locale');
  if(l==='sk'||l==='cs'||l==='en')document.documentElement.lang=l;
}catch(e){}`

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
  main: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    paddingBottom: "5rem",
  },
})

export default function RootLayout({ children }: LayoutProps<"/">) {
  const htmlSx = stylex.props(styles.html)
  return (
    <html
      lang="sk"
      className={[display.variable, body.variable, mono.variable, htmlSx.className].filter(Boolean).join(" ")}
      style={htmlSx.style}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body {...stylex.props(styles.body)}>
        <LocaleProvider>
          <TooltipProvider delay={200}>
            <div {...stylex.props(styles.shell)}>
              <SiteHeader />
              <main {...stylex.props(styles.main)}>{children}</main>
              <SiteFooter />
            </div>
          </TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
