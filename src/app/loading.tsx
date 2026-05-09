export default function GlobalLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#07090F] text-[#F1F5F9]">
      <div className="h-12 w-12 animate-pulse rounded-full bg-[#0ECFB0]/40" />
      <p className="mt-3 text-xl font-bold text-[#0ECFB0]">IronIQ</p>
      <p className="text-sm text-[#94A3B8]">Loading...</p>
    </main>
  )
}
