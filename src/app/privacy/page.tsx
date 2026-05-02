export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#07090F] px-4 py-10 text-[#F1F5F9] sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <section>
          <h2 className="text-xl font-semibold">Data collected</h2>
          <p className="text-sm text-[#94A3B8]">We collect account, workout, attendance, and progress data to run IronIQ features.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">How used</h2>
          <p className="text-sm text-[#94A3B8]">Data is used to personalize workouts, track fitness progress, and improve coaching quality.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Third parties</h2>
          <p className="text-sm text-[#94A3B8]">Supabase (auth/database/storage), Anthropic (AI), Razorpay (payments).</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="text-sm text-[#94A3B8]">privacy@ironiq.in</p>
        </section>
      </div>
    </main>
  )
}
