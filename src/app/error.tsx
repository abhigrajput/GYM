"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090F] p-4 text-[#F1F5F9]">
      <div className="w-full max-w-md rounded-2xl border border-[#1A2332] bg-[#0F1520] p-6 text-center">
        <p className="mb-1 text-xl font-bold text-[#0ECFB0]">IronIQ</p>
        <h1 className="text-xl font-semibold">Kuch toh gadbad hai bhai 😅 — Reload karo</h1>
        <p className="mt-2 text-xs text-[#94A3B8]">{error.message}</p>
        <button
          className="mt-4 rounded-xl bg-[#0ECFB0] px-4 py-2 font-semibold text-black"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </main>
  )
}
