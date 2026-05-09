"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import Link from "next/link"
import { Camera, Cpu, Mic, Leaf, Activity, BarChart3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"

export default function Home() {
  const lines = [
    "$ ironiq --scan gym",
    "> Scanning equipment...",
    "> Found: Bench Press x2",
    "> Found: Dumbbell Rack 5-40kg",
    "> Found: Squat Rack x1",
    "> Generating plan...",
    "> Plan ready: PUSH_PULL_LEGS_4DAY",
    "> Starting voice coach...",
  ]
  const [index, setIndex] = useState(0)
  const featureCards: Array<{ title: string; desc: string; Icon: LucideIcon }> = [
    { title: "EQUIPMENT SCANNER", desc: "Scan all equipment from a single image.", Icon: Camera },
    { title: "AI WORKOUT PLANS", desc: "Generate custom split plans instantly.", Icon: Cpu },
    { title: "VOICE COACH", desc: "Real-time voice prompts during workouts.", Icon: Mic },
    { title: "INDIAN NUTRITION", desc: "Budget-friendly nutrition recommendations.", Icon: Leaf },
    { title: "TRAFFIC CONTROL", desc: "Avoid equipment bottlenecks and crowding.", Icon: Activity },
    { title: "PROGRESS MATRIX", desc: "Track strength and body progress trends.", Icon: BarChart3 },
  ]
  useEffect(() => {
    const timer = setInterval(() => setIndex((v) => (v + 1 > lines.length ? 0 : v + 1)), 700)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white grid-bg">
      <Navbar />
      <div className="scanline" />
      <section className="mx-auto grid min-h-[90vh] max-w-7xl grid-cols-1 gap-8 px-6 pt-24 md:grid-cols-5">
        <div className="md:col-span-3">
          <h1 className="font-heading text-6xl md:text-8xl leading-none">IRON</h1>
          <h1 className="font-heading text-6xl md:text-8xl leading-none neon-text">IQ</h1>
          <p className="mt-2 font-mono text-xs tracking-[0.5em] text-[#00FF41]">AI GYM COACH</p>
          <p className="mt-8 max-w-2xl text-xl text-[#888888]">
            Upload your gym equipment. Get AI-powered workout plans. Voice coached in English. Built for Indian gyms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup"><GradientButton size="lg">JOIN FREE — MEMBERS</GradientButton></Link>
            <Link href="/signup"><GradientButton size="lg" variant="outline">REGISTER GYM — ₹2,000/MO</GradientButton></Link>
          </div>
          <div className="mt-10 space-y-2 font-mono text-sm text-[#00FF41]">
            <p>&gt; 2,847 ACTIVE MEMBERS</p>
            <p>&gt; 143 GYMS CONNECTED</p>
            <p>&gt; 98.2% SATISFACTION</p>
          </div>
        </div>
        <div className="md:col-span-2">
          <GlassCard className="p-5">
            <p className="mb-4 font-mono text-xs text-[#00FF41]">TERMINAL</p>
            <div className="space-y-1 font-mono text-sm text-[#00FF41]">
              {lines.slice(0, index).map((line) => (
                <p key={line}>{line}</p>
              ))}
              <span className="animate-pulse">_</span>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featureCards.map(({ title, desc, Icon }) => (
            <GlassCard key={title} className="p-5">
              <Icon className="h-5 w-5 text-[#00FF41]" />
              <h3 className="mt-3 text-lg font-heading text-[#00FF41]">{title}</h3>
              <p className="text-sm text-[#888888]">{desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GlassCard className="p-6">
            <p className="font-mono text-xs text-[#888888]">MEMBER</p>
            <p className="mt-2 font-heading text-4xl neon-text">FREE / FOREVER</p>
            <div className="mt-4 space-y-2 font-mono text-sm text-[#00FF41]">
              <p>&gt; AI workout plans</p>
              <p>&gt; Voice coach</p>
              <p>&gt; Progress tracking</p>
            </div>
          </GlassCard>
          <GlassCard className="p-6 shadow-[0_0_20px_rgba(0,255,65,0.3)]">
            <span className="inline-block border border-[#00FF41] px-2 py-1 text-xs text-[#00FF41]">14-DAY FREE TRIAL</span>
            <p className="mt-3 font-mono text-xs text-[#888888]">GYM OWNER</p>
            <p className="mt-2 font-heading text-4xl neon-text">₹2,000 / MONTH</p>
            <div className="mt-4 space-y-2 font-mono text-sm text-[#00FF41]">
              <p>&gt; Member management</p>
              <p>&gt; Analytics dashboard</p>
              <p>&gt; Billing automation</p>
            </div>
          </GlassCard>
        </div>
      </section>

      <footer className="border-t border-[#00FF41]/30 py-8 text-center text-xs tracking-[0.2em] text-[#00FF41]">
        <p>IRONIQ v2.0 // BUILT FOR BHARAT // ALL RIGHTS RESERVED</p>
        <div className="mt-3 flex justify-center gap-6">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/about">About</Link>
        </div>
      </footer>
    </main>
  )
}
