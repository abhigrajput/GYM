export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#07090F] px-4 py-10 text-[#F1F5F9] sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <section>
          <h2 className="text-xl font-semibold">Usage</h2>
          <p className="text-sm text-[#94A3B8]">Use IronIQ responsibly and do not misuse gym, AI, or attendance features.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="text-sm text-[#94A3B8]">All payments are processed via Razorpay under Indian regulations.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Refund policy</h2>
          <p className="text-sm text-[#94A3B8]">Refund requests are supported for 7-day period based on applicable plan policy.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Disclaimer</h2>
          <p className="text-sm text-[#94A3B8]">IronIQ ke workout plans medical advice nahi hain. Kisi bhi injury ke liye doctor se milein.</p>
        </section>
      </div>
    </main>
  )
}
