import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090F",
        surface: "#0F1520",
        navy: "#1A2332",
        accent: "#0ECFB0",
        "accent-hover": "#0AB89D",
        "text-primary": "#F1F5F9",
        "text-muted": "#94A3B8",
        danger: "#EF4444",
        warning: "#F59E0B",
        success: "#10B981",
        "bg-base": "#020408",
        "bg-deep": "#050B12",
        "accent-purple": "#7C3AED",
        "accent-cyan": "#06B6D4",
        "accent-pink": "#EC4899",
        glass: "rgba(255,255,255,0.05)",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        heading: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
}

export default config
