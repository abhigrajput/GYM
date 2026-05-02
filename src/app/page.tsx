"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import Link from "next/link"
import {
  Dumbbell,
  Brain,
  Mic,
  BarChart3,
  Users,
  Zap,
  ChevronRight,
  Star,
  Shield,
  Globe,
  Camera,
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar"

export default function Home() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])

  const steps = [
    { title: "Gym Scan Karo", desc: "Equipment ek jagah dikhao — AI samajh lega.", icon: Camera, glow: "purple" as const },
    { title: "AI Plan Banata Hai", desc: "Teri body, teri machines — custom split.", icon: Brain, glow: "cyan" as const },
    { title: "Coach Karta Hai Hindi Mein", desc: "Voice + cues — bilkul dost style.", icon: Mic, glow: "pink" as const },
  ]

  const features = [
    { title: "Equipment Scanner AI", desc: "Ek photo mein poora gym analyze", icon: Zap },
    { title: "3-Level Progression", desc: "Beginner se Advanced tak", icon: BarChart3 },
    { title: "Hinglish Voice Coach", desc: "Bhai style mein coaching", icon: Mic },
    { title: "Indian Diet Plans", desc: "Dal-roti wala nutrition plan", icon: Star },
    { title: "Traffic Management", desc: "Gym mein rush avoid karo", icon: Users },
    { title: "Progress Tracking", desc: "Body transformation track karo", icon: Shield },
  ]

  return (
    <main className="mesh-bg min-h-screen overflow-x-hidden text-white">
      <Navbar />

      <section className="relative flex min-h-screen flex-col justify-center px-4 pb-24 pt-28 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-orb absolute -left-20 top-20 h-72 w-72 rounded-full bg-violet-600/40 blur-[100px]" />
          <div className="animate-orb-delay absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-500/30 blur-[110px]" />
          <div className="animate-orb-delay-2 absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-pink-500/25 blur-[90px]" />
        </div>

        <motion.div style={{ y }} className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300/90"
          >
            IronIQ 2.0
          </motion.p>
          <h1 className="font-heading text-[2.75rem] font-extrabold leading-tight sm:text-6xl md:text-7xl">
            <span className="block text-white">India Ka</span>
            <span className="gradient-text block">Pehla AI</span>
            <span className="block text-white">Gym Coach</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/65 sm:text-lg">
            Equipment scan karo. Plan pao. Hinglish mein coach karo. Free hai member ke liye.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <GradientButton size="lg">Abhi Join Karo — Free</GradientButton>
            </Link>
            <Link href="/signup">
              <GradientButton size="lg" variant="secondary">
                Gym Register Karo — ₹2,000/mo
              </GradientButton>
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { kpi: "2,847", label: "Members" },
              { kpi: "143", label: "Gyms" },
              { kpi: "98%", label: "Satisfaction" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
                <GlassCard className="p-4 text-center" glow={i === 0 ? "purple" : i === 1 ? "cyan" : "pink"}>
                  <p className="font-heading text-2xl font-bold text-white">{s.kpi}</p>
                  <p className="text-xs uppercase tracking-wider text-white/45">{s.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-heading text-center text-3xl font-bold md:text-4xl"
        >
          Kaise kaam karta hai
        </motion.h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, idx) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
              <GlassCard className="h-full p-6" glow={s.glow} hover>
                <s.icon className="mb-4 h-10 w-10 text-cyan-300" />
                <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/55">{s.desc}</p>
              </GlassCard>
              {idx < steps.length - 1 ? (
                <div className="hidden justify-center md:flex">
                  <ChevronRight className="my-2 h-6 w-6 text-violet-400/50" />
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-center text-3xl font-bold">Features</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="h-full p-5">
                <f.icon className="mb-3 h-6 w-6 text-violet-400" />
                <h3 className="font-heading font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/55">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-8" glow="cyan">
            <p className="text-sm uppercase tracking-wider text-white/50">Members</p>
            <p className="mt-2 font-heading text-4xl font-bold">₹0/forever</p>
            <p className="mt-1 text-emerald-400">Free hamesha</p>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>• AI workout plans</li>
              <li>• Voice coach</li>
              <li>• Progress + leaderboard</li>
            </ul>
          </GlassCard>
          <div className="gradient-border rounded-2xl p-[1px]">
            <GlassCard className="border-0 p-8 shadow-none" glow="purple" animate={false}>
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">14-day trial</span>
              <p className="mt-3 text-sm uppercase tracking-wider text-white/50">Gym Owner</p>
              <p className="mt-2 font-heading text-4xl font-bold">₹2,000/month</p>
              <ul className="mt-6 space-y-2 text-sm text-white/70">
                <li>• Members + analytics</li>
                <li>• Equipment insights</li>
                <li>• Billing & QR check-in</li>
              </ul>
              <Link href="/signup" className="mt-8 inline-block">
                <GradientButton className="w-full sm:w-auto">Start Trial</GradientButton>
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <Globe className="mx-auto mb-4 h-10 w-10 text-cyan-400" />
        <h2 className="font-heading text-2xl font-bold">Language Support</h2>
        <p className="mt-4 text-lg text-white/70">
          English · हिंदी · ಕನ್ನಡ · मराठी — <span className="text-white">Apni bhasha mein use karo</span>
        </p>
      </section>

      <footer className="border-t border-white/10 py-12 text-center text-sm text-white/45">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-violet-400" />
            <span className="font-heading font-bold text-white">IronIQ</span>
            <span>— India Ka AI Gym Coach</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
          </div>
        </div>
        <p className="mt-6">Made with ❤️ for Bharat</p>
      </footer>
    </main>
  )
}
