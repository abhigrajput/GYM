import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 mesh-bg" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 animate-orb rounded-full bg-violet-600/35 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 animate-orb-delay rounded-full bg-cyan-500/30 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 h-64 w-64 animate-orb-delay-2 rounded-full bg-pink-500/25 blur-[90px]" />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
