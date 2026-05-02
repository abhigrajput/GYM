export function sanitizeText(input: string): string {
  return String(input || "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 500)
}

export function sanitizeNumber(input: any): number | null {
  const parsed = Number(input)
  return Number.isFinite(parsed) ? parsed : null
}
