export const dynamic = "force-dynamic"

import { Navbar } from "@/components/layout/navbar"

export default function AboutPage() {
  return (
    <main className="mesh-bg min-h-screen px-4 py-16 text-white">
      <Navbar />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-4xl font-bold">About IronIQ</h1>
        <p className="mt-6 text-white/70">
          IronIQ is India&apos;s AI-native gym platform — equipment scanning, workout planning, and Hinglish voice coaching in
          one place.
        </p>
      </div>
    </main>
  )
}
