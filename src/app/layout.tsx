import type { Metadata, Viewport } from "next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import { OfflineBanner } from "@/features/offline/components/OfflineBanner"
import { Scanline } from "@/components/effects/Scanline"
import "./globals.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "IronIQ",
  description: "India Ka Pehla AI Gym Coach",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#020408",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020408" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="IronIQ" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-full antialiased bg-black text-white">
        <Scanline />
        <OfflineBanner />
        <Providers>{children}</Providers>
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  )
}
