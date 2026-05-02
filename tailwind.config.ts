import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
    },
  },
  plugins: [],
}

export default config
