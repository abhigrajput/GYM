"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Dumbbell, Mic2, Users } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"

const features = [
  { title: "Equipment Scanner", description: "Gym ka setup upload karo, AI sab samjhega.", icon: Camera },
  { title: "AI Workout Plans", description: "Aaj ka plan beginner se advanced tak ready.", icon: Dumbbell },
  { title: "Hinglish Voice Coach", description: "Bhai, rep count aur form cues real-time suno.", icon: Mic2 },
  { title: "Gym Traffic Manager", description: "Peak time tracking for Dharwad, Nagpur style gyms.", icon: Users },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07090F] text-[#F1F5F9]">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-6 text-center"
        >
          <Badge variant="secondary" className="bg-[#1A2332] text-[#94A3B8]">
            Starting ₹299/month
          </Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            India Ka Pehla AI Gym Coach
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-[#94A3B8] sm:text-base">
            Upload your gym&apos;s equipment. Get a personalized workout plan. Built for Tier 2 & Tier 3 India.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-[#0ECFB0] text-black hover:bg-[#0AB89D]">
              <Link href="/signup">Join as Member</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-[#1A2332]">
              <Link href="/signup">Register Your Gym</Link>
            </Button>
          </div>
        </motion.section>

        <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
            >
              <Card className="h-full border-[#1A2332] bg-[#0F1520]">
                <feature.icon className="mb-3 h-6 w-6 text-[#0ECFB0]" />
                <h2 className="mb-2 text-lg font-semibold">{feature.title}</h2>
                <p className="text-sm text-[#94A3B8]">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </section>
      </div>
    </main>
  )
}
