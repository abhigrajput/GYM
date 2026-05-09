export type Lang = "en"

type Dict = Record<string, string | Record<string, string | Record<string, string>>>

const en: Dict = {
  nav: {
    dashboard: "Dashboard",
    workout: "Workout",
    progress: "Progress",
    nutrition: "Nutrition",
    leaderboard: "Leaderboard",
    settings: "Settings",
    checkin: "QR Check-in",
  },
  dashboard: {
    greeting: "Welcome back",
    gymHunt: "Find a gym or train from home",
    joinGym: "Join Gym",
    start: "Start",
    join: "Join",
    submit: "Submit",
    verify: "Verify",
    sendOtp: "Send OTP",
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
  },
  workout: {
    sets: "Sets",
    reps: "Reps",
    rest: "Rest",
    warmup: "Warm-up",
  },
}
export const translations: Record<Lang, Dict> = { en }

function getNested(obj: unknown, parts: string[]): string | undefined {
  let cur: unknown = obj
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === "string" ? cur : undefined
}

export function translate(lang: Lang, key: string): string {
  const parts = key.split(".")
  return (
    getNested(translations[lang], parts) ||
    getNested(translations.en, parts) ||
    key
  )
}
