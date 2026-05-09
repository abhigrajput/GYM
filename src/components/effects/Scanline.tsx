"use client"

export function Scanline() {
  return (
    <div
      className="fixed top-0 left-0 right-0 pointer-events-none z-[9999]"
      style={{
        height: "2px",
        background: "rgba(0,255,65,0.15)",
        animation: "scanline 8s linear infinite",
      }}
    />
  )
}
