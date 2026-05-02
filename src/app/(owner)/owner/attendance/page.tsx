export const dynamic = "force-dynamic"

import dyn from "next/dynamic"

const QRScanner = dyn(
  () => import("@/features/attendance/components/QRScanner").then((m) => m.QRScanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Load ho raha hai...</div>
    ),
  }
)

export default function OwnerAttendancePage() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Attendance Scanner</h1>
      <QRScanner />
    </div>
  )
}
