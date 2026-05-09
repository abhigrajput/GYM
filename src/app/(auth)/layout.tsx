import type { ReactNode } from "react"

export const dynamic = "force-dynamic"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 grid-bg">
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
