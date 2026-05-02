export type Lang = "en" | "hi" | "kn" | "mr"

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
    greeting: "Kya haal hai",
    gymHunt: "Gym dhundo ya ghar pe workout karo",
    joinGym: "Gym join karo",
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

const hi: Dict = {
  nav: {
    dashboard: "डैशबोर्ड",
    workout: "वर्कआउट",
    progress: "प्रगति",
    nutrition: "पोषण",
    leaderboard: "लीडरबोर्ड",
    settings: "सेटिंग्स",
    checkin: "QR चेक-इन",
  },
  dashboard: {
    greeting: "क्या हाल है",
    gymHunt: "जिम ढूंढो या घर पर वर्कआउट करो",
    joinGym: "जिम ज्वाइन करो",
    start: "शुरू करो",
    join: "ज्वाइन",
    submit: "सबमिट",
    verify: "वेरीफाई",
    sendOtp: "OTP भेजो",
  },
  common: {
    loading: "लोड हो रहा...",
    error: "गड़बड़",
    success: "ठीक है",
    save: "सेव",
    cancel: "रद्द",
  },
  workout: {
    sets: "सेट",
    reps: "रैप",
    rest: "आराम",
    warmup: "वार्म-अप",
  },
}

const kn: Dict = {
  nav: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    workout: "ವರ್ಕೌಟ್",
    progress: "ಪ್ರಗತಿ",
    nutrition: "ಪೋಷಣೆ",
    leaderboard: "ಲೀಡರ್‌ಬೋರ್ಡ್",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    checkin: "QR ಚೆಕ್-ಇನ್",
  },
  dashboard: {
    greeting: "ಹೇಗಿದ್ದೀರಾ",
    gymHunt: "ಜಿಮ್ ಹುಡುಕಿ ಅಥವಾ ಮನೆಯಲ್ಲಿ ವರ್ಕೌಟ್",
    joinGym: "ಜಿಮ್ ಸೇರಿ",
    start: "ಆರಂಭಿಸಿ",
    join: "ಸೇರಿ",
    submit: "ಸಲ್ಲಿಸಿ",
    verify: "ಪರಿಶೀಲಿಸಿ",
    sendOtp: "OTP ಕಳುಹಿಸಿ",
  },
  common: {
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    error: "ದೋಷ",
    success: "ಯಶಸ್ಸು",
    save: "ಉಳಿಸಿ",
    cancel: "ರದ್ದು",
  },
  workout: {
    sets: "ಸೆಟ್‌ಗಳು",
    reps: "ರೆಪ್‌ಗಳು",
    rest: "ವಿಶ್ರಾಂತಿ",
    warmup: "ವಾರ್ಮ್-ಅಪ್",
  },
}

const mr: Dict = {
  nav: {
    dashboard: "डॅशबोर्ड",
    workout: "वर्कआउट",
    progress: "प्रगती",
    nutrition: "पोषण",
    leaderboard: "लीडरबोर्ड",
    settings: "सेटिंग्ज",
    checkin: "QR चेक-इन",
  },
  dashboard: {
    greeting: "कसे आहात",
    gymHunt: "जिम शोधा किंवा घरी वर्कआउट करा",
    joinGym: "जिममध्ये सामील व्हा",
    start: "सुरू करा",
    join: "सामील व्हा",
    submit: "सबमिट",
    verify: "सत्यापित करा",
    sendOtp: "OTP पाठवा",
  },
  common: {
    loading: "लोड होत आहे...",
    error: "त्रुटी",
    success: "यश",
    save: "जतन करा",
    cancel: "रद्द करा",
  },
  workout: {
    sets: "सेट",
    reps: "रेप",
    rest: "विश्रांती",
    warmup: "वॉर्म-अप",
  },
}

export const translations: Record<Lang, Dict> = { en, hi, kn, mr }

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
