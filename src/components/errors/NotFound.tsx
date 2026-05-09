import Link from "next/link"

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090F] p-4 text-[#F1F5F9]">
      <div className="w-full max-w-md rounded-2xl border border-[#1A2332] bg-[#0F1520] p-6 text-center">
        <p className="mb-1 text-xl font-bold text-[#0ECFB0]">IronIQ</p>
        <h1 className="text-2xl font-bold">This page was not found.</h1>
        <Link
          href="/member/dashboard"
          className="mt-4 inline-block rounded-xl bg-[#0ECFB0] px-4 py-2 font-semibold text-black"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
